const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const telegramUser = 479300350;

const Telegram = {
    send: (message) => {
        bot.telegram.sendMessage(telegramUser, message);   
    },
}

module.exports = Telegram;
