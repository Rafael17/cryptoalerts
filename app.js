
const http = require('http');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const mongoUtil = require('./database');
require('dotenv').config();

const app = express();
app.locals.pretty = true;
app.set('port', process.env.SERVER_PORT);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static(__dirname + '/dist'));


if (app.get('env') != 'live'){
	process.env.DB_URL = 'mongodb://'+process.env.DB_HOST+':'+process.env.DB_PORT;
}	else {
// prepend url with authentication credentials // 
	process.env.DB_URL = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+process.env.DB_HOST+':'+process.env.DB_PORT;
}

app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	proxy: true,
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ url: process.env.DB_URL })
	})
);

mongoUtil.connect( ( err, client ) => {
	if (err) console.log(err);
	require('./app/server/routes')(app);
	require('./scripts/storeTradingPairs');
} );

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

