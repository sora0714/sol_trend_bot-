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
exports.withdraw = exports.withdrawConversation = exports.deposit = exports.refresh = exports.exportPrvkeyConfirm = exports.exportPrvkey = exports.resetConfirm = exports.reset = exports.start = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const anchor = __importStar(require("@coral-xyz/anchor"));
const User_1 = __importDefault(require("../models/User"));
const bs58_1 = __importDefault(require("bs58"));
const walletCardContent = (wallet, balance) => {
    return [
        `<b>Your Wallet:</b>\n\nAddress: <code>${wallet.publicKey}</code>\nBalance: <b>${balance / web3.LAMPORTS_PER_SOL}</b> SOL\n\n Tap to copy the address and send SOL to deposit.`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "View on Solscan",
                            url: `https://solscan.io/address/${wallet.publicKey}`,
                        },
                        { text: "Close", callback_data: "cancel" },
                    ],
                    [
                        { text: "Deposit SOL", callback_data: "wallet_deposit" },
                        {
                            text: "Withdraw SOL",
                            callback_data: "wallet_withdraw",
                        },
                    ],
                    [
                        { text: "Reset Wallet", callback_data: "wallet_reset" },
                        {
                            text: "Export Private Key",
                            callback_data: "wallet_export",
                        },
                    ],
                    [{ text: "Refresh", callback_data: "wallet_refresh" }],
                ],
            },
        },
    ];
};
const start = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = web3.Keypair.fromSecretKey(bs58_1.default.decode((_b = user.wallet) !== null && _b !== void 0 ? _b : ""));
    const connection = new web3.Connection(web3.clusterApiUrl("devnet"));
    const balance = yield connection.getBalance(wallet.publicKey);
    console.log(balance);
    //@ts-ignore
    yield ctx.reply(...walletCardContent(wallet, balance));
    yield ctx.answerCallbackQuery();
});
exports.start = start;
const reset = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Are you sure you want to reset your <b>Bot Wallet</b>?\n\n<b>WARNING: This action is irreversible!</b>\n\nBot will generate a new wallet for you and discard your old one.", {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Cancel", callback_data: "cancel" },
                    {
                        text: "Confirm",
                        callback_data: "wallet_reset_confirm",
                    },
                ],
            ],
        },
    });
    yield ctx.answerCallbackQuery();
});
exports.reset = reset;
const resetConfirm = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = web3.Keypair.generate();
    user.wallet = bs58_1.default.encode(wallet.secretKey);
    yield user.save();
    yield ctx.reply(`<b>Success:</b> Your new wallet is:\n\n<code>${wallet.publicKey}</code>\n\nYou can now send SOL to this address to deposit into your new wallet. Press refresh to see your new wallet.`, {
        parse_mode: "HTML",
    });
    yield ctx.answerCallbackQuery();
});
exports.resetConfirm = resetConfirm;
const exportPrvkey = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Are you sure you want to export your <b>Private Key</b>?", {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Cancel", callback_data: "cancel" },
                    {
                        text: "Confirm",
                        callback_data: "wallet_export_confirm",
                    },
                ],
            ],
        },
    });
    yield ctx.answerCallbackQuery();
});
exports.exportPrvkey = exportPrvkey;
const exportPrvkeyConfirm = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    yield ctx.reply(`Your <b>Private Key</b> is:
        <code>${user.wallet}</code>

        You can now i.e. import the key into a wallet like Solflare. (tap to copy).
        Delete this message once you are done.`, {
        parse_mode: "HTML",
    });
    yield ctx.answerCallbackQuery();
});
exports.exportPrvkeyConfirm = exportPrvkeyConfirm;
const refresh = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = web3.Keypair.fromSecretKey(bs58_1.default.decode((_b = user.wallet) !== null && _b !== void 0 ? _b : ""));
    const connection = new web3.Connection(
    // "https://basic.ligmanode.com/v1/92077c6d-9a1d-4a2f-b65e-0ae3746c74a5/"
    web3.clusterApiUrl("devnet"));
    const balance = yield connection.getBalance(wallet.publicKey);
    console.log(balance);
    try {
        // @ts-ignore
        yield ctx.editMessageText(...walletCardContent(wallet, balance));
    }
    catch (err) {
        console.log(err);
    }
    yield ctx.answerCallbackQuery();
});
exports.refresh = refresh;
const deposit = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = web3.Keypair.fromSecretKey(bs58_1.default.decode((_b = user.wallet) !== null && _b !== void 0 ? _b : ""));
    yield ctx.reply(`To deposit send SOL to below address:\n\n<code>${wallet.publicKey}</code>`, {
        parse_mode: "HTML",
    });
    yield ctx.answerCallbackQuery();
});
exports.deposit = deposit;
const withdrawConversation = (conversation, ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const id = (_a = ctx.update.callback_query) === null || _a === void 0 ? void 0 : _a.from.id;
    let user = yield User_1.default.findOne({ user: id });
    if (!user) {
        return;
    }
    const wallet = web3.Keypair.fromSecretKey(bs58_1.default.decode((_b = user.wallet) !== null && _b !== void 0 ? _b : ""));
    const connection = new web3.Connection(
    //   "https://basic.ligmanode.com/v1/92077c6d-9a1d-4a2f-b65e-0ae3746c74a5/"
    web3.clusterApiUrl("devnet"));
    const balance = yield connection.getBalance((_c = wallet === null || wallet === void 0 ? void 0 : wallet.publicKey) !== null && _c !== void 0 ? _c : "");
    yield ctx.reply(`<b>Balance</b>: ${balance / web3.LAMPORTS_PER_SOL} SOL\n\nEnter <b>SOL</b> amount to withdraw:`, {
        parse_mode: "HTML",
    });
    let amount;
    do {
        const { msg } = yield conversation.waitFor("message");
        amount = msg.text;
        if (amount &&
            !isNaN(Number(amount)) &&
            !isNaN(parseFloat(amount)) &&
            parseFloat(amount) > 0 &&
            parseFloat(amount) * web3.LAMPORTS_PER_SOL <= balance - 5000) {
            break;
        }
        yield ctx.reply("<i>Invalid SOL amount</i>", { parse_mode: "HTML" });
    } while (true);
    yield ctx.reply("Enter recipient address:");
    let recipient;
    do {
        const { msg: { text }, } = yield conversation.waitFor("message");
        try {
            recipient = new web3.PublicKey(text !== null && text !== void 0 ? text : "");
            break;
        }
        catch (err) {
            console.log(err);
            yield ctx.reply("<i>Invalid recipient address</i>", {
                parse_mode: "HTML",
            });
        }
    } while (true);
    yield ctx.reply(`<i>Withdrawing SOL...</i>`, {
        parse_mode: "HTML",
    });
    const latestBlock = yield connection
        .getLatestBlockhash("finalized")
        .then((e) => e.blockhash);
    console.log("latest block:", latestBlock);
    try {
        const txs = new web3.VersionedTransaction(new web3.TransactionMessage({
            payerKey: wallet.publicKey,
            recentBlockhash: latestBlock,
            instructions: [
                web3.ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: user.fee * web3.LAMPORTS_PER_SOL,
                }),
                web3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: recipient,
                    lamports: Number(amount) * web3.LAMPORTS_PER_SOL,
                }),
            ],
        }).compileToV0Message());
        const signed = yield new anchor.Wallet(wallet).signTransaction(txs);
        const rawTx = signed.serialize();
        let hash;
        for (let i = 0; i < 1; i++) {
            try {
                hash = yield connection.sendRawTransaction(rawTx, {
                    skipPreflight: true,
                });
                const latestBlock = yield connection.getLatestBlockhash("finalized");
                connection
                    .confirmTransaction({
                    blockhash: latestBlock.blockhash,
                    lastValidBlockHeight: latestBlock.lastValidBlockHeight,
                    signature: hash,
                }, "confirmed")
                    .then((res) => __awaiter(void 0, void 0, void 0, function* () {
                    if (!res.value.err) {
                        yield ctx.reply(`Transaction submitted\nhttps://solscan.io/tx/${hash}`);
                        //await sleep(1000);
                        yield ctx.reply("Transaction Successful");
                    }
                    else {
                        yield ctx.reply("<i>Failed to withdraw SOL</i>", {
                            parse_mode: "HTML",
                        });
                    }
                }));
                // await connection.confirmTransaction(hash, 'confirmed')
            }
            catch (err) {
                console.log(err);
                yield ctx.reply("<i>Failed to withdraw SOL</i>", {
                    parse_mode: "HTML",
                });
            }
        }
    }
    catch (err) {
        console.log(err);
        yield ctx.reply("<i>Failed to withdraw SOL</i>", { parse_mode: "HTML" });
    }
});
exports.withdrawConversation = withdrawConversation;
const withdraw = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.exit();
    yield ctx.conversation.reenter("wallet-withdraw");
    yield ctx.answerCallbackQuery();
});
exports.withdraw = withdraw;
