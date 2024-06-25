import { CallbackQueryContext, Context } from "grammy";
import { Conversation, ConversationFlavor } from "@grammyjs/conversations";



type CusContext = Context & ConversationFlavor;
type CusConversation = Conversation<CusContext>;


export const swapConversation = async (
    conversation: CusConversation,
    ctx: CusContext
) => {
    await ctx.reply("Enter Trading Token to swap:", {
        parse_mode: "HTML",
        reply_markup: { force_reply: true ,
            inline_keyboard: [
                [
                    { text: "SOL->USDC", callback_data: "buy" },
                    { text: "USDC->SOL", callback_data: "sell" },
                ],
            ]
        },
    });
}

export const swap = async (ctx: CallbackQueryContext<CusContext>) => {
    await ctx.conversation.exit();
    await ctx.conversation.reenter("swap");
    await ctx.answerCallbackQuery();
};
