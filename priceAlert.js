const PubSub 		= require('pubsub-js');
const tradingPairs 	= require('./app/server/modules/trading-pair-list');
const AlertManager 	= require('./app/server/modules/alert-manager');
const TradingPairs 	= require('./app/server/modules/tradingPairs');
const Telegram 		= require('./telegram');
const request 		= require('request');

var alerts 			= [];

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
	AlertManager.deletePriceAlertById(alert._id, (e, res) => {
		if(!e) {
			AlertManager.getTelegramChatIdByUserId(alert.userId, (e, res) => {
				if(e) console.log("Telegram Chat Id not setup yet");
				else {
					const { price, cross, pair, message, exchange } = alert;
					const { telegramChatId } = res;
					const text = pair + "\n" + exchange + "\nPrice " + direction + " " + price + "\n" + message;
					Telegram.send(telegramChatId, text);
				}
			});
			
			PubSub.publish('UPDATE PRICE ALERT LIST');
		}
	});
}

/* PubSub methods */
const updatePriceAlertList = (callback) => {
	AlertManager.getAllPriceAlerts((e, res) => {
		alerts = res;
		if(typeof callback === 'function') callback();
	});
}
PubSub.subscribe('UPDATE PRICE ALERT LIST', updatePriceAlertList);
// Fill initial price alerts already in DB
updatePriceAlertList()


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

const storeExchangesAndPairs = () => {
	exchangeHTTPRequest(binanceURL, (pairs) => {
		pairs.map((e)=> e.symbol).forEach((elem)=> {
			TradingPairs.updatePairs('Binance', elem);
		})
	})

	exchangeHTTPRequest(bitmexURL, (pairs) => {
		// ignore pairs that start with a dot
		const p = pairs.map((e)=> e.symbol).filter((e) => !e.startsWith("."));
		p.forEach((elem)=> {
			TradingPairs.updatePairs('Bitmex', elem);
		})
	})
};
storeExchangesAndPairs();

requestLoop(1000, binanceURL, (data) => {
	data.forEach(({symbol, price}) => {
		checkAlerts(price,symbol,'Binance');
	})
});
// Bitmex rate limit is 2 seconds per request
requestLoop(3000, bitmexURL, (data) => {
	data.forEach(({symbol, close}) => {
		checkAlerts(close,symbol,'Bitmex');
	})
});

