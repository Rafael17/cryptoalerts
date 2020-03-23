
const Indicators 	= require('./indicators');

const engulfing = [
	{open: 5877, high: 5908, low: 5737, close: 5820},
	{open: 5820, high: 5945, low: 5683, close: 5909},
];

const star = [
	{open: 5865, high: 5900, low: 5764, close: 5776},
	{open: 5776, high: 5844, low: 5743, close: 5802},
	{open: 5802, high: 5886, low: 5792, close: 5876},
];


Indicators.isEngulfing(engulfing, result => {
	console.log(result);
});

Indicators.isStar(star, result => {
	console.log(result);
})