$(function() {

    // Set up globals
    var width = 900,
        height = 700,
        margin = {top: 20, right: 10, bottom: 60, left: 60},
        figwidth = width - margin.left - margin.right,
        figheight = height - margin.top - margin.bottom;

    var flask_ip = 'http://35.225.248.118:5001/'

    var query = d3.select("#query");

    var answer = d3.select("#answer");

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


    function dashboard(data) {

      // Going to need null handling soon

        console.log(d3.map(data, function (d) { return lb(d.occupation); }).keys());

        // Show the X scale
        var x = d3.scaleBand()
            .range([ margin.left, figwidth ])
            .domain(d3.map(data, function (d) { return lb(d.occupation); }).keys())
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

        console.log(x.domain)

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
              .attr("x1", function(d){ return x(lb(d.occupation)) })
              .attr("x2", function(d){ return x(lb(d.occupation)) })
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
                .attr("x", function(d){ return x(lb(d.occupation))-boxWidth/2 })
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
              .attr("x1", function(d){ return x(lb(d.occupation))-boxWidth/2 })
              .attr("x2", function(d){ return x(lb(d.occupation))+boxWidth/2 })
              .attr("y1", function(d){ return y(d.hourly_med) })
              .attr("y2", function(d){ return y(d.hourly_med) })
              .attr("stroke", "black")
              .style("width", 80)
};

    // Set up jquery ui widgets
    $( "#tabs" ).tabs();

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
                    answer.html(data.result);
                    // This will eventually contain code to render summarized text
                    // as well as code to chart data returned about the job title
                    // empl_data = [{'soc': '49-3031', 'employment': 264860, 'hourly_10': 15.0, 'hourly_25': 18.13, 'hourly_med': 22.76, 'hourly_75': 28.47, 'hourly_90': 34.7, 'occupation': 'Bus and Truck Mechanics and Diesel Engine Specialists', 'empl_2016': 278.8, 'empl_2026': 304.6, 'empl_chng': 25.8, 'empl_chng_pct': 9.2, 'entry_edu': 'High school diploma or equivalent', 'work_exp': 'None', 'otj_trainig': 'Long-term on-the-job training'}, {'soc': '53-3030', 'employment': 3130500, 'hourly_10': 10.21, 'hourly_25': 13.69, 'hourly_med': 18.66, 'hourly_75': 24.35, 'hourly_90': 30.55, 'occupation': 'Driver/Sales Workers and Truck Drivers', 'empl_2016': null, 'empl_2026': null, 'empl_chng': null, 'empl_chng_pct': null, 'entry_edu': null, 'work_exp': null, 'otj_trainig': null}, {'soc': '53-3032', 'employment': 1800330, 'hourly_10': 13.54, 'hourly_25': 16.85, 'hourly_med': 21.0, 'hourly_75': 26.16, 'hourly_90': 31.38, 'occupation': 'Heavy and Tractor-Trailer Truck Drivers', 'empl_2016': 1871.7, 'empl_2026': 1980.1, 'empl_chng': 108.4, 'empl_chng_pct': 5.8, 'entry_edu': 'Postsecondary nondegree award', 'work_exp': 'None', 'otj_trainig': 'Short-term on-the-job training'}, {'soc': '53-3033', 'employment': 915310, 'hourly_10': 9.74, 'hourly_25': 11.79, 'hourly_med': 15.78, 'hourly_75': 21.93, 'hourly_90': 30.14, 'occupation': 'Light Truck or Delivery Services Drivers', 'empl_2016': 953.5, 'empl_2026': 1015.6, 'empl_chng': 62.1, 'empl_chng_pct': 6.5, 'entry_edu': 'High school diploma or equivalent', 'work_exp': 'None', 'otj_trainig': 'Short-term on-the-job training'}, {'soc': '53-7051', 'employment': 604130, 'hourly_10': 11.98, 'hourly_25': 13.8, 'hourly_med': 16.71, 'hourly_75': 20.37, 'hourly_90': 24.82, 'occupation': 'Industrial Truck and Tractor Operators', 'empl_2016': 549.9, 'empl_2026': 585.9, 'empl_chng': 36.1, 'empl_chng_pct': 6.6, 'entry_edu': 'No formal educational credential', 'work_exp': 'None', 'otj_trainig': 'Short-term on-the-job training'}, {'soc': '53-7121', 'employment': 9000, 'hourly_10': 12.12, 'hourly_25': 14.39, 'hourly_med': 18.38, 'hourly_75': 24.2, 'hourly_90': 33.99, 'occupation': 'Tank Car, Truck, and Ship Loaders', 'empl_2016': 10.8, 'empl_2026': 11.4, 'empl_chng': 0.6, 'empl_chng_pct': 5.2, 'entry_edu': 'No formal educational credential', 'work_exp': 'None', 'otj_trainig': 'Short-term on-the-job training'}]
                    // dashboard(empl_data);
                }
            })
        });

});