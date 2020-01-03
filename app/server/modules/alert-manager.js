
const crypto 		= require('crypto');
const moment 		= require('moment');
const db 			= require('./database').getDb();
const PubSub = require('pubsub-js');

const priceAlert = db.collection('priceAlert');

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
	}
}

module.exports = AlertManager; 
