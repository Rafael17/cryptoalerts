const http 			= require('http');
const express 		= require('express');
const session 		= require('express-session');
const bodyParser 	= require('body-parser');
const cookieParser 	= require('cookie-parser');
const MongoStore 	= require('connect-mongo')(session);
const mongoUtil 	= require('./database');
const getSecret 	= require('./scripts/getSecret');
require('dotenv').config();

getSecret('prod/telegram', ['TELEGRAM_API_KEY','BOT_NAME']);
getSecret('prod/sqs-price-alert-update', ['SQS_URL_FOR_PRICE_UPDATES'])

const app = express();
app.locals.pretty = true;
app.set('port', process.env.SERVER_PORT);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/dist'));


mongoUtil.connect(( err, client ) => {
	if (err) console.log(err);
	require('./scripts/downloadFrontEnd');
	require('./scripts/storeTradingPairs');

	app.use(session({
		secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
		proxy: true,
		resave: true,
		saveUninitialized: true,
		store: new MongoStore({ url: process.env.DB_CONNECTION_STRING })
		})
	);

	require('./app/server/routes')(app);

	http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
	});

} );


