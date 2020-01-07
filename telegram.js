const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);

const Telegram = {
    send: (chatId, message) => {
        bot.telegram.sendMessage(chatId, message);   
    },
}

module.exports = Telegram;
