
const db 			= require('./../database').getDb();
const mongo			= require('./../database').getMongo();

const priceAlert 	= db.collection('priceAlert');
const indicatorAlert= db.collection('indicatorAlert');
const accounts 		= db.collection('accounts');

DatabaseManager = {
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
	getUserPriceAlerts: (userId, callback) => {
		priceAlert.find({ userId: userId.toString() }).toArray(
			(e, res) => {
				if (e) callback(e)
				else callback(null, res)
		});
	},
	getUserIndicatorAlerts: (userId, callback) => {
		indicatorAlert.find({ userId: userId.toString() }).toArray(
			(e, res) => {
				if (e) callback(e)
				else callback(null, res)
		});
	},
	deleteIndicatorAlert: (alertId, userId, callback) => {
		indicatorAlert.deleteOne({_id: new mongo.ObjectId(alertId), userId: userId.toString()}, callback);
	},
	
	deletePriceAlert: (alertId, userId, callback) => {
		priceAlert.deleteOne({_id: new mongo.ObjectId(alertId), userId: userId.toString()}, callback);
	},
	getUserByTelegramChatId: (telegramChatId, callback) => {
		accounts.findOne({telegramChatId: telegramChatId}, callback);
	},
	addTelegramId: (passcode, telegramChatId, callback) => {
		accounts.findOneAndUpdate({telegramPasscode: passcode}, {$set: {telegramChatId:telegramChatId}},  {returnOriginal: false}, callback);
	}
}

module.exports = DatabaseManager; 
