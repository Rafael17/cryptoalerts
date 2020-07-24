const Binance 		= require('binance-api-node').default;
const client 		= Binance();



function t(s) {
    return new Date(s / 1000 * 1e3).toISOString().slice(-13, -8).split(':').join('');
}


const start = ()=> {
	const date = new Date();
	const seconds = date.getSeconds();
	const waitSeconds = 60 - seconds * 1;
	console.log(waitSeconds);
	setTimeout(()=>{
		client.time().then(time => {
			console.log(new Date().getSeconds());
		})
		client.candles({ symbol: 'ETHUSDT', interval: '1m', limit: '2' }).then( resultCandles => {
			console.log(resultCandles)
		});

	}, (waitSeconds + 5) * 1000)
}

start();