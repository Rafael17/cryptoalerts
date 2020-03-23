
const crypto 		= require('crypto');
const moment 		= require('moment');
const db 			= require('./../../../database').getDb();
const mongo			= require('./../../../database').getMongo();
const PubSub 		= require('pubsub-js');

const priceAlert 	= db.collection('priceAlert');
const accounts 		= db.collection('accounts');
const prices 		= db.collection('prices');
const indicatorAlert= db.collection('indicatorAlert');

AlertManager = {
	getAllAlerts: (userId, callback) => {

		const promise1 = new Promise(function(resolve, reject) {
			priceAlert.find({userId:userId}).toArray(
				(e, res) => {
					if (e) reject(e);
					else resolve(res);
			});
		});
		const promise2 = new Promise(function(resolve, reject) {
			indicatorAlert.find({userId:userId}).toArray(
				(e, res) => {
					if (e) reject(e);
					else resolve(res);
			});
		});

		Promise.all([promise1, promise2]).then( (results) => {
  			callback(null, results);
		}).catch( (error) => {
			callback(error);
		})
	},
	addPriceAlert: (newData, callback) => {
		priceAlert.insertOne(newData, callback);
	},
	deletePriceAlertById: (id, callback) => {
		priceAlert.deleteOne({_id: new mongo.ObjectId(id)}, callback);
	},
	deleteIndicatorAlertById: (id, callback) => {
		indicatorAlert.deleteOne({_id: new mongo.ObjectId(id)}, callback);
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
	addIndicatorAlert: (newData, callback)=> {
		indicatorAlert.insertOne(newData, callback);
	}
}

module.exports = AlertManager; 
