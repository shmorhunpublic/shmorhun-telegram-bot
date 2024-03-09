import dotenv from "dotenv";
import TelegramBot, { Message, CallbackQuery } from "node-telegram-bot-api";

import { MESSAGES } from "./utils/messages";
import { CALLBACKS, PLATFORM_BUTTONS, ROLE_BUTTONS } from "./utils/constants";
import { ROLE } from "./utils/enums";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

const choices = new Map<number, { role?: string; platform?: string }>();
let role = "";
// let platform = "";

if (!token) {
  console.log(MESSAGES.errors.env.token);
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg: Message) => {
  const chatId = msg.chat.id;

  console.log(chatId);
  choices.set(chatId, { role: undefined, platform: undefined });

  const opts = ROLE_BUTTONS;
  bot.sendMessage(chatId, MESSAGES.choose.role, opts);
});

bot.on("callback_query", async (callbackQuery: CallbackQuery) => {
  const message = callbackQuery.message!;
  const chatId = message.chat.id;
  const data = callbackQuery.data;
  console.log(chatId, data);

  if (Object.values(CALLBACKS.data.role).includes(data as string)) {
    choices.set(chatId, {
      role: data,
      platform: undefined,
    });
    role = choices.get(chatId)?.role || "";

    const opts = PLATFORM_BUTTONS;
    await bot.sendMessage(chatId, MESSAGES.choose.platform, opts);
  } else {
    choices.set(chatId, {
      role: role,
      platform: data,
    });
    await bot.sendMessage(
      chatId,
      `Role: ${choices.get(chatId)?.role}. Platform: ${
        choices.get(chatId)?.platform
      }`
    );
  }
  console.log(choices);
});

bot.on("polling_error", (error) => {
  console.log(`${MESSAGES.errors.running.polling} ${error.message}`);
});

bot.on("webhook_error", (error) => {
  console.log(`${MESSAGES.errors.running.webhook} ${error.message}`);
});

console.log(MESSAGES.success.running);
