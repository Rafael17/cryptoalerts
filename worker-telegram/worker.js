require('dotenv').config();
const Telegraf      = require('telegraf');
const Extra         = require('telegraf/extra');
const Markup        = require('telegraf/markup');
const request       = require('request');
const bodyParser    = require('body-parser');
const mongoUtil     = require('./../database');
const getSecret     = require('./../scripts/getSecret');

var DatabaseMng;

mongoUtil.connect( ( err, client ) => {
  if (err) console.log(err);
  DatabaseMng = require('./databaseManager');
} );


const runBot = () => {
    const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
    bot.startPolling();

    const regexEverything = new RegExp(/.*/,'i');
    
    bot.hears(regexEverything, (ctx) => {
        const telegramChatId = ctx.message.from.id;
        const input = ctx.match[0];
        var returnMessage = [];

        DatabaseMng.getUserByTelegramChatId(telegramChatId * 1, (error, userData) => {
            if(userData == null) {
                DatabaseMng.addTelegramId(input, telegramChatId * 1, (error, object) => {
                    if(object != null && !object.lastErrorObject.updatedExisting) {
                        ctx.reply('Wrong passcode! Login to crypto alerts to view your telegram passcode');
                    } else {
                        ctx.reply("Account has been linked! Now you will receive price alerts in this channel");
                    }
                });
            }
            else {
                processInput(input, userData,ctx);
            }
        });
    });
};

const processInput = (input, userData, ctx) => {
    if(input.startsWith('/delete_price')) {
        const alertId = input.split('_')[2];
        DatabaseMng.deletePriceAlert(alertId, userData._id, (error, data) =>{
            if(error) {
                console.error(error);
                ctx.reply('Not able to delete alert');
            } else {
                if(data.deletedCount === 0) {
                    ctx.reply('Alert does not exist');
                } else {
                    ctx.reply('Alert was deleted');
                }
            }
        });
        return;
    }
    if(input.startsWith('/delete_indicator')) {
        const alertId = input.split('_')[2];
        DatabaseMng.deleteIndicatorAlert(alertId, userData._id, (error, data) =>{
            if(error) {
                console.error(error);
                ctx.reply('Not able to delete alert');
            } else {
                if(data.deletedCount === 0) {
                    ctx.reply('Alert does not exist');
                } else {
                    ctx.reply('Alert was deleted');
                }
            }
        });
        return;
    }

    switch(input) {
        case '/list_price_alerts':
            DatabaseMng.getUserPriceAlerts(userData._id, (error, data) =>{
                if(error) {
                    console.error(error);
                    ctx.reply('internal server error');
                } else {
                    if(data.length === 0) {
                        ctx.reply('No price alerts have been set');
                        return;
                    }
                    const returnMessage = data.map(({ _id, exchange, price, pair, cross }) => {
                        return exchange + '\n' + pair + '\n' + price + '\n' + cross +'\n /delete_price_'+_id+'\n';
                    });
                    ctx.reply(returnMessage.join('\n'));
                }
            });
            break;
        case '/list_indicator_alerts':
            DatabaseMng.getUserIndicatorAlerts(userData._id, (error, data) =>{
                if(error) {
                    console.error(error);
                    ctx.reply('internal server error');
                } else {
                    if(data.length === 0) {
                        ctx.reply('No indicator alerts have been set');
                        return;
                    }
                    const returnMessage = data.map(({ _id, exchange, pair, indicator }) => {
                        return exchange + '\n' + pair + '\n' + indicator  +'\n /delete_indicator_'+_id+'\n';
                    });
                    ctx.reply(returnMessage.join('\n'));
                }
            });
            break;
        case '/help':
            ctx.reply('Available commands:\n/list_price_alerts\n/list_indicator_alerts');
            break;
        default:
            ctx.reply('Command not recognized.\nFor a list of commands use\n /help');
            break;
    }
}


getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']).then(runBot);



