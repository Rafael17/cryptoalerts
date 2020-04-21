require('dotenv').config();
const Candles 		= require('./candles');
const Indicators 	= require('./indicators');
const Telegraf 		= require('telegraf');
const getSecret 	= require('./../scripts/getSecret');
const Binance 		= require('binance-api-node').default;
const client 		= Binance();

getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']);
const PriceAlertMng = require('./priceAlertManager');

// Currently only support these pairs for binance
const symbols = ['ETHUSDT', 'BTCUSDT'];
const timeframes = [ 1, 5, 15, 60, 240];
const candles = {};

symbols.forEach( symbol => {
	candles[symbol] = {};
	timeframes.forEach(timeframe => {
		candles[symbol][timeframe] = [];
	});
})

const timeframeMap = {
	'1': '1 min',
	'5': '5 min',
	'15': '15 min',
	'60': '1 hour',
	'240': '4 hour',
}
//let minuteCandles = [];
let lastTime = 0;

const start = () => {
	symbols.map( symbol => {
		setInterval(() => {
			querySymbolCandles(symbol)
		}, 30 * 1000)
	})
}

start();

const querySymbolCandles = (symbol) => {
	client.candles({ symbol: symbol, interval: '1m', limit: '2' }).then( resultCandles => {

		if(candles[symbol].lastTime == resultCandles[1].openTime) {
			return;
		}
		candles[symbol].lastTime = resultCandles[1].openTime;
		const candle = resultCandles[0];
		candle.time = time(candle.openTime);

		candles[symbol]['1'].push(candle);
		timeframes.map( (timeframe) => {
			const candle = Candles.createNMinuteCandles(candles[symbol]['1'], timeframe);	
			
			if(candle) {
				console.log(candle);
				if(timeframe!='1') {
					candles[symbol][timeframe].push(candle);
				}
				Indicators.isEngulfing(candles[symbol][timeframe], (result) =>  result && alertUsers(result, timeframe, symbol) );
				Indicators.isStar(candles[symbol][timeframe], (result) =>  result && alertUsers(result, timeframe, symbol) );
			}
		})
	})
}

const alertUsers = (indicatorData, timeframe, pair) => {
	const exchange = "Binance";
	console.log(timeframe);
	console.log(indicatorData);
	PriceAlertMng.getIndicatorAlerts(exchange, pair, timeframe, indicatorData.indicator, (e, userIds) => {
		if(e) { console.error(e) }
		else {
			userIds.forEach( id => {
				console.log(id)
				PriceAlertMng.getUser(id, (error, user) => sendMessageToTelegram(indicatorData, timeframe, exchange, pair, user.telegramChatId));
			})
		}
	});
}

const sendMessageToTelegram = (indicatorData, timeframe, exchange, pair, telegramChatId) => {
	const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
	const text = `${indicatorData.message}\n${timeframeMap[timeframe]} timeframe\n${pair}`;
	bot.telegram.sendMessage(telegramChatId, text);   
}

function time(s) {
    return new Date(s / 1000 * 1e3).toISOString().slice(-13, -8).split(':').join('');
}
