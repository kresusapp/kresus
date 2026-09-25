"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = getLogs;
exports.clearLogs = clearLogs;
const node_fs_1 = __importDefault(require("node:fs"));
const node_util_1 = require("node:util");
const helpers_1 = require("../helpers");
const models_1 = require("../models");
const helpers_2 = require("./helpers");
const readFile = (0, node_util_1.promisify)(node_fs_1.default.readFile);
const writeFile = (0, node_util_1.promisify)(node_fs_1.default.writeFile);
async function getLogs(req, res) {
    try {
        const { id: userId } = req.user;
        const user = await models_1.User.find(userId);
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin)) {
            res.status(403).end();
            return;
        }
        let logs = await readFile(process.kresus.logFilePath, 'utf-8');
        const sensitiveKeywords = new Set();
        const passwords = new Set();
        const accounts = await models_1.Account.all(userId);
        accounts.forEach(acc => {
            if (acc.accessId) {
                sensitiveKeywords.add(String(acc.accessId));
            }
            if (acc.vendorAccountId) {
                sensitiveKeywords.add(acc.vendorAccountId);
            }
            if (acc.iban) {
                sensitiveKeywords.add(acc.iban);
            }
        });
        const accesses = await models_1.Access.all(userId);
        accesses.forEach(acc => {
            acc.fields.forEach(field => {
                if (field.name === 'password') {
                    passwords.add(field.value);
                }
                else if (field.name === 'login') {
                    sensitiveKeywords.add(field.value);
                }
            });
        });
        if (process.kresus.smtpUser) {
            sensitiveKeywords.add(process.kresus.smtpUser);
        }
        if (process.kresus.smtpPassword) {
            passwords.add(process.kresus.smtpPassword);
        }
        logs = (0, helpers_2.obfuscateKeywords)(logs, sensitiveKeywords);
        logs = (0, helpers_2.obfuscatePasswords)(logs, passwords);
        logs = (0, helpers_2.obfuscateEmails)(logs);
        res.status(200).type('text/plain').send(logs);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, `when reading logs from ${process.kresus.logFilePath}`);
    }
}
async function clearLogs(req, res) {
    try {
        const { id: userId } = req.user;
        const user = await models_1.User.find(userId);
        if (!(user === null || user === void 0 ? void 0 : user.isAdmin)) {
            res.status(403).end();
            return;
        }
        await writeFile(process.kresus.logFilePath, '');
        res.status(200).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when clearing logs');
    }
}
