
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
				else callback(null, res)
		});
	},
	getUser: (id, callback) => {
		accounts.findOne({_id: new mongo.ObjectId(id)}, callback);
	}
}

module.exports = PriceAlertManager; 
