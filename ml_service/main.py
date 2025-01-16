from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd
import re
import sqlite3
from typing import Dict, Tuple, Optional

app = FastAPI()

# Load the model
try:
    with open('slowflux_model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    raise RuntimeError("Error: slowflux_model.pkl not found. Make sure the model is saved.")

class DigInput(BaseModel):
    dig_output: str

class AnalysisResult(BaseModel):
    prediction: str
    metrics: Dict[str, float]
    domain: str

def is_whitelisted(domain: str) -> bool:
    try:
        conn = sqlite3.connect('../slowflux.db')
        cursor = conn.cursor()
        cursor.execute('SELECT 1 FROM whitelisted_domains WHERE domain = ?', (domain,))
        result = cursor.fetchone() is not None
        conn.close()
        return result
    except Exception as e:
        print(f"Error checking whitelist: {e}")
        return False

def extract_features_from_dig_output(dig_output: str) -> Tuple[Optional[Dict[str, float]], Optional[str]]:
    num_a_records = 0
    min_ttl = np.inf
    num_ns_records = 0
    domain = None

    # Extract domain name
    for line in dig_output.splitlines():
        match_question = re.search(r';([\w.-]+)\.\s+IN\s+A', line)
        if match_question:
            domain = match_question.group(1)
            break
        match_answer = re.search(r'([\w.-]+)\.\s+\d+\s+IN\s+A\s+', line)
        if match_answer:
            domain = match_answer.group(1)
            break

    if not domain:
        return None, "Error: Could not extract domain name from dig output."

    # Extract A records and TTLs
    a_records = []
    ttls = []
    for line in dig_output.splitlines():
        match = re.search(rf'^{domain}\.\s*(\d+)\s*IN\s*A\s*([\d.]+)', line)
        if match:
            try:
                ttl = int(match.group(1))
                ttls.append(ttl)
                a_records.append(match.group(2))
            except ValueError:
                pass

    num_a_records = len(a_records)
    if ttls:
        min_ttl = min(ttls)
    else:
        min_ttl = np.nan

    # Extract NS records
    ns_records = []
    for line in dig_output.splitlines():
        match = re.search(rf'^{domain}\.\s*\d+\s*IN\s*NS\s*([\w.-]+)\.?', line)
        if match:
            ns_records.append(match.group(1).rstrip('.'))

    num_ns_records = len(ns_records)

    return {
        'domain': domain,
        'Number of A Records': num_a_records,
        'Minimum TTL Value': min_ttl,
        'Number of NS Records': num_ns_records,
        'Domain Length': len(domain) if domain else 0,
    }, None

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_domain(input_data: DigInput):
    features_dict, error = extract_features_from_dig_output(input_data.dig_output)

    if error:
        raise HTTPException(status_code=400, detail=error)

    if not features_dict or any(value is np.nan or value is np.inf for key, value in features_dict.items() if key != 'domain'):
        raise HTTPException(status_code=400, detail="Could not extract necessary information from dig output.")

    # Check whitelist before prediction
    domain = features_dict['domain']
    if is_whitelisted(domain):
        return AnalysisResult(
            prediction="benign",
            metrics={
                "aRecords": features_dict['Number of A Records'],
                "ttlValue": features_dict['Minimum TTL Value'],
                "nsRecords": features_dict['Number of NS Records'],
                "domainLength": features_dict['Domain Length']
            },
            domain=domain
        )

    # Proceed with normal prediction for non-whitelisted domains
    feature_order = ['Number of A Records', 'Minimum TTL Value', 'Number of NS Records', 'Domain Length']
    input_df = pd.DataFrame([features_dict]).loc[:, feature_order]

    prediction = model.predict(input_df)[0]

    return AnalysisResult(
        prediction="active" if prediction == 1 else "benign",
        metrics={
            "aRecords": features_dict['Number of A Records'],
            "ttlValue": features_dict['Minimum TTL Value'],
            "nsRecords": features_dict['Number of NS Records'],
            "domainLength": features_dict['Domain Length']
        },
        domain=domain
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

