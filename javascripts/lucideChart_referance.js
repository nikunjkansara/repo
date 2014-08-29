var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
var rowChart = dc.rowChart("#dc-row-graph");

var pieChart = dc.pieChart("#dc-pie-graph");  
var volumeChart = dc.barChart("#dc-volume-chart");
var collectionRate = dc.barChart("#dc-collection-rate-stacked");
var dataTable = dc.dataTable("#dc-table-graph");
//var collectionRate =dc.barChart("#dc-collection-rate-stacked");
var menu = d3.selectAll("#menu select")
.on("change", change);

var readData1,readData2,readData3,readData, ages, result,treeData, filterTreeValue="", tree_index=1 ;
var option_value;
//define array for practice name check boxes
var searchPracticeArray = [];
var practiceDimension1= [];
var practiceDimension2 = [];

//define array for place of service check boxes
var searchLocationArray = [];
var searchLocationArrayValues = [];
var location1= [];
var location2= [];
//define array for contain tree data
var tree_field_data = Array();
var dateFormat = d3.time.format("%m/%d/%Y");

d3.csv("../data/data_LPS_1.csv", function (che_data) { 	
    
                
    /*che_data.forEach(function(e) {
        e.dd = dateFormat.parse(e.month_year_dos);
    //console.log(e.dd);
    });*/    
    readData1 = che_data;    
 	loadOther();	
});
function loadOther()
{
d3.tsv("../data/lucidChartNew.csv", function (che_data) {    
    
    readData2 = che_data;    
    readData = readData1;    
    redraw();    
});
}
  
function change()
{
    //dc.redrawAll();    
    dc.filterAll();
    d3.transition()
    .each(redraw);
    
}
        
function redraw() {   	
	

    option_value = d3.selectAll("#menu select").property("value");
    //default set all array o null
    searchPracticeArray = [];    
    searchLocationArray = [];    
    searchProviderArray = [];
    searchChargeArray = [];
    
    var total_payment = 0;    
    
    var practiceDimension;
    var ndx,ndx1;
    ndx = crossfilter(readData);
    ndx1 = crossfilter(readData2);    
    
    
    practiceDimension = ndx.dimension(function (d) {	
	    return d.location_name;
    });          
    var ChargesDimension = ndx.dimension(function (d) { return d.location_name; });
    
    var practiceGroup = practiceDimension.group().reduceSum(function(d) {
        return d.counts;
    });
    
    var practiceDimensionGroup = practiceDimension.group().reduce(
        //add
        function(p,v){
            //++p.count;
            p.count += parseFloat(v.counts);
            p.charges_sum += parseFloat(v.charge_amt);
            p.RVUs_sum += parseFloat(v.wrvu);
            p.charges_avg = p.charges_sum / p.count;
            p.RVUs_avg = p.RVUs_sum / p.count;
			
            total_payment += (parseFloat(v.pay_amt) * -1);
            return p;
        },
        //remove
        function(p,v){
            //--p.count;
            p.count -= parseFloat(v.counts);
            p.charges_sum -= parseFloat(v.charge_amt);
            p.RVUs_sum -= parseFloat(v.wrvu);
            p.charges_avg = p.charges_sum / p.count;
            p.RVUs_avg = p.RVUs_sum / p.count;
			
            total_payment -= (parseFloat(v.pay_amt) * -1);
            return p;
        },
        //init
        function(p,v){
            return {
                count: 0, 
                charges_sum: 0.0, 
                RVUs_sum: 0.0, 
                charges_avg: 0.0, 
                RVUs_avg: 0.0
            };
        });
    
    //lucid Chart practice dimenion
    var lucidPracticeDimension = ndx1.dimension(function(d){        
	return d.Measure_id;
    });   
        
    
    var lucidPracticeDimensionGroup = lucidPracticeDimension.group();    
    
    // for pieChart
    var startValue = ndx.dimension(function (d) {       
        return d.place_of_service;
    });
    
    
    var startValueGroup = startValue.group().reduceSum(function(d) {	   
        return d.counts;
    });
    var k = 0;
    // for pieChart
    var lucidPieChart = ndx1.dimension(function (d) {
	return d.Description;	
    });
    
    var lucidPieChartGroup = lucidPieChart.group();
    
    // for barChart
    var barValue = ndx.dimension(function (d) {
        return Math.floor(d.wrvu);
    });
    var barValueGroup = barValue.group().reduceSum(function(d) {
        return d.counts;
    });
    
    //for collection rate
    var collectionValue = ndx.dimension(function (d) {
        return Math.floor(d.charge_amt);
    });
    
    var collectionValueGroup = collectionValue.group().reduceSum(function(d) {
        return d.counts;
    });    
    
    
    // Bar chart For pricing
    var collectionRateValue = ndx.dimension(function (d) {
        return d3.time.month(dateFormat.parse(d.month_year_dos));
    });
	
	var collectionRateValueGroup_adj = collectionRateValue.group().reduceSum(function(d) {
        return d.counts * -1;
    });
    var collectionRateValueGroup_payment = collectionRateValue.group().reduceSum(function(d) {
        return d.pay_amt * -1;
    });
    var collectionRateValueGroup_ar_bal = collectionRateValue.group().reduceSum(function(d) {
        return d.charge_amt;
    });
    
    var collectionRateValueGroup_payment_line = collectionRateValue.group().reduceSum(function(d) {
        return d.pay_amt * -1;
    });
    
	
    // for collectionRatePctChart
    var collectionRatePctValue = ndx.dimension(function (d) {
        return d3.time.month(dateFormat.parse(d.month_year_dos));
    });
   
    // Show chart on screen
    bubbleChart.width(850)    
    .height(300)    
    .dimension(lucidPracticeDimension)
    .group(lucidPracticeDimensionGroup)
    .transitionDuration(100)
    .colors(d3.scale.category20())
    .margins({
        top: 10, 
        right: 50, 
        bottom: 30, 
        left: 50
    })
    .colorDomain([-12000, 12000])
    .x(d3.scale.linear().domain([0, 2000]))
    .y(d3.scale.linear().domain([0, 3000]))
    .r(d3.scale.linear().domain([0, 1000000]))  
    .keyAccessor(function (p) {	
        return (parseInt(p.value*3.7));
	//return 100;
    })
    .valueAccessor(function (p) {
        return ((p.value));
	//return 100;
    })
    .radiusValueAccessor(function (a) {
        return a.value*20
    })    
    .transitionDuration(1500)
    .elasticY(false)
    .elasticX(true)
    //.elasticRadius(true)
    .yAxisPadding(1000)
    .xAxisPadding(800)
    // (optional) render horizontal grid lines, :default=false
    .renderHorizontalGridLines(true)
    // (optional) render vertical grid lines, :default=false
    .renderVerticalGridLines(true)
    .label(function (p) {
        return p.value;
    })    
    /*.on("postRedraw", function (chart) {
        dc.events.trigger(function () {
            //console.log(total_payment);
            });
    })*/
    .renderLabel(true).xAxis().ticks(12);
          
          
    pieChart.width(190)
    .height(500)    
    .transitionDuration(1500)
    .dimension(startValue)
    .group(startValueGroup, "StartValue")
    .radius(90)    
    .minAngleForLabel(0.5)
    .legend(dc.legend().x(5).y(200))
    .title(function(d) {
        return d.key + ": " + d.value;
    })
    
    .renderTitle(false)
    .on("filtered", function (chart) {
        dc.events.trigger(function () {
            //console.log(total_payment);
            });
    });
    
    var rowHeight = lucidPracticeDimensionGroup.length * 40;    
    
    rowChart.width(750)
    .height(rowHeight)
    .margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(lucidPracticeDimension)
    .group(lucidPracticeDimensionGroup)
    .colors(d3.scale.category20())
    .label(function (d){
       return d.value;
    })
    .renderTitle(false)
    .elasticX(true)
    .xAxis().ticks(20);
    
    
    volumeChart. width(650)
    .height(200)
    .margins({
        top: 10, 
        right: 50, 
        bottom: 30, 
        left: 50
    })
    .dimension(barValue)
    .transitionDuration(1500)
    .group(barValueGroup, "Bars")
    .gap(5)
    .colorDomain(['#fdd0a2'])
    //.centerBar(flase)
    .x(d3.scale.linear().domain([0, 30]))
    .legend(dc.legend().x(550).y(0))
    .elasticY(true);
    
    
    //this is for collection rate
    
    collectionRate.width(720)
    .height(200)
    .margins({
        top: 10, 
        right: 75, 
        bottom: 30, 
        left: 80
    })
    .dimension(collectionRateValue)
    .group(collectionRateValueGroup_payment, "Payment")
    .stack(collectionRateValueGroup_adj, "count")
    .stack(collectionRateValueGroup_ar_bal, "charge amt")
    .transitionDuration(1500)
    .xUnits(d3.time.months)
    .x(d3.time.scale().domain([new Date(2012, 11, 1), new Date(2013, 12, 31)]))
    .gap(10)
    .centerBar("true")
    .colorDomain(['#fdd0a2'])
    .round(d3.time.month.round)    
    .elasticY(true)        
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .legend(dc.legend().x(750).y(0));


    dataTable.width(800).height(800)
	.dimension(ChargesDimension)	
	.group(function(d) { return d.location_name})
	.size(100)
    .columns([
        function(d) { return d.provider_name; },
		//function(d) { return ""; },
        function(d) { return d.location_name; },
        function(d) { return d.wrvu; },
        function(d) { return d.charge_amt; },		
	function(d) { return d.cpt_code; },
	function(d) { return d.counts; }
    ])
    .sortBy(function(d){ return d.provider_name; })    
    .order(d3.ascending);   
    
    dc.renderAll();
    dc.redrawAll();
    d3.select("#dc-pie-graph > svg > g").attr("transform", "translate(100,100)");
    
    //this if for append text title on y and x axis in bubble chart
    var yScale = d3.scale.linear()
		.domain([0,d3.max(10)])
		.range([100, 0]);
    var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient('left');

	//Create Y axis
    var svg = d3.select("#dc-bubble-graph svg g")		   
		    //Create Y axis label
		    svg.append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", -5)
	    .attr("x",-135)
	    .attr("dy", "1em")
	    .attr("text-anchor", "middle")
	    .attr("class", "bubble_label")
	    .text("Average Charge Amount");
	    
    var xScale = d3.scale.ordinal().rangeRoundBands([0, 940], 0.05);
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var svg = d3.select("#dc-bubble-graph svg g"); 	
    svg.append("text")
	    .attr("transform", "rotate(0)")
	    .attr("y", 320)
	    .attr("x",420)
	    .attr("dx", "1em")
	    .style("text-anchor", "middle")
	    .attr("class", "bubble_label")
	    .text("Total RVUs");    


	/* this is the tool tip code for all charts*/
	
	var pieTip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function (d) { return "<span style='color: #FFF'>" +  d.data.key + "</span> : "  + d.value; });
	  
	d3.selectAll(".pie-slice").call(pieTip);        
	d3.selectAll(".pie-slice").on('mouseover', pieTip.show)
	  .on('mouseout', pieTip.hide);
	
	var bubbleTip = d3.tip()
	  .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function (p) { return "<span style='color: #FFF'>" + p.key + "</span>"   });
	  
	d3.selectAll(".bubble").call(bubbleTip);        
	d3.selectAll(".bubble").on('mouseover', bubbleTip.show)
	    .on('mouseout', bubbleTip.hide);
	
	//call to function for create tree view*/
	//createTreeview();
}

/*Function for create tree view*/
function createTreeview()
{

d3.select("#inner_tree_view").html("");

var margin = {top: 30, right: 20, bottom: 30, left: 20},
    width = 400 - margin.left - margin.right,
    barHeight = 20,
    barWidth = width * .8;

var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

svg = d3.select("#inner_tree_view").append("svg")
	.attr("width", width + margin.left + margin.right)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

var tree_data = Array();
tree_data.push({
	name : option_value,
	children : tree_field_data
});
tree_data = JSON.stringify(tree_data);
tree_data = tree_data.substring(1,tree_data.length-1);	
json = JSON.parse(tree_data);
json.x0 = 0;
json.y0 = 0;

update(root = json);


function update(source) {

  // Compute the flattened node list. TODO use d3.layout.hierarchy.
  var nodes = tree.nodes(root);

  var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", barWidth)
      .style("fill", color)
      .on("click", click);

  nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return d.name; });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 1e-6)
      .remove();

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
	
	d3.select("#treeview svg").attr("height",height);	
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}
	
}
/*function end here*/

/*This is for apply filter by click on tree */
var tree_index = 1;
$("#treeview").delegate("svg g","click",function () { 
	if(tree_index == 1) { 
		value =	$(this).text();
		if(value != "" && value != "Location"){
			filterTreeValue = value;				
			redraw();
		}
	} 
	if(tree_index > 1){
		tree_index = 0;
	}
	tree_index++;
	
});

/*end here */
