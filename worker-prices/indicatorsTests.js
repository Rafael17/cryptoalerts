
const Indicators 	= require('./indicators');

const bearishEngulfing = [
	{open: 0, high: 0, low: 0, close: 0},
	{open: 0, high: 0, low: 0, close: 0},
	{open: 0, high: 0, low: 0, close: 0},
	{open: 4, high: 7, low: 1, close: 6},
	{open: 6, high: 8, low: 2, close: 4},
];

const bullishEngulfing = [
	{open: 9000, high: 9000, low: 9000, close: 9000},
	{open: 9000, high: 9000, low: 9000, close: 9000},
	{open: 9000, high: 9000, low: 9000, close: 9000},
	{open: 6, high: 8, low: 2, close: 4},
	{open: 4, high: 9, low: 1, close: 6},
];

const be = [
	{open: 9000, high: 9000, low: 9000, close: 9000},
	{open: 9000, high: 9000, low: 9000, close: 9000},
	{open: 9000, high: 9000, low: 9000, close: 9000},
	{ 
		open: '172.56000000' * 1,
		high: '172.65000000' * 1,
		low: '172.51000000' * 1,
		close: '172.52000000' * 1,
	},
	{ 
		open: '172.52000000' * 1,
		high: '172.61000000' * 1,
		low: '172.41000000' * 1,
		close: '172.59000000' * 1
	}
]

const star = [
	{open: 5865, high: 5900, low: 5764, close: 5776},
	{open: 5776, high: 5844, low: 5743, close: 5802},
	{open: 5802, high: 5886, low: 5792, close: 5876},
];

Indicators.isEngulfing(be, result => {
	console.log("bulls")
	console.log(result);
});
/*
Indicators.isEngulfing(bearishEngulfing, result => {
	console.log("bullishEngulfing")
	console.log(result);
});

Indicators.isEngulfing(bullishEngulfing, result => {
	console.log("bullishEngulfing")
	console.log(result);
});


Indicators.isStar(star, result => {
	console.log("star");
	console.log(result);
})
*/