const http 			= require('http');
const express 		= require('express');
const bodyParser 	= require('body-parser');
const request 		= require('request');
require('dotenv').config();

process.env.SERVER_ORIGIN = process.env.SERVER_SCHEME + '://' + process.env.SERVER_HOSTNAME + ':' + process.env.SERVER_PORT;
process.env.TELEGRAM_APP_ORIGIN = process.env.TELEGRAM_APP_SCHEME + '://' + process.env.TELEGRAM_APP_HOSTNAME + ':' + process.env.TELEGRAM_APP_PORT;

const app = express();
app.set('port', process.env.WORKER_APP_PORT);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/alertsUpdate', (req, res) => {
    getAllAlerts();
    res.json({error: false});
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Worker app server listening on port ' + app.get('port'));
});





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
	request({
		url: process.env.SERVER_ORIGIN + '/alerts/' + alert._id,
		method: 'DELETE',
		json: true
	}, (err, res, body) => {
		if(err) {
			console.log(err); 
			return;
		}
		
		request({
			url: process.env.SERVER_ORIGIN + '/users/' + alert.userId,
			method: 'GET',
			json: true
		}, (err, res, body) => {
			if(err) {
				console.log("Telegram Chat Id not setup yet"); 
				return;
			}
			const { price, cross, pair, message, exchange } = alert;
			const { telegramChatId } = body;
			const text = pair + "\n" + exchange + "\nPrice " + direction + " " + price + "\n" + message;
			sendMessageToTelegram({telegramChatId: telegramChatId, text: text})
		});
		getAllAlerts();
	});
}

const sendMessageToTelegram = (form) => {
	console.log(form);
	request({
		url: process.env.TELEGRAM_APP_ORIGIN,
		json: form,
		method: 'POST',
	}, (err, res, body) => {
		if(err) console.log(err); return;
		console.log(body);
	});
}

const getAllAlerts = () => {
	request({ 
		url: process.env.SERVER_ORIGIN + '/alerts',
		json: true,
		method: "GET",
	}, (err, res, body) => {
		if(err) {
			console.log(err);
			setTimeout(getAllAlerts, 3000);
			return;
		}
		alerts = body;
	});
}
getAllAlerts();

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
	data.forEach(({symbol, close}) => {
		checkAlerts(close,symbol,'Bitmex');
	})
});

