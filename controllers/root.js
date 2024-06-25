"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.help = exports.settings = exports.start = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const bs58_1 = __importDefault(require("bs58"));
const User_1 = __importDefault(require("../models/User"));
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const id = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id;
    const referral = (_d = (_c = (_b = ctx.message) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.replace("/start", "")) === null || _d === void 0 ? void 0 : _d.trim();
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        const newWallet = web3.Keypair.generate();
        user = new User_1.default({
            user: id,
            wallet: bs58_1.default.encode(newWallet.secretKey),
        });
        yield user.save();
    }
    const wallet = web3.Keypair.fromSecretKey(bs58_1.default.decode((_e = user.wallet) !== null && _e !== void 0 ? _e : ""));
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const balance = yield connection.getBalance(wallet.publicKey);
    console.log(balance);
    console.log(wallet);
    console.log(user.user);
    yield ctx.reply(`
        <b>Welcome to Telegram Bot</b>\n\nThe fastest bot to trade any coin on Raydium.\n\n${balance === 0
        ? "You currently have no SOL balance. To get started with trading, send some SOL to your Bot wallet address:"
        : `Your balance is <b>${balance / web3.LAMPORTS_PER_SOL}</b> SOL. You can start trading with your wallet address:`} \n\n<code>${wallet.publicKey}</code>`, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Wallet", callback_data: "wallet" },
                    {
                        text: "Split Token",
                        callback_data: "split_token",
                    },
                ],
                [
                    { text: "Buy", callback_data: "buy" },
                    { text: "Sell", callback_data: "sell" },
                ],
                [{ text: "Refresh", callback_data: "refresh" }],
            ],
        },
    });
});
exports.start = start;
const settings = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        const newWallet = web3.Keypair.generate();
        user = new User_1.default({
            user: id,
            wallet: bs58_1.default.encode(newWallet.secretKey),
        });
        yield user.save();
    }
    //@ts-ignore
    yield ctx.reply(...settingsContent(user));
});
exports.settings = settings;
const help = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(`Boost Your Trading Profits with the Fastest PUMP.FUN Telegram Bot.\nhttps://t.me/LynxBotHelp`, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [[{ text: "Close", callback_data: "cancel" }]],
        },
    });
});
exports.help = help;
const chat = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply(`CHAT`, {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [[{ text: "Close", callback_data: "cancel" }]],
        },
    });
});
exports.chat = chat;
