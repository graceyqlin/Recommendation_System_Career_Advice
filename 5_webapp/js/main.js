$(function() {

    // Set up globals
    var width = 900,
        height = 700,
        margin = {top: 20, right: 10, bottom: 60, left: 60},
        figwidth = width - margin.left - margin.right,
        figheight = height - margin.top - margin.bottom;

    var flask_ip = 'http://35.225.248.118:5001/'

    var query = d3.select("#query");

    var summary = d3.select("#summary");

    var q_a = d3.select("#accordion");

    var svg = d3.select("#stats").append("svg")
        .attr("width", width)
        .attr("height", height);

    function lb(s) {
        if (s.length < 10) { return s }
        else { 
            spl = s.split(" ");
            spaces = spl.length - 1;
            br = Math.ceil(spaces / 2);
            return spl.slice(0, br).join(" ") + "\n" + spl.slice(br,spaces+1).join(" ");
        };
    };

    function format_qa_output(data){
        var grouped = d3.nest()
            .key(function(d) { return d.question_id; })
            .entries(data);
        console.log(grouped);
        q_a
            .selectAll("h3")
            .data(grouped)
            .html(function(d) { return d.values[0].question_body; });
        q_a
            .selectAll("div")
            .data(grouped)
            .html(function(d) { 
                out = "";
                for (i=0; i<d.values.length; i++){
                    out = out + "<p>Answer" + (i+1) + ":<br>" + d.values[1].answers + "</p>";
                };
                console.log(out);
                return out; 
            });
    };

    function dashboard(data) {

      // Going to need null handling soon

        svg.selectAll("*").remove();

        // console.log(d3.map(data, function (d) { return d.occupation; }).keys());

        // Show the X scale
        var x = d3.scaleBand()
            .range([ margin.left, figwidth ])
            .domain(d3.map(data, function (d) { return d.occupation; }).keys())
            .paddingInner(1)
            .paddingOuter(.5);
        svg.append("g")
            .attr("transform", "translate(0," + figheight + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")  
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Show the Y scale
        var y = d3.scaleLinear()
            .domain([0, d3.max(data , function (d) { return d.hourly_90 }) + 5])
            .range([figheight, margin.bottom])
        svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.axisLeft(y));

        // Show the main vertical line
        svg
            .selectAll("vertLines")
            .data(data)
            .enter()
            .append("line")
              .attr("x1", function(d){ return x(d.occupation) })
              .attr("x2", function(d){ return x(d.occupation) })
              .attr("y1", function(d){ return y(d.hourly_10) })
              .attr("y2", function(d){ return y(d.hourly_90) })
              .attr("stroke", "black")
              .style("width", 40)

        // rectangle for the main box
        var boxWidth = figwidth / (data.length + 2)
        svg
            .selectAll("boxes")
            .data(data)
            .enter()
            .append("rect")
                .attr("x", function(d){ return x(d.occupation)-boxWidth/2 })
                .attr("y", function(d){ return y(d.hourly_75) })
                .attr("height", function(d){ return y(d.hourly_25)-y(d.hourly_75) })
                .attr("width", boxWidth )
                .attr("stroke", "black")
                .style("fill", "steelblue")

        // Show the median
        svg
            .selectAll("medianLines")
            .data(data)
            .enter()
            .append("line")
              .attr("x1", function(d){ return x(d.occupation)-boxWidth/2 })
              .attr("x2", function(d){ return x(d.occupation)+boxWidth/2 })
              .attr("y1", function(d){ return y(d.hourly_med) })
              .attr("y2", function(d){ return y(d.hourly_med) })
              .attr("stroke", "black")
              .style("width", 80)
    };

    // Set up jquery ui widgets
    $( "#tabs" ).tabs();
    $( "#accordion" ).accordion();

    var button = d3.select("#button")
        .on("click", function() {
            var v = query.property("value");
            $.ajax({
                beforeSend: function(req){
                    req.setRequestHeader("Access-Control-Allow-Origin","*");
                },
                type: "POST",
                url: flask_ip, 
                data: {userinput: v}, 
                success: function(data, status) {
                    summary.html(data.summary)
                    // + "<br><br>" + JSON.stringify(data.questions, null, 2));
                    format_qa_output(data.questions);
                    dashboard(data.stats);
                    // https://jqueryui.com/accordion/
                }
            })
        });

});