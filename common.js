

// insert common footer html into #footer_container
$(function(){
    $.get("http://phyzkit.net/footer.html", function(data){
        $('#footer_container').html(data);
    });
});


function HTMLInsertion($scope, $http){
	var p = $http.get("/footer.html");
	p.success(function(data, status, headers, config) {
		// this callback will be called asynchronously
		// when the response is available
		$scope.footer = data;
	});
	p.error(function(data, status, headers, config) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
		console.log(data);
	});
}