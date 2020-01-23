
const CT = require('./modules/country-list');
const AcccountManager = require('./modules/account-manager');
const EM = require('./modules/email-dispatcher');
const TP = require('./modules/trading-pair-list');
const AlertManager = require('./modules/alert-manager');
const PubSub = require('pubsub-js');

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
	price alerts

*/

	app.post('/price-alerts', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AlertManager.addPriceAlert({
				userId	: req.session.user._id,
				price	: req.body['price'],
				pair	: req.body['pair'],
				cross	: req.body['cross'],
				message : req.body['message']
			}, (e, o) => {
				if (e){
					res.status(400).send('error-adding-price-alert');
				}	else{
					PubSub.publish('UPDATE PRICE ALERT LIST');
					res.status(200).send('ok');
				}
			});
		}
	});

	app.post('/delete_alert/:id', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AlertManager.deletePriceAlertById(req.params.id, (e, o) => {
				if (e){
					res.status(400).send('error-deleting-price-alert');
				}	else{
					PubSub.publish('UPDATE PRICE ALERT LIST');
					res.redirect('/price-alerts');
				}
			});
		}
	});

	app.get('/price-alerts', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
			AlertManager.getPriceAlerts(req.session.user._id, (e, alerts) => {
				res.render('price-alerts', {
					title : 'Price Alerts',
					pairs : TP,
					udata : req.session.user,
					alerts: alerts,
					botName:process.env.BOT_NAME
				});
			});
		}
	});

	app.get('/telegram-chat-id', (req, res) => {
		if (req.session.user == null){
			res.redirect('/');
		}	else{
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
			})
		}
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
