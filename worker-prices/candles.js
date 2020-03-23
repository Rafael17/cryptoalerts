
const Candles = {

	// timeframe in minutes
	createNMinuteCandles: (minuteCandles, timeframe) => {
		const candlesCount = minuteCandles.length;
		const currentMin = minuteCandles[candlesCount - 1].time.toString().slice(-2) * 1;
		const currentHour = minuteCandles[candlesCount - 1].time.toString().slice(-4, -2) * 1;
		let isCandleComplete = (currentMin % timeframe === timeframe - 1);
		// 4 hours
		if(timeframe > 60) {
			isCandleComplete = (currentHour % (timeframe / 60) === (timeframe/60) - 1);
		}
		
		// for 5 min timeframe, we need ie 55 to *59* (timeframe - 1)
		if( (candlesCount >= timeframe) && isCandleComplete ) {
			// We need this so array is not altered when using slice when creating candles
			const deepCopy = JSON.parse(JSON.stringify(minuteCandles));
			const lastNCandles = deepCopy.slice(-timeframe);

			const high = Math.max(...lastNCandles.map( (candle) => candle.high));
			const low = Math.min(...lastNCandles.map( (candle) => candle.low));
			const open = lastNCandles[0].open * 1;
			const close = lastNCandles[lastNCandles.length - 1].close * 1;
			const time = lastNCandles[0].time;
			const candle = {high, low, open, close, time, timeframe: timeframe};

			return candle;
		} else {
			return false;
		}
		
	}

}

module.exports = Candles;