
const db 			= require('./../database').getDb();
const mongo			= require('./../database').getMongo();

const priceAlert 	= db.collection('priceAlert');
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
	getUser : (userId, callback) => {
		accounts.findOne({_id: getObjectId(userId)}, callback);
	},
	getUserByTelegramChatId: (telegramChatId, callback) => {
		accounts.findOne({telegramChatId: telegramChatId}, callback);
	},
	addTelegramId: (passcode, telegramChatId, callback) => {
		accounts.findOneAndUpdate({telegramPasscode: passcode}, {$set: {telegramChatId:telegramChatId}},  {returnOriginal: false}, callback);
	}
}

module.exports = DatabaseManager; 
