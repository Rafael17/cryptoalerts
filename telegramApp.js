const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const http = require('http');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

process.env.SERVER_SCHEME = 'http'
process.env.SERVER_HOSTNAME = 'localhost';
process.env.SERVER_PORT = '3000';
process.env.SERVER_ORIGIN = process.env.SERVER_SCHEME + '://' + process.env.SERVER_HOSTNAME + ':' + process.env.SERVER_PORT;

process.env.TELEGRAM_APP_SCHEME = 'http';
process.env.TELEGRAM_APP_HOSTNAME = 'localhost';
process.env.TELEGRAM_APP_PORT = '3001';


const app = express();
app.set('port', process.env.TELEGRAM_APP_PORT);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('dotenv').config();
const bot = new Telegraf(process.env.TELEGRAM_API_KEY);

const regexEverything = new RegExp(/.*/,'i');
bot.hears(regexEverything, (ctx) => {
    const telegramChatId = ctx.message.from.id;
    const input = ctx.match[0];
    var returnMessage = [];
    
    request(process.env.SERVER_ORIGIN + '/users/?telegramPasscode=' + input + '&telegramChatId=' + telegramChatId, { json: true }, (e, res, body) => {
        const { error, message, result } = body
        if(error) {
            ctx.reply(message);
            return;
        } else if(message == 'account-linked') {
            ctx.reply("Account has been linked! Now you will receive price alerts in this channel");
        } else {
            switch(input) {
                case '/list':
                    request(process.env.SERVER_ORIGIN + '/users/' + result._id + '/alerts', { json: true }, (error, res, body) => {
                        if (error) { return console.log(error); }
                        returnMessage = body.map(({ exchange, price, pair, cross }) => {
                            return exchange + '\n' + pair + '\n' + price + '\n' + cross +'\n';
                        });
                        if(returnMessage.length === 0) {
                            ctx.reply("No price alerts have been set");    
                        } else {
                            ctx.reply(returnMessage.join('\n'));
                        }
                    });
                    break;
                default:
                    break;
            }
        }
    })
});

bot.startPolling();

app.post('/', (req, res) => {
    const { telegramChatId, text } = req.body;
    bot.telegram.sendMessage(telegramChatId, text);   
    res.json({error: false});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});



