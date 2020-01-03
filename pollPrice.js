const BitMEXClient = require('bitmex-realtime-api');
const PubSub = require('pubsub-js');

const client = new BitMEXClient({testnet: false, maxTableLen: 1});

client.addStream('XBTUSD', 'trade', (data, symbol, tableName) => {
	
	console.log(data);

});