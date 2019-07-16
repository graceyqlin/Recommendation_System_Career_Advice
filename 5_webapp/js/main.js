$(function() {

    // Set up globals
    var width = 900,
        height = 700,
        margin = {top: 20, right: 10, bottom: 60, left: 60},
        figwidth = width - margin.left - margin.right,
        figheight = height - margin.top - margin.bottom;

    var flask_url = 'http://127.0.0.1:5000/'

    var query = d3.select("#query");

    var answer = d3.select("#answer");

    var svg = d3.select("#stats").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Set up jquery ui widgets
    $( "#tabs" ).tabs();

    var button = d3.select("#button")
        .on("click", function() {
            var v = query.property("value");
            $.post(flask_url, {userinput: v}, function(data, status) {
                answer.html(data.result);
                // This will eventually contain code to render summarized text
                // as well as code to chart data returned about the job title
            })
        });

});