
var http = require('http');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var mongoUtil = require('./app/server/modules/database');

var app = express();

app.locals.pretty = true;
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/app/server/views');
app.set('view engine', 'pug');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
app.use(express.static(__dirname + '/app/public'));

// build mongo database connection url //

process.env.DB_HOST = process.env.DB_HOST || 'mongoDB'
process.env.DB_PORT = process.env.DB_PORT || 27017;
process.env.DB_NAME = process.env.DB_NAME || 'node-login';

process.env.TELEGRAM_APP_SCHEME = 'http';
process.env.TELEGRAM_APP_HOSTNAME = 'telegram-container';
process.env.TELEGRAM_APP_PORT = '3001';
process.env.TELEGRAM_APP_ORIGIN = process.env.TELEGRAM_APP_SCHEME + '://' + process.env.TELEGRAM_APP_HOSTNAME + ':' + process.env.TELEGRAM_APP_PORT;

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
  require('./priceAlert');
} );

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

