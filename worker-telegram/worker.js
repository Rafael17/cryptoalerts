require('dotenv').config();
const Telegraf      = require('telegraf');
const Extra         = require('telegraf/extra');
const Markup        = require('telegraf/markup');
const request       = require('request');
const bodyParser    = require('body-parser');
const mongoUtil     = require('./../database');

var DatabaseMng;

mongoUtil.connect( ( err, client ) => {
  if (err) console.log(err);
  DatabaseMng = require('./databaseManager');
} );

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);

const regexEverything = new RegExp(/.*/,'i');
bot.hears(regexEverything, (ctx) => {
    const telegramChatId = ctx.message.from.id;
    const input = ctx.match[0];
    var returnMessage = [];

    DatabaseMng.getUserByTelegramChatId(telegramChatId * 1, (error, object) => {
        if(object == null) {
            DatabaseMng.addTelegramId(input, telegramChatId * 1, (error, object) => {
                if(object != null && !object.lastErrorObject.updatedExisting) {
                    ctx.reply('Wrong passcode! Login to crypto alerts to view your telegram passcode');
                } else {
                    ctx.reply("Account has been linked! Now you will receive price alerts in this channel");
                }
            });
        }
        else {
            ctx.reply(processInput(input));
        }
    });
});

const processInput = (input) => {
    switch(input) {
        case '/list':/*
            request(process.env.SERVER_ORIGIN + '/users/' + result._id + '/alerts', { json: true }, (error, res, body) => {
                if (error) { return console.log(error); }
                returnMessage = body.map(({ exchange, price, pair, cross }) => {
                    return exchange + '\n' + pair + '\n' + price + '\n' + cross +'\n';
                });
                if(returnMessage.length === 0) {
                    return 'No price alerts have been set';
                } else {
                    return returnMessage.join('\n');
                }
            });*/
            return 'list comming';
            break;
        case '/help':
            return 'Available commands:\n/list';
            break;
        default:
            return 'Command not recognized.\nFor a list of commands use\n /help';
            break;
    }
}

bot.startPolling();




