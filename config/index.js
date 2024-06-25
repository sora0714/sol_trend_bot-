"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.TG_BOT_TOKEN) {
    throw Error("INPUT YOUR TELEGRAM BOT TOKEN");
}
exports.default = {
    MONGO_URI: (_a = process.env.MONGO_URI) !== null && _a !== void 0 ? _a : "",
    TG_BOT_TOKEN: (_b = process.env.TG_BOT_TOKEN) !== null && _b !== void 0 ? _b : "",
};
