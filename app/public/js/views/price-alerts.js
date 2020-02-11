
$(document).ready(function(){

	var hc = new HomeController();

	$('#btn-create-price-alert').click(function() {
		$('.modal-create-price-alert').removeClass('hide');
		$('.overlay').removeClass('hide');
	});
	$('#btn-cancel-create-price-alert').click(function() {
		$('.modal-create-price-alert').addClass('hide');
		$('.overlay').addClass('hide');
	});

	$('#btn-link-telegram').click(function() {
		$('.modal-link-telegram').removeClass('hide');
		$('.overlay').removeClass('hide');
	});
	$('#btn-cancel-link-telegram').click(function() {
		$('.modal-link-telegram').addClass('hide');
		$('.overlay').addClass('hide');
	});
	$('.btn-delete-price').click(function(){
		var id = $(this).attr('data-id');
		const xhttp = new XMLHttpRequest();
    	xhttp.open("DELETE", `/alerts/${id}`, false);
    	xhttp.send();
    	location.reload();
	});

	$('#pair-list').select2({width:'100%'});
	
});