require('dotenv').config();

const request 		= require('request');
const Telegraf 		= require('telegraf');

const mongoUtil 	= require('./../database');
const SQS 			= require('./../sqs');

var PriceAlertMng 	= null;

mongoUtil.connect( ( err, client ) => {
	if (err) console.log(err);
	PriceAlertMng	= require('./priceAlertManager');
	getAllAlerts();
});

const sqsReceiveMessage = (message) => {
    console.log('Processing message: ', message);
    getAllAlerts();
};
SQS.longPoll('PRICE_ALERT_UPDATED', sqsReceiveMessage).start();


var alerts = [];

const checkAlerts = (currentPrice, pair, exchange) => {
	alerts.filter(v => v.pair == pair && v.exchange == exchange).map(alert => {
		if(alert.price < currentPrice*1 && alert.cross == 'Cross Up') {
			triggerAlert(alert, "above");
		} if(alert.price > currentPrice*1 && alert.cross == 'Cross Down') {
			triggerAlert(alert, "below");
		}
	});
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
	data.forEach(({symbol, price}) => {
		checkAlerts(price,symbol,'Binance');
	})
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
	uniques.forEach(({symbol, close}) => {
		checkAlerts(close,symbol,'Bitmex');
	})
});
