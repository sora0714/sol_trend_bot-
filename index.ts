import { Bot, Context, session ,CallbackQueryContext} from "grammy";
import {
    type Conversation,
    type ConversationFlavor,
    conversations,
    createConversation,
} from "@grammyjs/conversations";
import Moralis from "moralis";

import config from "./config"

import connectDB from "./config/db";
import {
    root,
    wallet,
    buy,
    sell,
    swap,
    common
} from "./controllers"

import { cancel } from './controllers/common';

Moralis.start({
    apiKey: process.env.MORALIS_API_KEY,
});

type CusContext = Context & ConversationFlavor;

const bot = new Bot<CusContext>(config.TG_BOT_TOKEN);


(async function () {
    try {
        await connectDB();
        bot.use(
        session({
            initial() {return {};},
        })
        );

        bot.use(conversations());
        bot.command("start" , root.start);
        bot.command("settings", root.settings);
        bot.command("help", root.help);
        bot.command("chat", root.chat);


        bot.callbackQuery("cancel", common.cancel);

        bot.callbackQuery("wallet", wallet.start);
        bot.callbackQuery("wallet_reset", wallet.reset);
        bot.callbackQuery("wallet_reset_confirm", wallet.resetConfirm);
        bot.callbackQuery("wallet_export", wallet.exportPrvkey);
        bot.callbackQuery("wallet_export_confirm", wallet.exportPrvkeyConfirm);
        bot.callbackQuery("wallet_refresh", wallet.refresh);
        bot.callbackQuery("wallet_deposit", wallet.deposit);
        bot.use(createConversation(wallet.withdrawConversation, "wallet-withdraw"));
        bot.callbackQuery("wallet_withdraw", wallet.withdraw);


        bot.use(createConversation(buy.buyConversation, "buy"));
        bot.callbackQuery("buy", buy.buy);

        bot.use(createConversation(swap.swapConversation, "swap"));
        bot.callbackQuery("swap", swap.swap);

        bot.use(createConversation(sell.sellConversation, "sell"));
        bot.callbackQuery("sell", sell.sell);

        bot.start();
    }
    catch (err) {
        console.log(err);
    }
})();