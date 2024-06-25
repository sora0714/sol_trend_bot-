import { CallbackQueryContext, Context } from "grammy";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";

import * as web3 from "@solana/web3.js";
import { Connection, Keypair } from "@solana/web3.js";

import { Wallet } from "@project-serum/anchor";
import { Transaction, VersionedTransaction } from "@solana/web3.js";

import base58 from "bs58";
import fetch from "cross-fetch";

import { swapConfig as config } from "./Raydium-swap/swapConfig"; // Import the configuration
import { SolNetwork } from "@moralisweb3/common-sol-utils";
import "dotenv/config";
import Moralis from "moralis";

import User from "../models/User";


type CusContext = Context & ConversationFlavor;
type CusConversation = Conversation<CusContext>;


const connection = new web3.Connection(process.env.RPC_URL as string, {
    confirmTransactionInitialTimeout: 120000, // 60 seconds
});

const fetchSolAmount = async (address: string) => {
    const response = await Moralis.SolApi.account.getBalance({
        address,
        network: SolNetwork.DEVNET,
    });
    return response.toJSON();
};

export const buyConversation = async (
    conversation: CusConversation,
    ctx: CusContext
    ) => {
    const id = ctx.update.callback_query?.from.id;

    let user = await User.findOne({ user: id });

    if (!user) {
        return;
    }
    const wallet = new Wallet(
        Keypair.fromSecretKey(base58.decode(user.wallet || "")) 
    );
    await ctx.reply("Enter Token address to buy:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
    });
    const {
        msg: { text: address },
    } = await conversation.waitFor("message");
    await ctx.reply("Enter the amount to buy:", {
        parse_mode: "HTML",
    });
    let {
        msg: { text: amount },
    } = await conversation.waitFor("message");

    console.log(address, amount);

    /*if (user.autobuy && user.autobuy?.actived && user.autobuy?.amount) {
        amount = user.autobuy?.amount ? user.autobuy?.amount.toString() : "1000";
    }*/
    const solCurrentAmount = await fetchSolAmount(wallet.publicKey.toString());
    let swapConfig = config;
    swapConfig.tokenBAddress = address || "";
    swapConfig.tokenAAddress = "So11111111111111111111111111111111111111112";
    if (parseFloat(solCurrentAmount.solana) >= parseFloat(amount || "0") + 0.0004)
        swapConfig.tokenAAmount = parseFloat(amount || "0");
        else {
        await ctx.reply(`<i>Insufficient SOL amount</i>`, { parse_mode: "HTML" });
        return;
    }

    const swap = async (swapConfig: any, quoteResponse: any) => {
        console.log(
            `Swapping ${swapConfig.tokenAAmount} of ${swapConfig.tokenAAddress} for ${swapConfig.tokenBAddress}...`
        );
    try {
        const { swapTransaction } = await (
            await fetch("https://quote-api.jup.ag/v6/swap", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                quoteResponse,
                userPublicKey: wallet.publicKey.toString(),
                wrapAndUnwrapSol: true,
                }),
            })
        ).json();

        const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
        var transaction = VersionedTransaction.deserialize(swapTransactionBuf);

        // sign the transaction
        transaction.sign([wallet.payer]);
        console.log(wallet.payer);
        console.log("check");
        const rawTransaction = transaction.serialize();
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 1,
            });
            console.log("tx: ", txid);
            await connection.confirmTransaction(txid);
            await ctx.reply(`https://solscan.io/tx/${txid}`);
            console.log(`https://solscan.io/tx/${txid}`);
        } catch (err) {
            console.error(err);
            await ctx.reply("please try again. Solana network is busy right now.");
        }
    };
    await ctx.reply("Just a second...");
    console.log(
        `https://quote-api.jup.ag/v6/quote?inputMint=${
            swapConfig.tokenAAddress
        }&outputMint=${swapConfig.tokenBAddress}&amount=${
            swapConfig.tokenAAmount * 10 ** 9
        }`
    );
    const quoteResponse = await (
    await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${
            swapConfig.tokenAAddress
        }&outputMint=${swapConfig.tokenBAddress}&amount=${
          swapConfig.tokenAAmount * 10 ** 9
        }`
        )
    ).json();
    console.log("check");
    console.log(quoteResponse);
    await swap(swapConfig, quoteResponse);
};
export const buy = async (ctx: CallbackQueryContext<CusContext>) => {
    await ctx.conversation.exit();
    await ctx.conversation.reenter("buy");
    await ctx.answerCallbackQuery();
};
