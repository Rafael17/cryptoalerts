require('dotenv').config();

const request 		= require('request');
const Telegraf 		= require('telegraf');
const mongoUtil 	= require('./../database');
const SQS 			= require('./../sqs');
const getSecret 	= require('./../scripts/getSecret');

let PriceAlertMng 	= null;

getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']);

mongoUtil.connect( ( err, client ) => {
	if (err) console.log(err);
	PriceAlertMng	= require('./priceAlertManager');
	getAllAlerts();
});

const sqsReceiveMessage = (message) => {
    console.log('Processing message: ', message.MessageId);
    getAllAlerts();
};

getSecret('prod/sqs-price-alert-update', ['SQS_URL_FOR_PRICE_UPDATES'])
.then(() => {
	SQS.longPoll(process.env.SQS_URL_FOR_PRICE_UPDATES, sqsReceiveMessage).start();
})

var alerts = [];

const checkAlerts = (exchangeData) => {
	if(alerts[exchangeData.name] === undefined) {
		return;
	}
	alerts[exchangeData.name].map( alert  => {
		if(alert.price < exchangeData.prices[alert.pair] && alert.cross == 'Cross Up') {
			triggerAlert(alert, "above");
		} if(alert.price > exchangeData.prices[alert.pair] && alert.cross == 'Cross Down') {
			triggerAlert(alert, "below");
		}
	})
}

const triggerAlert = (alert, direction) => {
	PriceAlertMng.deletePriceAlertById(alert._id, (e, o) => {
		if (e){
			console.log(e)
		} else {
			getAllAlerts();
			PriceAlertMng.getUser(alert.userId, (e, user) => {
				if(e) {
					console.log(e);
				} else {
					const { price, cross, pair, message, exchange } = alert;
					const { telegramChatId } = user;
					const text = pair + "\n" + exchange + "\nPrice " + direction + " " + price + "\n" + message;
					sendMessageToTelegram({telegramChatId: telegramChatId, text: text})
				}
			});
		}
	});
}

const sendMessageToTelegram = (form) => {
	const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
	const { telegramChatId, text } = form;
	bot.telegram.sendMessage(telegramChatId, text);   
}

const getAllAlerts = () => {
	PriceAlertMng.getAllPriceAlerts((e, data) => {
		if(e) {
			console.log(e)
			return;
		}
		alerts = data;
	});
}

const binanceURL = 'https://api.binance.com/api/v3/ticker/price';
const bitmexURL = 'https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=true&count=100&reverse=true';

const exchangeHTTPRequest = (url, callback) => {
	request({
		url: url,
		json: true,
		method: "GET",
		timeout: 10000
	}, (err, res, body) => {
		if(err) 
			return console.log(err); 
		callback(body);
	});
}

const requestLoop = (milliseconds, url, callback) => {
	setInterval(() => {
		exchangeHTTPRequest(url, callback);
	}, milliseconds);
}

requestLoop(1000, binanceURL, (data) => {
	const prices = data.reduce((acc, { symbol, price }) => {
		acc[symbol] = price * 1 ;
		return acc;
	}, {});
	const exchangeData = { name: 'Binance', prices };
	checkAlerts(exchangeData);
});

// Bitmex rate limit is 2 seconds per request
requestLoop(3000, bitmexURL, (data) => {
	if(!Array.isArray(data)) {
		return;
	}

	var uniqueSymbols = {};
	const uniques = data.filter(({symbol}, pos, self)=> {
		if(uniqueSymbols[symbol] == undefined) {
			uniqueSymbols[symbol] = symbol;
			return true;
		} 
		return false;
	});

	const prices = uniques.reduce((acc, { symbol, close }) => {
		acc[symbol]= close * 1 ;
		return acc;
	}, {});
	const exchangeData = { name: 'Bitmex', prices };
	checkAlerts(exchangeData);

});
