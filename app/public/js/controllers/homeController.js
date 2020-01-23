
function HomeController()
{
// bind event listeners to button clicks //
	var that = this;

// handle user logout //
	$('#btn-logout').click(function(){ that.attemptLogout(); });

// confirm account deletion //
	$('#account-form-btn1').click(function(){$('.modal-confirm').modal('show')});

// handle account deletion //
	$('.modal-confirm .submit').click(function(){ that.deleteAccount(); });

	$('#price-alerts-form-button').click(function(){ that.attemptCreateAlert(); });

	this.deleteAccount = function()
	{
		$('.modal-confirm').modal('hide');
		var that = this;
		$.ajax({
			url: '/delete',
			type: 'POST',
			success: function(data){
	 			that.showLockedAlert('Your account has been deleted.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.attemptLogout = function()
	{
		var that = this;
		$.ajax({
			url: '/logout',
			type: 'POST',
			data: {logout : true},
			success: function(data){
	 			that.showLockedAlert('You are now logged out.<br>Redirecting you back to the homepage.');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}

	this.attemptCreateAlert = function()
	{
		var that = this;
		
		if($('#udataTelegramChatId').val().length === 0) {
			$.ajax({
				url: '/telegram-chat-id',
				type: 'GET',
				success: function(data){
					that.createAlert();	
				},
				error: function(jqXHR){
					console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
					if(jqXHR.status === 404) {
						$('.modal-form-errors .modal-body p').text('Please correct the following problems :');
						var ul = $('.modal-form-errors .modal-body ul');
						ul.empty();
						ul.append('<li>To set alerts and receive notifications, first link your telegram account</li>');
						$('.modal-form-errors').modal('show');
					}
				}
			});
		} else {
			that.createAlert();	
		}
	}

	this.createAlert = function()
	{
		$.ajax({
			url: '/price-alerts',
			type: 'POST',
			data: $("#price-alerts-form").serialize(),
			success: function(data){
				console.log(data);
	 			that.showLockedAlert('Your alert has been set!');
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}


	this.showLockedAlert = function(msg){
		$('.modal-alert').modal({ show : false, keyboard : false, backdrop : 'static' });
		$('.modal-alert .modal-header h4').text('Success!');
		$('.modal-alert .modal-body p').html(msg);
		$('.modal-alert').modal('show');
		$('.modal-alert button').click(function(){window.location.href = '/';})
		setTimeout(function(){window.location.href = '/';}, 3000);
	}
}

HomeController.prototype.onUpdateSuccess = function()
{
	$('.modal-alert').modal({ show : false, keyboard : true, backdrop : true });
	$('.modal-alert .modal-header h4').text('Success!');
	$('.modal-alert .modal-body p').html('Your account has been updated.');
	$('.modal-alert').modal('show');
	$('.modal-alert button').off('click');
}
