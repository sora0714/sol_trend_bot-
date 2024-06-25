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
    network: /*SolNetwork.DEVNET*/"devnet",
  });
  return response.toJSON();
};

const getSPL = async (address: string) => {
  const response = await Moralis.SolApi.account.getSPL({
    address,
    network: /*SolNetwork.DEVNET*/"devnet",
  });
  return response.toJSON();
};
export const sellConversation = async (
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

  await ctx.reply("Enter Token address to sell:", {
    parse_mode: "HTML",
    reply_markup: { force_reply: true },
  });
  const {
    msg: { text: address },
  } = await conversation.waitFor("message");
  await ctx.reply("Enter the amount to sell:", {
    parse_mode: "HTML",
  });
  let {
    msg: { text: amount },
  } = await conversation.waitFor("message");

  console.log(address, amount);
  if (amount == undefined) amount = "0";

  const solCurrentAmount = await fetchSolAmount(wallet.publicKey.toString());
  const spls = await getSPL(wallet.publicKey.toString());
  console.log(solCurrentAmount,spls);
  const curToken = spls.find((splToken) => {
    return splToken.mint == address && parseFloat(splToken.amount) > 0;
  });
  if (!curToken) {
    ctx.reply(`<i>Insufficient current Token amount</i>`, {
      parse_mode: "HTML",
    });
    return;
  }

  let swapConfig = config;
  swapConfig.tokenAAddress = address || "";
  swapConfig.tokenBAddress = "So11111111111111111111111111111111111111112";
  if (
    parseFloat(solCurrentAmount.solana) >= 0.0004 &&
    parseFloat(curToken.amount) >= parseFloat(amount)
  )
    swapConfig.tokenBAmount = parseFloat(amount || "0");
  else {
    await ctx.reply(`<i>Insufficient current Token amount</i>`, {
      parse_mode: "HTML",
    });
    return;
  }
  console.log(swapConfig.tokenBAmount);
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

      const rawTransaction = transaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
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
  await ctx.reply("Just a sec...");

  console.log(
    `https://quote-api.jup.ag/v6/quote?inputMint=${
      swapConfig.tokenBAddress
    }&outputMint=${swapConfig.tokenBAddress}&amount=${
      swapConfig.tokenBAmount * 10 ** curToken.decimals
    }`
  );
  const quoteResponse = await (
    await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${
        swapConfig.tokenBAddress
      }&outputMint=${swapConfig.tokenBAddress}&amount=${
        swapConfig.tokenBAmount * 10 ** curToken.decimals
      }`
    )
  ).json();

  console.log(quoteResponse);
  await swap(swapConfig, quoteResponse);
};

export const sell = async (ctx: CallbackQueryContext<CusContext>) => {
  await ctx.conversation.exit();
  await ctx.conversation.reenter("sell");
  await ctx.answerCallbackQuery();
};
