require('dotenv').config();

const request 		= require('request');
const Telegraf 		= require('telegraf');
const mongoUtil 	= require('./../database');
const getSecret 	= require('./../scripts/getSecret');


let PriceAlertMng 	= null;

getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']);

mongoUtil.connect( ( err, client ) => {
	if (err) console.log(err);
	PriceAlertMng	= require('./priceAlertManager');
	require('./queryPrices');
	require('./queryCandlesBinance');
	getAllAlerts();
});

// const sqsReceiveMessage = (message) => {
//     console.log('Processing message: ', message.MessageId);
//     getAllAlerts();
// };

// getSecret('prod/sqs-price-alert-update', ['SQS_URL_FOR_PRICE_UPDATES'])
// .then(() => {
// 	SQS.longPoll(process.env.SQS_URL_FOR_PRICE_UPDATES, sqsReceiveMessage).start();
// })

const checkAlerts = (alerts, exchangeData) => {
	if(alerts.length === 0) {
		return;
	}

	alertsExchanges = Object.keys(alerts);
	alertsExchanges.map(( exchange ) => {
		alerts[exchange].map( alert  => {
			if(alert.price < exchangeData[exchange][alert.pair] && alert.cross == 'Cross Up') {
				triggerAlert(alert, "above");
			} if(alert.price > exchangeData[exchange][alert.pair] && alert.cross == 'Cross Down') {
				triggerAlert(alert, "below");
			}
		})
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
			console.error(e)
			return;
		}
		getAllPrices(data);
	});
}

const getAllPrices = (alerts) => {
	PriceAlertMng.getAllPrices((e, data) => {
		if(e) {
			console.error(e)
			return;
		}
		if(data.length === 0) {
			return;
		}
		const prices = data.reduce( (acc, value) => {
			acc[value['name']] = value.prices;
			return acc;
		}, {})

		checkAlerts(alerts, prices);
	});
}

setInterval(getAllAlerts, 1000);

