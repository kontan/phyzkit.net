(function(){
	var footer = $('script[src="/footer.js"]');
	$.get("/footer.html", function(data){
		footer.after($('<div/>').html(data));
        footer.remove();
    });
})();