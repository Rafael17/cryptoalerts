const BitMEXClient 	= require('bitmex-realtime-api');
const PubSub 		= require('pubsub-js');
const tradingPairs 	= require('./app/server/modules/trading-pair-list');
const AlertManager 	= require('./app/server/modules/alert-manager');
const TradingPairs 	= require('./app/server/modules/tradingPairs');
const Telegram 		= require('./telegram');
const request 		= require('request');

var alerts 			= [];

const client = new BitMEXClient({testnet: false, maxTableLen: 1});

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

const binanceAPIRequest = (callback) => {
	request({
		url:'https://api.binance.com/api/v3/ticker/price',
		json: true,
		method: "GET",
		timeout: 10000
	}, (err, res, body) => {
		if(err) 
			return console.log(err); 
		callback(body);
	});
}

const requestLoop = setInterval(() => {
	binanceAPIRequest((data) => {
		data.forEach(({symbol, price}) => {
			checkAlerts(price,symbol,'Binance')
		})
	})
}, 1000);


//binanceAPIRequest();
const storeExchangesAndPairs = () => {
	binanceAPIRequest((pairs) => {
		const p = pairs.map((e)=> e.symbol);
		p.forEach((elem)=> {
			TradingPairs.updatePairs('Binance', elem);
		})
	})
	TradingPairs.updatePairs('Bitmex', 'XBTUSD');
	TradingPairs.updatePairs('Bitmex', 'ETHUSD');

	//Exchanges.updateExchangesAndPairs('Bitmex', ['XBTUSD', 'ETHUSD']);
};
storeExchangesAndPairs();

/* PubSub methods */
const updatePriceAlertList = (callback) => {
	AlertManager.getAllPriceAlerts((e, res) => {
		alerts = res;
		if(typeof callback === 'function') callback();
	});
}
PubSub.subscribe('UPDATE PRICE ALERT LIST', updatePriceAlertList);


updatePriceAlertList(() => {
	client.addStream('XBTUSD', 'trade', (data, symbol, tableName) => {
		checkAlerts(data[0].price, data[0].symbol, 'Bitmex');
	});
	client.addStream('ETHUSD', 'trade', (data, symbol, tableName) => {
		checkAlerts(data[0].price, data[0].symbol, 'Bitmex');
	});
});
