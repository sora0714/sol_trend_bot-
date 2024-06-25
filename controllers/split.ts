import { CallbackQueryContext, Context } from "grammy";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import { Connection, Keypair } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import User from "../models/User";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Wallet } from "@project-serum/anchor";
import { swapConfig as config } from "./Raydium-swap/swapConfig"; // Import the configuration
import RaydiumSwap from "./Raydium-swap/RaydiumSwap";
import { SolNetwork } from "@moralisweb3/common-sol-utils";
import base58 from "bs58";
import "dotenv/config";
import Moralis from "moralis";

type CusContext = Context & ConversationFlavor;
type CusConversation = Conversation<CusContext>;

const connection = new web3.Connection(process.env.RPC_URL as string);


const fetchSolAmount = async (address: string) => {
    const response = await Moralis.SolApi.account.getBalance({
        address,
        network: SolNetwork.MAINNET,
    });
    return response.toJSON();
};

const getSPL = async (address: string) => {
    const response = await Moralis.SolApi.account.getSPL({
        address,
        network: SolNetwork.MAINNET,
    });
    return response.toJSON();
};

export const splitConversation = async (
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
    await ctx.reply("Enter Token address to split:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
    });
    const {
        msg: { text: address },
    } = await conversation.waitFor("message");
    await ctx.reply("Enter the amount to split:", {
        parse_mode: "HTML",
    });
    let {
        msg: { text: amount },
    } = await conversation.waitFor("message");


    await ctx.reply("Enter Wallet amount to split:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
    });
    const {
        msg: { text: split_amount },
    } = await conversation.waitFor("message");
    for(var i = 0; i < parseInt( split_amount ) ; i++ ){
        await ctx.reply("Enter the wallets address to split:", {
            parse_mode: "HTML",
        });
        let {
            msg: { text: split_address },
        } = await conversation.waitFor("message");

    }






    await split;
}


export const split = async (ctx: CallbackQueryContext<CusContext>) => {
    await ctx.conversation.exit();
    await ctx.conversation.reenter("split");
    await ctx.answerCallbackQuery();
};