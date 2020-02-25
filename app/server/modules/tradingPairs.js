
const db 			= require('./../../../database').getDb();
const mongo			= require('./../../../database').getMongo();

const tradingPairs 	= db.collection('tradingPairs');

const Pairs = {
	updatePairs: (exchange, pair) => {
		tradingPairs.replaceOne({exchange: exchange, pair: pair}, {exchange:exchange, pair: pair}, {upsert: true})
	},
	getPairs: (callback) => {
		tradingPairs.find().toArray(
			function(e, res) {
				if (e) callback(e)
				else callback(null, res)
			});
	}
}

module.exports = Pairs; 
