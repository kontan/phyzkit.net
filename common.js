

// insert common footer html into #footer_container
$(function(){
    $.get("http://phyzkit.net/footer.html", function(data){
        $('#footer_container').html(data);
    });
});