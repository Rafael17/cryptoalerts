const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const http = require('http');
const request = require('request');


require('dotenv').config();
const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const port = 80;

const Telegram = {
    send: (chatId, message) => {
        bot.telegram.sendMessage(chatId, message);   
    },
}

const regexEverything = new RegExp(/.*/,'i');
bot.hears(regexEverything, (ctx) => {
    const telegramChatId = ctx.message.from.id;
    const input = ctx.match[0];
    var message = [];
/*
	if(input === '/list') {
		request('http://localhost:3000/users/?telegramChatId=' + telegramChatId, { json: true }, (error, res, body) => {
            if (error) { return console.log(error); }
            request('http://localhost:3000/users/' + body._id + '/alerts', { json: true }, (error, res, body) => {
                if (error) { return console.log(error); }

                message = body.map(({ exchange, price, pair, cross }) => {
                    return exchange + '\n' + pair + '\n' + price + '\n' + cross +'\n';
                })
                ctx.reply(message.join('\n'));
                //console.log(body);
            })
		});
	} else {
        */
        request('http://localhost:3000/users/?telegramPasscode=' + input + '&telegramChatId=' + telegramChatId, { json: true }, (e, res, body) => {
            const { error, message, result } = body
            if(error) {
                ctx.reply(message);
                return;
            } else if(message != null) {
                ctx.reply(message);
            }
            
        })
    //}

    //ctx.reply(input);
    /*
    
    /*
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
    */

});

bot.startPolling();

module.exports = Telegram;


const serverFn = (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('Hello World!');
	res.end();
}

http.createServer(serverFn).listen(port, function() {
	console.log('Express server listening on port ' + port);
});