
$(document).ready(function(){

	$('#btn-create-price-alert').click(function() {
		$('.modal-create-price-alert').removeClass('hide');
		$('.overlay').removeClass('hide');
	});
	$('#btn-cancel-create-price-alert').click(function() {
		$('.modal-create-price-alert').addClass('hide');
		$('.overlay').addClass('hide');
	});

});