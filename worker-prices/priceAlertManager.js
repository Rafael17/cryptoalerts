
const db 			= require('./../database').getDb();
const mongo			= require('./../database').getMongo();

const priceAlert 	= db.collection('priceAlert');
const accounts 		= db.collection('accounts');
const prices 		= db.collection('prices');
const indicatorAlert= db.collection('indicatorAlert');

PriceAlertManager = {
	deletePriceAlertById: (id, callback) => {
		priceAlert.deleteOne({_id: new mongo.ObjectId(id)}, callback);
	},
	getAllPriceAlerts: (callback) => {
		priceAlert.find({}).toArray(
			(e, res) => {
				if (e) callback(e)
				else {
					const exchangeData = res.reduce( (acc, value) => {
						if(acc[value.exchange] === undefined) {
							acc[value.exchange] = [];
						}
						acc[value.exchange].push(value);
						return acc;
					}, {})
					callback(null, exchangeData);
				}
		});
	},
	getAllPrices: (callback) => {
		const result = [];
		prices.find({}).forEach(e => {
			result.push(e);
		}).then(e => {
			callback(null, result);
		});
	},
	getUser: (id, callback) => {
		accounts.findOne({_id: new mongo.ObjectId(id)}, callback);
	},
	getIndicatorAlerts: (exchange, pair, timeframe, indicator, callback) => {
		const result = [];
		indicatorAlert.find({exchange, pair,[`timeframe_${timeframe}`]: true, indicator}).forEach(e => {
			result.push(e.userId);
		}).then(e => {
			callback(null, result);
		});
	},
	addPriceForExchange: (exchange, data, callback) => {
		prices.updateOne({name: exchange}, {$set: {prices: data}}, {upsert: true}, function(e, o){
			if (o.value != null){
				callback(null, o);
			}	else{
				callback(e);
			}
		});
	}
}

module.exports = PriceAlertManager; 
