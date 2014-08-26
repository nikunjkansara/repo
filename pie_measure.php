<!DOCTYPE html>
<meta charset="utf-8">
<style>

    body {
        font: 10px sans-serif;
    }

    svg {
        padding: 10px 0 0 10px;
    }

    .arc {
        stroke: #fff;
    }

</style>
<body>
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script>

        var svg = d3.select("body")
        .append("svg")
        .append("g")

        svg.append("g")
        .attr("class", "slices");
        svg.append("g")
        .attr("class", "labels");
        svg.append("g")
        .attr("class", "lines");

        var width = 960,
        height = 450,
        radius = Math.min(width, height) / 2;

        var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

        var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

        var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
        
        var arrayDinominator = []
        var arrayNumerator = [];

        d3.tsv("measure.csv", function(data) {            
            //var maxDinominator= 0;  
            d3.nest().key(function (d){ return d.Measure_id}).key(function (d){return d.Measure_id}).entries(data).map(function(d){
                d.values.map(function(dd){
                    //var denominator = 0;
                    //var numerator = 0;
                    dd.values.forEach(function(ddd){
                        //console.log(ddd);
                        arrayDinominator.push(parseInt(ddd.Denominator));
                        arrayNumerator.push(parseInt(ddd.Numerator));
                        
                    })
                    //return maxValue;
                });
                
            });
            console.log(d3.extent(arrayDinominator));
            console.log(arrayNumerator);
            
            /*for(i=0; i < measureList.length; i++)
            {
                //console.log(measureList[i].values);
                measureList[i].values.forEach(function(val,i){                    
                    groupMeasureId[val.key] = val.values.Denominator;
                    //console.log(val.values[i].Denominator);
                    
                    
                })
                //console.log(d3.max(groupMeasureId[val.key], function(d){  return d.Denominator }));
                        
                    
            }*/
            d3.nest().key(function(d) {return d.Measure_id;}).key(function(d) {return d.Measure_id;}).entries(data).map(function(d){
                //console.log(d);
                var group = d.key	    
                var max_denominator_value = d.values.map(function(dd){	
                    //console.log(dd);
                    var total = 0;
                    dd.values.forEach(function(ddd){
                        if(parseInt(ddd.Denominator) > total)
                            total = parseInt(ddd.Denominator);
                    })		
                    return total;		
                })
                //console.log(group,max_denominator_value);
            });
            /*color.domain(d3.keys(data[0]).filter(function(key) { return key !== "State"; }));

            data.forEach(function(d) {
                d.ages = color.domain().map(function(name) {
                    //console.log(name);
                    return {name: name, population: +d[name]};
                });
                //console.log(d.ages);
            });
            
            
            var legend = d3.select("body").append("svg")
            .attr("class", "legend")
            .attr("width", radius * 2)
            .attr("height", radius * 2)
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

            legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d; });

            var svg = d3.select("body").selectAll(".pie")
            .data(data)
            .enter().append("svg")
            .attr("class", "pie")
            .attr("width", radius * 2)
            .attr("height", radius * 2)
            .append("g")
            .attr("transform", "translate(" + radius + "," + radius + ")");

            svg.selectAll(".arc")
            .data(function(d) { return pie(d.ages); })
            .enter().append("path")
            .attr("class", "arc")
            .attr("d", arc)
            .style("fill", function(d) { return color(d.data.name); });

            svg.append("text")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.State; });*/

        });

    </script>