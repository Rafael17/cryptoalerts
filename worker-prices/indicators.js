
const isRecentLow = (candles, totalLen, patternLen) => {
	const min = Math.min(...candles.slice(totalLen * -1).map( candle => candle.low));
	return candles.slice(patternLen * -1).map( ({ low }) => low).indexOf(min) !== -1;
}

const isRecentHigh = (candles, totalLen, patternLen) => {
	const max = Math.max(...candles.slice(totalLen * -1).map( candle => candle.high));
	return candles.slice(patternLen * -1).map( ({ high }) => high).indexOf(max) !== -1;
}

const Indicators = {

	isEngulfing: (candles, callback) => {
		const totalLen = 5;

		if(candles.length < totalLen) {
			return callback(false);
		}
		const last = candles[candles.length - 1];
		const prevLast = candles[candles.length - 2];
		
		//Trigger: if is engulfing and current candle is min/max low/high of the last 5 candles
		if(prevLast.open <= last.close && last.open <= last.close && prevLast.open >= prevLast.close && isRecentLow(candles, totalLen, 2)) {
			return callback({indicator: "Engulfing", message: "Bullish Engulfing"});
		}
		if(last.close <= prevLast.open && last.open >= last.close && prevLast.open <= prevLast.close && isRecentHigh(candles, totalLen, 2)) {
			return callback({indicator: "Engulfing", message: "Bearish Engulfing"});
		}
		return callback(false);
	},

	isStar: (candles, callback) => {
		const totalLen = 8;
		
		if(candles.length < totalLen) {
			return callback(false);
		}
		const first = candles[candles.length - 3];
		const middle = candles[candles.length - 2];
		const last = candles[candles.length - 1];

		if(first.open > first.close && first.open > middle.high && first.open < last.close && isRecentLow(candles, totalLen, 3)) {
			return callback({indicator: "Star", message: "Morning Star"});
		}
		if(first.open < first.close && first.open < middle.low && first.open > last.close && isRecentHigh(candles, totalLen, 3)) {
			return callback({indicator: "Star", message: "Evening Star"});
		}
		return callback(false);

	}
}

module.exports = Indicators;


	/* isStar
			|
	|	   	|
	| 	|   |
	    |
	*/

	/* isEngulfing
	   |
	|  |
	|  |
	*/
