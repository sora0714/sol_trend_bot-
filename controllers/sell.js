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
exports.sell = exports.sellConversation = void 0;
const web3_js_1 = require("@solana/web3.js");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const web3_js_2 = require("@solana/web3.js");
const web3 = __importStar(require("@solana/web3.js"));
const User_1 = __importDefault(require("../models/User"));
const anchor_1 = require("@project-serum/anchor");
const swapConfig_1 = require("./Raydium-swap/swapConfig"); // Import the configuration
const bs58_1 = __importDefault(require("bs58"));
require("dotenv/config");
const moralis_1 = __importDefault(require("moralis"));
const connection = new web3.Connection(process.env.RPC_URL);
const fetchSolAmount = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield moralis_1.default.SolApi.account.getBalance({
        address,
        network: /*SolNetwork.DEVNET*/ "devnet",
    });
    return response.toJSON();
});
const getSPL = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield moralis_1.default.SolApi.account.getSPL({
        address,
        network: /*SolNetwork.DEVNET*/ "devnet",
    });
    return response.toJSON();
});
const sellConversation = (conversation, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = new anchor_1.Wallet(web3_js_2.Keypair.fromSecretKey(bs58_1.default.decode(user.wallet || "")));
    yield ctx.reply("Enter Token address to sell:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
    });
    const { msg: { text: address }, } = yield conversation.waitFor("message");
    yield ctx.reply("Enter the amount to sell:", {
        parse_mode: "HTML",
    });
    let { msg: { text: amount }, } = yield conversation.waitFor("message");
    console.log(address, amount);
    if (amount == undefined)
        amount = "0";
    const solCurrentAmount = yield fetchSolAmount(wallet.publicKey.toString());
    const spls = yield getSPL(wallet.publicKey.toString());
    console.log(solCurrentAmount, spls);
    const curToken = spls.find((splToken) => {
        return splToken.mint == address && parseFloat(splToken.amount) > 0;
    });
    if (!curToken) {
        ctx.reply(`<i>Insufficient current Token amount</i>`, {
            parse_mode: "HTML",
        });
        return;
    }
    let swapConfig = swapConfig_1.swapConfig;
    swapConfig.tokenAAddress = address || "";
    swapConfig.tokenBAddress = "So11111111111111111111111111111111111111112";
    if (parseFloat(solCurrentAmount.solana) >= 0.0004 &&
        parseFloat(curToken.amount) >= parseFloat(amount))
        swapConfig.tokenBAmount = parseFloat(amount || "0");
    else {
        yield ctx.reply(`<i>Insufficient current Token amount</i>`, {
            parse_mode: "HTML",
        });
        return;
    }
    console.log(swapConfig.tokenBAmount);
    const swap = (swapConfig, quoteResponse) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Swapping ${swapConfig.tokenAAmount} of ${swapConfig.tokenAAddress} for ${swapConfig.tokenBAddress}...`);
        try {
            const { swapTransaction } = yield (yield (0, cross_fetch_1.default)("https://quote-api.jup.ag/v6/swap", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quoteResponse,
                    userPublicKey: wallet.publicKey.toString(),
                    wrapAndUnwrapSol: true,
                }),
            })).json();
            const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
            var transaction = web3_js_1.VersionedTransaction.deserialize(swapTransactionBuf);
            // sign the transaction
            transaction.sign([wallet.payer]);
            const rawTransaction = transaction.serialize();
            const txid = yield connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
                maxRetries: 2,
            });
            console.log("tx: ", txid);
            yield connection.confirmTransaction(txid);
            yield ctx.reply(`https://solscan.io/tx/${txid}`);
            console.log(`https://solscan.io/tx/${txid}`);
        }
        catch (err) {
            console.error(err);
            yield ctx.reply("please try again. Solana network is busy right now.");
        }
    });
    yield ctx.reply("Just a sec...");
    console.log(`https://quote-api.jup.ag/v6/quote?inputMint=${swapConfig.tokenBAddress}&outputMint=${swapConfig.tokenBAddress}&amount=${swapConfig.tokenBAmount * 10 ** curToken.decimals}`);
    const quoteResponse = yield (yield (0, cross_fetch_1.default)(`https://quote-api.jup.ag/v6/quote?inputMint=${swapConfig.tokenBAddress}&outputMint=${swapConfig.tokenBAddress}&amount=${swapConfig.tokenBAmount * 10 ** curToken.decimals}`)).json();
    console.log(quoteResponse);
    yield swap(swapConfig, quoteResponse);
});
exports.sellConversation = sellConversation;
const sell = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.exit();
    yield ctx.conversation.reenter("sell");
    yield ctx.answerCallbackQuery();
});
exports.sell = sell;
