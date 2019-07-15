$(function() {

    url = 'http://127.0.0.1:5000/'

    var query = d3.select("#query");

    var answer = d3.select("#answer");

    var button = d3.select("#button")
        .on("click", function() {
            var v = query.property("value");
            $.post(url, {userinput: v}, function(data, status) {
                answer.html(data.result);
            })
        });

});