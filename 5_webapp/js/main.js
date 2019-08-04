$(function() {

    // Set up globals
    var width = 950,
        height = 500,
        margin = {top: 10, right: 100, bottom: 50, left: 175},
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

    function fill_null(d) {
        var filled = false;
        for (i=0; i<d.length; i++){
            if (!d[i].hourly_90) { 
                d[i].hourly_90 = 100;
                filled = true;
            };
            if (!d[i].hourly_75) { 
                d[i].hourly_75 = 100;
                filled = true;
            };
            if (!d[i].hourly_med) { 
                d[i].hourly_med = 100;
                filled = true;
            };
            if (!d[i].hourly_25) { 
                d[i].hourly_25 = 100;
                filled = true;
            };
            if (!d[i].hourly_10) { 
                d[i].hourly_10 = 100;
                filled = true;
            };
        }
        return filled;
    };

    function format_qa_output(data){
        var grouped = d3.nest()
            .key(function(d) { return d.question_id; })
            .entries(data);
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
                    out = out + "<p><i>Answer " + (i+1) + ":</i><br>" + d.values[i].answers + "</p>";
                };
                return out; 
            })
            .style("height", function(d) { return 100*d.values.length + "px" });
    };

    function dashboard(data) {

        svg.selectAll("*").remove();
        d3.selectAll("#wage_note").remove();

        var f = fill_null(data);
        if (f) {
            d3.select("#stats")
                .append("p")
                .attr("id", "wage_note")
                .style("font-size", 10)
                .html("Note: the Bureau of Labor Statistics does not record hourly wage values that exceed $100/hr.")
        };

        // Boxplots

        // Show the Y scale
        var y = d3.scaleBand()
            .range([figheight, margin.bottom])
            .domain(d3.map(data, function (d) { return d.occupation; }).keys())
            .paddingInner(1)
            .paddingOuter(.5);
        svg.append("g")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(d3.axisLeft(y))
            .selectAll("text")  
            .style("text-anchor", "end");

        // Show the X scale
        var x = d3.scaleLinear()
            .domain([0, d3.max(data , function (d) { return d.hourly_90 }) + 5])
            .range([ margin.left, (margin.left+figwidth) ])
        svg.append("g")
            .attr("transform", "translate(0," + figheight + ")")
            .call(d3.axisBottom(x));
        svg.append("text")             
            .attr("transform",
                  "translate(" + (margin.left + figwidth/2) + "," + (height - margin.bottom + 20) + ")")
            .style("text-anchor", "middle")
            .style("font-size", 10)
            .text("Wage ($ / Hour)");

        // Show the main horizontal line
        svg
            .selectAll("horLines")
            .data(data)
            .enter()
            .append("line")
            .attr("y1", function(d){ return y(d.occupation) })
            .attr("y2", function(d){ return y(d.occupation) })
            .attr("x1", function(d){ return x(d.hourly_10) })
            .attr("x2", function(d){ return x(d.hourly_90) })
            .attr("stroke", "black")
            .style("width", 40)

        // rectangle for the main box
        var boxHeight = figheight / (data.length + 2)
        svg
            .selectAll("boxes")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d){ return y(d.occupation)-boxHeight/2 })
            .attr("x", function(d){ return x(d.hourly_25) })
            .attr("width", function(d){ return x(d.hourly_75)-x(d.hourly_25) })
            .attr("height", boxHeight )
            .attr("stroke", "black")
            .style("fill", "steelblue")
            .style("opacity", 0.5);

        // Show the median
        svg
            .selectAll("medianLines")
            .data(data)
            .enter()
            .append("line")
            .attr("y1", function(d){ return y(d.occupation)-boxHeight/2 })
            .attr("y2", function(d){ return y(d.occupation)+boxHeight/2 })
            .attr("x1", function(d){ return x(d.hourly_med) })
            .attr("x2", function(d){ return x(d.hourly_med) })
            .attr("stroke", "black")
            .style("width", 80)

        // Employment bubble plot
        var size = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return d.employment }), 
                     d3.max(data, function (d) { return d.employment })])
            .range([5,(margin.right-10)/2]);
        svg
            .selectAll("bubbles")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", function(d){ return size(d.employment) })
            .attr("cy", function(d){ return y(d.occupation) })
            .attr("cx", margin.left+figwidth+margin.right/2)
            .attr("stroke", "black")
            .style("fill", "steelblue")
            .style("opacity", 0.5);
        svg
            .selectAll("bubblelabels")
            .data(data)
            .enter()
            .append("text")             
            .attr("transform", function(d) {
                return "translate(" + (margin.left+figwidth+margin.right/2) + "," + (y(d.occupation)-5) + ")"
            })
            .style("text-anchor", "middle")
            .style("font-size", 10)
            .text(function(d) { return d.employment });
        svg.append("text")             
            .attr("transform",
                  "translate(" + (margin.left+figwidth+margin.right/2) + "," + (height - margin.bottom + 20) + ")")
            .style("text-anchor", "middle")
            .style("font-size", 10)
            .text("Total Employment (Thousands)");
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
                    console.log(data);
                    summary.html(data.summary);
                    format_qa_output(data.questions);
                    dashboard(data.stats);
                }
            })
        });

});