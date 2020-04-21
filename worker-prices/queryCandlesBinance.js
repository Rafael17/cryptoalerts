require('dotenv').config();
const Candles 		= require('./candles');
const Indicators 	= require('./indicators');
const Telegraf 		= require('telegraf');
const getSecret 	= require('./../scripts/getSecret');
const Binance = require('binance-api-node').default
const client = Binance()

getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']);
const PriceAlertMng = require('./priceAlertManager');


const allCandles = { 1: [], 5: [], 15: [], 60: [], 240: []};
const availableTimeframes = [ 1, 5, 15, 60, 240];
const timeframeMap = {
	'1': '1 min',
	'5': '5 min',
	'15': '15 min',
	'60': '1 hour',
	'240': '4 hour',
}
let minuteCandles = [];
let lastTime = 0;

setInterval(() => {
	client.candles({ symbol: 'ETHUSDT', interval: '1m', limit: '2' }).then( candles => {
		if(lastTime == candles[1].openTime) {
			return;
		}
		lastTime = candles[1].openTime;
		const candle = candles[0];
		candle.time = time(candle.openTime);

		minuteCandles.push(candle);
		

		availableTimeframes.map( (timeframe) => {
			const candle = Candles.createNMinuteCandles(minuteCandles, timeframe);	
			
			if(candle) {
				console.log(candle)
				allCandles[timeframe].push(candle);
				Indicators.isEngulfing(allCandles[timeframe], (result) =>  result && alertUsers(result, timeframe) );
				Indicators.isStar(allCandles[timeframe], (result) =>  result && alertUsers(result, timeframe) );
			}
		})
	})
}, 30 * 1000);

const alertUsers = (indicatorData, timeframe) => {
	const exchange = "Bitmex";
	const pair = "XBTUSD";
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
