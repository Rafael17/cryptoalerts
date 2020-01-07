
const crypto 		= require('crypto');
const moment 		= require('moment');
const db 			= require('./database').getDb();
const mongo			= require('./database').getMongo();
const PubSub 		= require('pubsub-js');

const priceAlert 	= db.collection('priceAlert');

AlertManager = {
	getPriceAlerts: (userId, callback) => {
		priceAlert.find({userId:userId}).toArray(
			(e, res) => {
				if (e) callback(e)
				else callback(null, res)
		});
	},
	addPriceAlert: (newData, callback) => {

		priceAlert.insertOne(newData, callback);
	},
	deletePriceAlertById: (id, callback) => {
		priceAlert.deleteOne({_id: new mongo.ObjectId(id)});
		callback();
	},
	getAllPriceAlerts: (callback) => {
		priceAlert.find({}).toArray(
			(e, res) => {
				if (e) callback(e)
				else callback(null, res)
		});
	}
}

module.exports = AlertManager; 
