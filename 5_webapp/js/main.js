$(function() {

    // Set up globals
    var width = 950,
        height = 400,
        margin = {top: 10, right: 10, bottom: 50, left: 150, center: 10},
        figwidth = (width - margin.left - margin.right - margin.center) / 2,
        figheight = height - margin.top - margin.bottom,
        minbarheight = 30;

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

    function wrap(text, width) {
        // https://bl.ocks.org/mbostock/7555321
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", -9).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                console.log(text + " " + tspan.node().getComputedTextLength());
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    ++lineNumber;
                    tspan = text.append("tspan").attr("x", -9).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

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
                    out += "<p><i>Answer " + (i+1) + ":</i><br>" + d.values[i].answers + "</p>";
                };
                return out; 
            })
            .style("height", function(d) { return 100*d.values.length + "px" });
    };

    function label_stats(occ, path) {
        h = "<strong>Your question seems to relate to the '" + occ
        h += "' occupation. Here's some information about wages, employment, and qualifications for that job"
        h += " and others in the " + path + " career pathway:</strong>"
        d3.select("#stats-label")
            .html(h);
    };

    function dashboard(data) {

        // Set figure height based on number of occupations returned
        var height = Math.max(400, margin.top+margin.bottom+(data.length*minbarheight)),
            figheight = height - margin.top - margin.bottom;
        svg.attr("height", height);

        svg.selectAll("*").remove();
        d3.selectAll("#wage_note").remove();

        // Various data cleaning
        var f = fill_null(data);
        if (f) {
            d3.select("#stats")
                .append("p")
                .attr("id", "wage_note")
                .style("font-size", 10)
                .html("Note: the Bureau of Labor Statistics does not record hourly wage values that exceed $100/hr, so here those values are plotted at $100/hr.")
        };
        for (i=0; i<data.length; i++){
            data[i].employment_exp = data[i].employment*(1+(data[i].empl_chng_pct/100));
        };
        data.sort(function(a,b){
            return a.employment - b.employment;
        });
        // console.log(data);

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
            .selectAll(".tick text")
            .style("text-anchor", "end")
            .call(wrap, margin.left/2);

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
            .attr("stroke-width", 1)
            .style("fill", "steelblue");

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
        var barstart = margin.left+figwidth+margin.center;
        var x2 = d3.scaleLinear()
            .domain([1, d3.max(data, function (d) { return d.employment_exp })])
            .range([0,figwidth]);  
        svg.append("g")
            .attr("transform", "translate(" + barstart + "," + figheight + ")")
            .call(d3.axisBottom(x2).tickFormat(d3.format(".0s")));
        function lbl_loc(v) {
            return v > 75 ? v/2 : v+2;
        };
        function lbl_anchr(v) {
            return v > 75 ? "middle" : "start";
        };
        svg
            .selectAll("bars2018")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d){ return y(d.occupation)-(boxHeight/2) })
            .attr("x", barstart)
            .attr("width", function(d){ return x2(d.employment) })
            .attr("height", boxHeight/2 )
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", "steelblue");
        svg
            .selectAll("bars2026")
            .data(data)
            .enter()
            .append("rect")
            .attr("y", function(d){ return y(d.occupation) })
            .attr("x", barstart)
            .attr("width", function(d){ return x2(d.employment_exp) })
            .attr("height", boxHeight/2 )
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .style("fill", "steelblue");
        svg
            .selectAll("barlabels2018")
            .data(data)
            .enter()
            .append("text")             
            .attr("transform", function(d) {
                return "translate(" + (barstart+lbl_loc(x2(d.employment))) + "," + (y(d.occupation)-boxHeight/4+2.5) + ")"
            })
            .style("text-anchor", function(d) { return lbl_anchr(x2(d.employment)) })
            .style("font-size", 10)
            .text("2018");
        svg
            .selectAll("barlabels2026")
            .data(data)
            .enter()
            .append("text")             
            .attr("transform", function(d) {
                return "translate(" + (barstart+lbl_loc(x2(d.employment_exp))) + "," + (y(d.occupation)+boxHeight/4+2.5) + ")"
            })
            .style("text-anchor", function(d) { return lbl_anchr(x2(d.employment_exp)) })
            .style("font-size", 10)
            .text("2026 (Expected)");
        svg
            .append("text")             
            .attr("transform",
                  "translate(" + (margin.left+figwidth+margin.center+figwidth/2) + "," + (height-margin.bottom+20) + ")")
            .style("text-anchor", "middle")
            .style("font-size", 10)
            .text("Employment, Thousands of Workers");
    };

    // Set up jquery ui widgets
    $( "#tabs" ).tabs();
    $( "#accordion" ).accordion();
    $( "#progressbar" ).progressbar({ value : false });
    $( ".progress-label" );

    // Set up button to submit query
    var button = d3.select("#button")
        .on("click", function() {
            var v = query.property("value");
            d3.select("#error").html("");
            $( "#effect" ).toggle( "blind", 500 );
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
                    label_stats(data.questions[0].closest_occupation, data.questions[0].closest_pathway);
                    dashboard(data.stats);
                    $( "#effect" ).toggle( "blind", 500 );
                },
                error: function() {
                    d3.select("#error").html("<strong>Oh no! Something went wrong. Please try another query.<strong>");
                    $( "#effect" ).toggle( "blind", 500 );
                }
            })

        });

});