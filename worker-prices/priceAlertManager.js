
const db 			= require('./../database').getDb();
const mongo			= require('./../database').getMongo();

const priceAlert 	= db.collection('priceAlert');
const accounts 		= db.collection('accounts');

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
	getUser: (id, callback) => {
		accounts.findOne({_id: new mongo.ObjectId(id)}, callback);
	}
}

module.exports = PriceAlertManager; 
