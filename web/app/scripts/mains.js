var refreshPortfolio;

$(window).load(function(){
  refreshPortfolio = function(ev) {
    $('.portfolioFilter .current').removeClass('current');
    ev.addClass('current');
  };


 	$("#uploadBtn").onchange = function () {
    	$("#uploadFile").value = this.value;
    	console.log(this.value);
	};
});

