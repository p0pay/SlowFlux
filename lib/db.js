"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDb = initializeDb;
exports.createUser = createUser;
exports.verifyUser = verifyUser;
var sqlite3 = require("sqlite3");
var sqlite_1 = require("sqlite");
var bcrypt_1 = require("bcrypt");
// Extend the database initialization
function initializeDb() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sqlite_1.open)({
                        filename: './slowflux.db',
                        driver: sqlite3.Database
                    })];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, db.exec("\n    CREATE TABLE IF NOT EXISTS users (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      username TEXT UNIQUE NOT NULL,\n      password TEXT NOT NULL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    CREATE TABLE IF NOT EXISTS analysis_history (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      user_id INTEGER NOT NULL,\n      domain TEXT NOT NULL,\n      dig_output TEXT NOT NULL,\n      result TEXT NOT NULL,\n      a_records INTEGER NOT NULL,\n      ttl_value INTEGER NOT NULL,\n      ns_records INTEGER NOT NULL,\n      domain_length INTEGER NOT NULL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (user_id) REFERENCES users(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS feedback (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      user_id INTEGER NOT NULL,\n      analysis_id INTEGER NOT NULL,\n      type TEXT NOT NULL,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (user_id) REFERENCES users(id),\n      FOREIGN KEY (analysis_id) REFERENCES analysis_history(id)\n    );\n\n    CREATE TABLE IF NOT EXISTS whitelisted_domains (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      domain TEXT UNIQUE NOT NULL,\n      reason TEXT,\n      created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n    );\n\n    -- Insert default whitelisted domains\n    INSERT OR IGNORE INTO whitelisted_domains (domain, reason) VALUES \n    ('google.com', 'Legitimate load balancer configuration');\n  ")];
                case 2:
                    _a.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
function createUser(username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var db, hashedPassword, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeDb()];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, (0, bcrypt_1.hash)(password, 10)];
                case 2:
                    hashedPassword = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword])];
                case 4:
                    _a.sent();
                    return [2 /*return*/, true];
                case 5:
                    error_1 = _a.sent();
                    if (error_1.code === 'SQLITE_CONSTRAINT') {
                        return [2 /*return*/, false]; // Username already exists
                    }
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function verifyUser(username, password) {
    return __awaiter(this, void 0, void 0, function () {
        var db, user, valid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initializeDb()];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, db.get('SELECT * FROM users WHERE username = ?', username)];
                case 2:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, bcrypt_1.compare)(password, user.password)];
                case 3:
                    valid = _a.sent();
                    if (!valid) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, { id: user.id, username: user.username }];
            }
        });
    });
}
