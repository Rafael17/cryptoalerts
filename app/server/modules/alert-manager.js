
const crypto 		= require('crypto');
const moment 		= require('moment');
const db 			= require('./../../../database').getDb();
const mongo			= require('./../../../database').getMongo();
const PubSub 		= require('pubsub-js');

const priceAlert 	= db.collection('priceAlert');
const accounts 		= db.collection('accounts');
const prices 		= db.collection('prices');

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
		priceAlert.deleteOne({_id: new mongo.ObjectId(id)}, callback);
	},
	getAllPriceAlerts: (callback) => {
		priceAlert.find({}).toArray(
			(e, res) => {
				if (e) callback(e)
				else callback(null, res)
		});
	},
	getTelegramChatIdByUserId: (userId, callback) => {
		accounts.findOne({_id: new mongo.ObjectId(userId)}, callback);
	},
	getAllPrices: (callback) => {
		const result = [];
		prices.find({}).forEach(e => {
			result.push(e);
		}).then(e => {
			callback(null, result);
		});
	},
}

module.exports = AlertManager; 
