const Telegram = require('./telegram');
const BitMEXClient = require('bitmex-realtime-api');

const client = new BitMEXClient({testnet: false, maxTableLen: 1});

client.addStream('XBTUSD', 'trade', (data, symbol, tableName) => { 
	console.log(data);

});

client.on('error', (error) => {
  console.log(error);
});