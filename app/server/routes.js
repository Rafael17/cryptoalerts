
const CT = require('./modules/country-list');
const AcccountManager = require('./modules/account-manager');
const EM = require('./modules/email-dispatcher');
const TradingPairs = require('./modules/tradingPairs');
const AlertManager = require('./modules/alert-manager');
const PubSub = require('pubsub-js');
const request = require('request');

module.exports = function(app) {

/*
	login & logout
*/

	app.get('/', function(req, res){
	// check if the user has an auto login key saved in a cookie //
		if (req.cookies.login == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AcccountManager.validateLoginKey(req.cookies.login, req.ip, function(e, o){
				if (o){
					AcccountManager.autoLogin(o.user, o.pass, function(o){
						req.session.user = o;
						res.redirect('/price-alerts');
					});
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AcccountManager.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'false'){
					res.status(200).send(o);
				}	else{
					AcccountManager.generateLoginKey(o.user, req.ip, function(key){
						res.cookie('login', key, { maxAge: 900000 });
						res.status(200).send(o);
					});
				}
			}
		});
	});

	app.post('/logout', function(req, res){
		res.clearCookie('login');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})



/*
	Users
*/
	app.get('/users/', function(req, res) {

		const { telegramPasscode, telegramChatId } = req.query;
		if(telegramPasscode && telegramChatId) {
			AcccountManager.getUserByTelegramChatId(telegramChatId * 1, (error, object) => {
				if(object == null) {
					AcccountManager.addTelegramId(telegramPasscode, telegramChatId * 1, (error, object) => {
						if(object != null && !object.lastErrorObject.updatedExisting) {
							res.json({error: true, message: 'Wrong passcode! Login to crypto alerts to view your telegram passcode', result: null});
						} else {
							res.json({error: false, message: 'account-linked', result: object});
						}
					});
				}
				else {
					res.json({error: false, message: null, result: object});
				}
			})
		} 
	});

	app.get('/users/:id/', function(req, res) {
		/*
		if (req.session.user == null){
			res.redirect('/');
			return;
		} else if(req.session.user._id !== req.params.id) {
			res.redirect('/');
			return;
		} 
		*/
		if(req.query.filters == 'telegramChatId') {
			AcccountManager.getUser(req.session.user._id, (error, object) => {
				if(error)
					res.status(400).send('error-getting-telegram-chat-id');
				else {
					if(!object.telegramChatId) {
						res.status(404).send('error-telegram-chat-id-not-set');	
					} else {
						res.status(200).send('ok');
					}
				}
			});
			return;
		}
		AcccountManager.getUser(req.params.id, (error, object) => {
			if(error) {
				res.json(error);
				return;
			}
			res.json(object);
		});

	});

	app.get('/users/:id/alerts', function(req, res) {
		AlertManager.getPriceAlerts(req.params.id, (e, alerts) => {
			res.json(alerts);
		});
	});

/*
	price alerts

*/
	app.post('/alerts', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			const exchangePair = req.body['exchangePair'].split('-');

			AlertManager.addPriceAlert({
				userId	: req.session.user._id,
				exchange: exchangePair[0],
				price	: req.body['price'],
				pair	: exchangePair[1],
				cross	: req.body['cross'],
				message : req.body['message']
			}, (e, o) => {
				if (e){
					res.status(400).send('error-adding-price-alert');
				}	else{
					updatedPriceAlert()
					res.status(200).send('ok');
				}
			});
		}
	});

	app.get('/alerts', function(req, res) {
		AlertManager.getAllPriceAlerts((e, alerts) => {
			if(e) {
				res.json(e);
				return;
			}
			res.json(alerts);
		});
	});

	app.get('/price-alerts', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			TradingPairs.getPairs((error, pairs) => {
				var exchanges = Array.from(new Set(pairs.map(e => e.exchange)));
				const p = exchanges.map((exchange) => {
					const p = pairs.filter((pair) => pair.exchange === exchange).map((e) => e.pair);
					return {exchange: exchange, pairs: p};
				});
				AlertManager.getPriceAlerts(req.session.user._id, (e, alerts) => {
					res.render('alerts', {
						title : 'Price Alerts',
						exchanges: ['Bitmex','Binance'],
						pairs : p,
						udata : req.session.user,
						alerts: alerts,
						botName:process.env.BOT_NAME
					});
				});
			});
		}
	});

	app.delete('/alerts/:id', function(req, res) {
		AlertManager.deletePriceAlertById(req.params.id, (e, o) => {
			if (e){
				res.json({error: true, message: 'Error deleting alert'});
			}	else{
				res.json({error: false, message: 'Alert has been deleted'});
				updatedPriceAlert();
			}
		});
	});
	
/*
	control panel
*/
	app.get('/home', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			res.render('home', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/home', function(req, res){
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AcccountManager.updateAccount({
				id		: req.session.user._id,
				name	: req.body['name'],
				email	: req.body['email'],
				pass	: req.body['pass'],
				country	: req.body['country']
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o.value;
					res.status(200).send('ok');
				}
			});
		}
	});

/*
	new accounts
*/

	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AcccountManager.addNewAccount({
			name 	: req.body['name'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass'],
			country : req.body['country']
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});

/*
	password reset
*/

	app.post('/lost-password', function(req, res){
		let email = req.body['email'];
		AcccountManager.generatePasswordKey(email, req.ip, function(e, account){
			if (e){
				res.status(400).send(e);
			}	else{
				EM.dispatchResetPasswordLink(account, function(e, m){
			// TODO this callback takes a moment to return, add a loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		AcccountManager.validatePasswordKey(req.query['key'], req.ip, function(e, o){
			if (e || o == null){
				res.redirect('/');
			} else{
				req.session.passKey = req.query['key'];
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		let newPass = req.body['pass'];
		let passKey = req.session.passKey;
	// destory the session immediately after retrieving the stored passkey //
		req.session.destroy();
		AcccountManager.updatePassword(passKey, newPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});
	
/*
	view, delete & reset accounts
*/
	
	app.get('/print', function(req, res) {
		AcccountManager.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AcccountManager.deleteAccount(req.session.user._id, function(e, obj){
			if (!e){
				res.clearCookie('login');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			}	else{
				res.status(400).send('record not found');
			}
		});
	});
	
	app.get('/reset', function(req, res) {
		AcccountManager.deleteAllAccounts(function(){
			res.redirect('/print');
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};

// let worker app know that there has been an update in alerts
const updatedPriceAlert = () => {
	request({
		url: process.env.WORKER_APP_ORIGIN + '/alertsUpdate',
		method: 'GET',
		json: true
	}, (err, res, body) => {

	});
}

