"use strict";
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
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
const moralis_1 = __importDefault(require("moralis"));
const config_1 = __importDefault(require("./config"));
const db_1 = __importDefault(require("./config/db"));
const controllers_1 = require("./controllers");
moralis_1.default.start({
    apiKey: process.env.MORALIS_API_KEY,
});
const bot = new grammy_1.Bot(config_1.default.TG_BOT_TOKEN);
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, db_1.default)();
            bot.use((0, grammy_1.session)({
                initial() { return {}; },
            }));
            bot.use((0, conversations_1.conversations)());
            bot.command("start", controllers_1.root.start);
            bot.command("settings", controllers_1.root.settings);
            bot.command("help", controllers_1.root.help);
            bot.command("chat", controllers_1.root.chat);
            bot.callbackQuery("cancel", controllers_1.common.cancel);
            bot.callbackQuery("wallet", controllers_1.wallet.start);
            bot.callbackQuery("wallet_reset", controllers_1.wallet.reset);
            bot.callbackQuery("wallet_reset_confirm", controllers_1.wallet.resetConfirm);
            bot.callbackQuery("wallet_export", controllers_1.wallet.exportPrvkey);
            bot.callbackQuery("wallet_export_confirm", controllers_1.wallet.exportPrvkeyConfirm);
            bot.callbackQuery("wallet_refresh", controllers_1.wallet.refresh);
            bot.callbackQuery("wallet_deposit", controllers_1.wallet.deposit);
            bot.use((0, conversations_1.createConversation)(controllers_1.wallet.withdrawConversation, "wallet-withdraw"));
            bot.callbackQuery("wallet_withdraw", controllers_1.wallet.withdraw);
            bot.use((0, conversations_1.createConversation)(controllers_1.buy.buyConversation, "buy"));
            bot.callbackQuery("buy", controllers_1.buy.buy);
            bot.use((0, conversations_1.createConversation)(controllers_1.swap.swapConversation, "swap"));
            bot.callbackQuery("swap", controllers_1.swap.swap);
            bot.use((0, conversations_1.createConversation)(controllers_1.sell.sellConversation, "sell"));
            bot.callbackQuery("sell", controllers_1.sell.sell);
            bot.start();
        }
        catch (err) {
            console.log(err);
        }
    });
})();
