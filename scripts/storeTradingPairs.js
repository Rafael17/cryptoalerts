const TradingPairs 	= require('../app/server/modules/tradingPairs');
const request 		= require('request');

const binanceURL 	= 'https://api.binance.com/api/v3/ticker/price';
const bitmexURL 	= 'https://www.bitmex.com/api/v1/trade/bucketed?binSize=1m&partial=true&count=100&reverse=true';

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