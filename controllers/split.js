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
exports.split = exports.splitConversation = void 0;
const web3_js_1 = require("@solana/web3.js");
const web3 = __importStar(require("@solana/web3.js"));
const User_1 = __importDefault(require("../models/User"));
const anchor_1 = require("@project-serum/anchor");
const common_sol_utils_1 = require("@moralisweb3/common-sol-utils");
const bs58_1 = __importDefault(require("bs58"));
require("dotenv/config");
const moralis_1 = __importDefault(require("moralis"));
const connection = new web3.Connection(process.env.RPC_URL);
const fetchSolAmount = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield moralis_1.default.SolApi.account.getBalance({
        address,
        network: common_sol_utils_1.SolNetwork.MAINNET,
    });
    return response.toJSON();
});
const getSPL = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield moralis_1.default.SolApi.account.getSPL({
        address,
        network: common_sol_utils_1.SolNetwork.MAINNET,
    });
    return response.toJSON();
});
const splitConversation = (conversation, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = new anchor_1.Wallet(web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(user.wallet || "")));
    yield ctx.reply("Enter Token address to split:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
    });
    const { msg: { text: address }, } = yield conversation.waitFor("message");
    yield ctx.reply("Enter the amount to split:", {
        parse_mode: "HTML",
    });
    let { msg: { text: amount }, } = yield conversation.waitFor("message");
    yield ctx.reply("Enter Wallet amount to split:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
    });
    const { msg: { text: split_amount }, } = yield conversation.waitFor("message");
    for (var i = 0; i < parseInt(split_amount); i++) {
        yield ctx.reply("Enter the wallets address to split:", {
            parse_mode: "HTML",
        });
        let { msg: { text: split_address }, } = yield conversation.waitFor("message");
    }
    yield exports.split;
});
exports.splitConversation = splitConversation;
const split = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.exit();
    yield ctx.conversation.reenter("split");
    yield ctx.answerCallbackQuery();
});
exports.split = split;
