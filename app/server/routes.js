
const AcccountManager = require('./modules/account-manager');
const EM = require('./modules/email-dispatcher');
const TradingPairs = require('./modules/tradingPairs');
const AlertManager = require('./modules/alert-manager');
const PubSub = require('pubsub-js');
const request = require('request');
const SQS = require('../../sqs.js');
const path = require('path');

module.exports = function(app) {

	/******************\
		login/logout
	\*******************/
	/*
	app.get('/api/', function(req, res){
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
	*/
	app.post('/api/', function(req, res){
		AcccountManager.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).json({error:true, message: e});
			} else {
				req.session.user = o;
				if (req.body['remember-me'] == 'false'){
					res.status(200).json({success: true, userData:o});
				} else {
					AcccountManager.generateLoginKey(o.user, req.ip, function(key){
						res.cookie('login', key, { maxAge: 900000 });
						res.status(200).json({success: true, userData:o});
					});
				}
			}
		});
	});

	app.post('/api/logout', function(req, res){
		res.clearCookie('login');
		req.session.destroy(function(e){ res.status(200).json({success: true}); });
	})



	/******************\
		users
	\*******************/
	app.get('/api/users/:id/', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
			return;
		} else if(req.session.user._id !== req.params.id) {
			res.redirect('/');
			return;
		} 
		if(req.query.filters == 'telegramChatId') {
			AcccountManager.getUser(req.session.user._id, (error, object) => {
				if(error)
					res.status(400).json({error: true, message: 'error-getting-telegram-chat-id'});
				else {
					if(!object.telegramChatId) {
						res.status(400).json({error: true, message: 'error-telegram-chat-id-not-set'});	
					} else {
						res.status(200).json({success: true});
					}
				}
			});
			return;
		}
	});

	/******************\
		price alerts
	\*******************/

	app.post('/api/alerts', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		} else {
			AlertManager.addPriceAlert({
				userId	: req.session.user._id,
				exchange: req.body['exchange'],
				price	: req.body['price'],
				pair	: req.body['pair'],
				cross	: req.body['cross'],
				message : req.body['message']
			}, (e, o) => {
				if (e){
					res.status(400).json({error: true, message: 'error-adding-price-alert'});
				} else {
					SQS.send('PRICE_ALERT_UPDATED');
					res.status(200).json({success: true});
				}
			});
		}
	});
	
	app.get('/api/price-alerts', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			TradingPairs.getPairs((error, pairs) => {
				var exchanges = Array.from(new Set(pairs.map(e => e.exchange)));
				const p = exchanges.map((exchange) => {
					const p = pairs.filter((pair) => pair.exchange === exchange).map((e) => {
						const value = e.exchange + " - " + e.pair;
						return {value: value, label: value};
					});
					return p;
				});
				const pairsFinal = [].concat.apply([], p);
				AlertManager.getPriceAlerts(req.session.user._id, (e, alerts) => {
					res.json({
						title : 'Price Alerts',
						exchanges: ['Bitmex','Binance'],
						pairs : pairsFinal,
						userData : req.session.user,
						alerts: alerts,
						botName:process.env.BOT_NAME
					});
				});
			});
		}
	});

	app.delete('/api/alerts/:id', function(req, res) {
		AlertManager.deletePriceAlertById(req.params.id, (e, o) => {
			if (e){
				res.json({error: true, message: 'Error deleting alert'});
			}	else{
				res.json({success: true, message: 'Alert has been deleted'});
				SQS.send('PRICE_ALERT_UPDATED');
			}
		});
	});

	/******************\
		new accounts
	\*******************/
	
	app.post('/api/signup', function(req, res) {
		AcccountManager.addNewAccount({
			company	: req.body['company'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass']
		}, function(e){
			if (e){
				res.status(400).json({error: true, message: e});
			}	else{
				res.status(200).json({success: true});
			}
		});
	});

	/******************\
		password reset
	\*******************/

	app.post('/api/lost-password', function(req, res){
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

	app.get('/api/reset-password', function(req, res) {
		AcccountManager.validatePasswordKey(req.query['key'], req.ip, function(e, o){
			if (e || o == null){
				res.redirect('/');
			} else{
				req.session.passKey = req.query['key'];
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/api/reset-password', function(req, res) {
		let newPass = req.body['pass'];
		let passKey = req.session.passKey;
		// destory the session immediately after retrieving the stored passkey
		req.session.destroy();
		AcccountManager.updatePassword(passKey, newPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});
	
	
	app.get('/api/*', function(req, res) { res.status(404).json({error: true, message: 'Page not found'}); });
	app.get('/*', function(req, res) { 
		res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
	});

};



