const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const AcccountManager = require('./app/server/modules/account-manager');

require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);

const Telegram = {
    send: (chatId, message) => {
        bot.telegram.sendMessage(chatId, message);   
    },
}

const regexEverything = new RegExp(/.*/,'i');
bot.hears(regexEverything, (ctx) => {
    const telegramChatId = ctx.message.from.id;
    const input = ctx.match[0];

    AcccountManager.addTelegramId(input, telegramChatId, (error, object) => {
    	if(!error) {
    		if(object.lastErrorObject.updatedExisting) {
    			ctx.reply('Great job! Now you will receive crypto alerts on this channel!');
    		} else {
    			ctx.reply('Please type in your 6 character telegram passcode');
    		}
    	} else {
    		ctx.reply('Please type in your 6 character telegram passcode');
    	}
    })
    console.log(telegramChatId);

});
bot.startPolling()

module.exports = Telegram;
