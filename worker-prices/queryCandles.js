require('dotenv').config();
const BitMEXClient 	= require('bitmex-realtime-api');
const Candles 		= require('./candles');
const Indicators 	= require('./indicators');
const mongoUtil 	= require('./../database');
const Telegraf 		= require('telegraf');
const getSecret 	= require('./../scripts/getSecret');
getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']);

let PriceAlertMng = null;
mongoUtil.connect( ( err, client ) => {
	if (err) console.log(err);
	PriceAlertMng	= require('./priceAlertManager');
});

const client1 = new BitMEXClient({testnet: false, maxTableLen: 1});
const allCandles = { 3: [], 5: [], 15: [], 60: [], 240: []};
const availableTimeframes = [ 3, 5, 15, 60, 240];
const timeframeMap = {
	'5': '5 min',
	'15': '15 min',
	'60': '1 hour',
	'240': '4 hour',
}
let minuteCandles = [];
let candleLastMinute = 0;

client1.addStream('XBTUSD', 'tradeBin1m', (data, symbol, tableName) => { 
	const candle = data[0];
	const time = getDateTimeInMinutes(candle.timestamp);

	// 16:00 is 15:55 in TradingView, so skip first one and next candle will have the time of previous one
	if(candleLastMinute === 0) {
		candleLastMinute = time;
		return;
	}
	candle.time = candleLastMinute;
	candleLastMinute = time;

	minuteCandles.push(candle);
	availableTimeframes.map( (timeframe) => {
		const candle = Candles.createNMinuteCandles(minuteCandles, timeframe);	
		if(candle) {
			allCandles[timeframe].push(candle);
			Indicators.isEngulfing(allCandles[timeframe], (result) =>  result && alertUsers(result, timeframe) );
			Indicators.isStar(allCandles[timeframe], (result) =>  result && alertUsers(result, timeframe) );
		}
	})
});

client1.on('error', (error) => {
  console.log(error);
});

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

const getDateTimeInMinutes = (time) => {
	const t = time.replace('-','').replace('-','').replace('T','').replace(':','').substring(0,12) * 1;
	return t;
}

