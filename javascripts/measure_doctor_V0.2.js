//set top header z-index to 0
$(".navbar-fixed-top").css('z-index','0')
$(".navbar-fixed-bottom").css('z-index','0')

//append loading effect
$.blockUI({ message: '<img src="images/loading.gif" /><h3> Please Wait</h3>' });

//define chart variables
var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
var rowChart = dc.rowChart("#row-graph");
var pieChartDenominator = dc.pieChart("#dc-pie-graph_denominator");
var pieChartNumerator = dc.pieChart("#dc-pie-graph_numerator");
var stackChart = dc.barChart("#denominator_numerator_stack");

var measureNames=[];

var pie_max_denominator_arr=[],pie_max_numerator_arr=[],stack_max_denominator_arr=[],stack_max_numerator_arr=[];

//define variable for contain filter data for bubble chart
var bubble_text = [];

//define transitionDurationValue for all charts transitionDuration
var transitionDurationValue = 800;

//define the array list for data table operation
var data_table_data, table_filter_data = [],table_filter_data_measure = [], table_filter_data_doctor = [], table_filter_data_region = [];

//define array for all measure id's and return actual value     
var mesure_values = {
	    'EA1B89D2-A6B0-4CA4-BC8F-A4F6E4A9030E' : 'IVD Antithrombotic Neuro',
	    '7EDBB118-73D8-4625-9227-CB6857ECF26C' : 'LDL Control',
	    '16DD1D03-FC36-41DA-B628-FE5FDA8C4EA0' : 'Chlamydia Screening',
	    '41FD2DB3-D29C-494A-BC96-D43B22D5754D' : 'HIV/AIDS',
	    '8A6CFD1E-E0FC-4999-BD2B-6521142F2B80' : 'Lipid LT 100',
	    '0EA806A0-BA8E-422A-B909-0A9758057D22' : 'Antiplatelet',
	    'D1369E14-A3B4-4949-9476-15742E406D3C' : 'CAD Lipid Lowering Drugs',
	    'B2C981A6-BE1B-4C73-A2A8-18E30ECE3707' : 'Lipid Testing',
	    '6041FEEB-20CE-4CE9-B0AD-2652CF08ABAA' : 'Pneumonia Vaccination',
	    '4BEA4AE5-6F1A-4CC0-BB5B-4F128D4D6E6A' : 'Influenza',
	    '8321E347-BA9F-4C9F-ACE4-520E111D782F' : 'Depression',
	    '92877B4E-A96E-45A4-8734-53D5A6100069' : 'Heart Failure ACE Arb',
	    'B28AF571-9833-474D-8F35-5BC557C89BEE' : 'IVDBP',
	    'FD13C439-E2CC-4D4E-B5B2-67E8A976BB95' : 'Diabetes: Eye Exam',
	    '9B6F3897-53F0-40EE-BFBC-6DD4162618F8' : 'BMI',
	    '086B0985-E4AD-43C1-9C22-88CFBE261E3F' : 'HbA1C > 9',
	    '61173E6E-083D-4F59-8097-921C8AD4A8F0' : 'HTN',
	    'D03562F7-FF8A-405C-BCA9-94DEC092F33E' : 'Diabetes: Nephro Screening',
	    '849E7DDB-8DDB-4175-982D-974EFAFB808F' : 'Osteoarthritis OTC Meds',
	    'DDF1489B-C3F6-46C3-A403-B5F7D0C9E379' : 'HbA1C < 8',
	    'ED87A3EC-8929-4397-B1AB-B6E3460F63E7' : 'Colon Cancer Screening',
	    '6F3C49DB-F20A-40AE-846E-B79DE7343243' : 'Colon Cancer Screening Education',
	    'D06F1D7A-1E8A-4DAD-8ED0-B95ACFB2F2D4' : 'Diabetes: Foot Exam',
	    '11E825E0-F8A8-4BEB-8C9A-BD8F4EB33814' : 'Heart Failure Beta',
	    '5A58F529-B673-4BC7-B686-CB9B3B755778' : 'Mammo',
	    'BD246D76-724D-4CB8-BC0A-D2AD73EB2801' : 'Cervical Cancer Screening',
	    'F1670A16-6D8A-4B33-9EC7-E62382F5031B' : 'IVD Antithrombotic',
	    '2F3C6ED6-D3DB-498F-B881-ED9A3A66E476' : 'Smoking',
	    'BD709062-B9D6-406F-BCED-FD892B81ED6E' : 'Osteoarthritis F and P'
	    };
    




var lucidData, lucidFilterData;

d3.tsv("data/measure.csv", function (che_data) {    
    
    //apped data afetr load from file
    lucidData = che_data;        
    
    //append data after filterout all data
    lucidFilterData = crossfilter(lucidData);    
    
    //define for bubble chart
    var measureVal = lucidFilterData.dimension(function (d) { return d.Region_id; });    
    var measureGroup = measureVal.group().reduce(
	    //add
	    function(p,v){
		    //console.log(v.Description+"<><>"+v.Measure_id+"<><>"+v.Denominator+"<><>"+v.Numerator);
		    ++p.count;

		    p.Denominator = parseInt(p.Denominator) + parseInt(v.Denominator) ;
		    p.Numerator = parseInt(p.Numerator) + parseInt(v.Numerator);
		    p.charges_avg = parseInt((p.Numerator/p.Denominator)*100);
		    p.Description = v.Description;
                    p.Region_id = v.Region_id;
		    p.nume_avg = parseFloat(p.Numerator);
		    p.deno_avg = parseFloat(p.Denominator);		    
		    return p;
	    },
	    //remove
	    function(p,v){
		    --p.count;
                    p.Region_id= v.Region_id;
		    p.Denominator -= parseInt(v.Denominator);
		    p.Numerator -= parseInt(v.Numerator);
		    p.charges_avg =  parseInt((p.Numerator/p.Denominator)*100);
		    p.Description = v.Description;
		    p.nume_avg = (parseFloat(p.Numerator) / 29);
		    p.deno_avg = (parseFloat(p.Denominator) / 29);		    
		    return p;
	    },
	    //init
	    function(p,v){
		    return {count: 0, Denominator: 0, Numerator: 0, charges_avg: 0, deno_avg: 0, nume_avg: 0, max_numeraotr:0, Region_id:0};
	    }
    );     
    //======================== Pie Chart Variables ====================================    
            
            //Denominator
            var lucidPieDenominatorDimension = lucidFilterData.dimension(function (d,i) {  return mesure_values[d.Measure_id];});            
            // group on the base of numerator for measure
            var lucidPieDimensionDenominatorGroup =lucidPieDenominatorDimension.group().reduce(
                        //add
                        function(p,v){                                                                                    
                                    return (p > parseInt(v.Denominator)) ? p : parseInt(v.Denominator);
                        },
                        //remove
                        function(p,v){                                            
                                return (p < parseInt(v.Denominator)) ? p : parseInt(v.Denominator);
                        },
                        //init
                        function(p,v){
                                return 0;
                        }
            );
            
            //numerator
            var lucidPieNumeratorDimension = lucidFilterData.dimension(function (d,i) {  return mesure_values[d.Measure_id];});            
            // group on the base of numerator for measure
            var lucidPieNumeratorDimensionGroup =lucidPieNumeratorDimension.group().reduce(
                        //add
                        function(p,v){                                                                                    
                                    return (p > parseInt(v.Numerator)) ? p : parseInt(v.Numerator);
                        },
                        //remove
                        function(p,v){                                            
                                return (p < parseInt(v.Numerator)) ? p : parseInt(v.Numerator);
                        },
                        //init
                        function(p,v){
                                return 0;
                        }
            );
            
            
                        
    //======================== Pie Chart Variables End Here ====================================
    
    //======================== Stack Chart Variables ====================================
    
            // for pieChart base on measure
            var lucidStackDimension = lucidFilterData.dimension(function (d,i) {  return mesure_values[d.Measure_id];});
            
            //push all the measures in the measureName array for show in the stack chart at x-axis
            lucidStackDimension.group().all().forEach(function(d){
                        measureNames.push(d.key);
            });           
            
            // group on the base of denominator and numerator for measure
            var lucidStackDimensionDenomiatorGroup = lucidStackDimension.group().reduceSum(function(d){
                                    return d.Denominator
                        });
            var lucidStackDimensionNumeratorGroup = lucidStackDimension.group().reduceSum(function(d){
                                    return d.Numerator
                        });
    //======================== Stack Chart Variables End Here ====================================
    
    //======================== Row Chart Variables End Here ====================================
    
    var lucidRowChartDimension = lucidFilterData.dimension(function(d){ return (d.Denominator != 0 && d.Numerator != 0) ? d.Description : ""; });       
    var lucidRowChartDimensionGroup = lucidRowChartDimension.group().reduceSum(function(d){ return (d.Denominator != 0 && d.Numerator != 0) ? d.Denominator : '';});
    
    //======================== Row Chart Variables End Here ====================================       
    
    
    // create all charts
    
    //bubble chart with respect to measure and average of denominator and numerator
   bubbleChart.width(1200)    
    .height(300)    
    .dimension(measureVal)
    .group(measureGroup)
    .transitionDuration(transitionDurationValue)
    .colors(d3.scale.category20())
    .margins({
        top: 10, 
        right: 50, 
        bottom: 30, 
        left: 50
    })    
    .x(d3.scale.linear().domain([-100, 1000]))
    .y(d3.scale.linear().domain([-100, 1000]))
    .r(d3.scale.linear().domain([0, 500]))  
    .keyAccessor(function (p) {
            
        return (p.value.Denominator/p.value.count);
    })
    .valueAccessor(function (p,i) {            
        return (p.value.Numerator/p.value.count);
    })
    .radiusValueAccessor(function (p) {            
            //return p.value.charges_avg/10;            
            return (p.value.Denominator != 0 && p.value.count != 0) ? parseInt((p.value.Denominator/p.value.count)/10) : 0;
    })        
    .elasticY(true)
    .elasticX(true)    
    .yAxisPadding(100)
    .xAxisPadding(100)    
    .renderHorizontalGridLines(true)    
    .renderVerticalGridLines(true)
    .label(function (p) {	
	//append measure value in array for filteration and tool tip 
	bubble_text[p.key] = parseInt(p.value.Denominator/p.value.count) + ":"+ parseInt(p.value.Numerator/p.value.count) + ":"+p.value.Description;;	
        return p.key;
    })        
    .renderLabel(true).xAxis().ticks(8);
    
    //Pie Chart with respect to measures on maximum denominator base
    pieChartDenominator.width(200)
    .height(200)    
    .transitionDuration(transitionDurationValue)
    .dimension(lucidPieDenominatorDimension)
    .group(lucidPieDimensionDenominatorGroup)
    .radius(90)    
    .minAngleForLabel(0.5)           
    .renderTitle(true);
    
    //Pie Chart with respect to measures on maximum numerator base
    pieChartNumerator.width(200)
    .height(200)    
    .transitionDuration(transitionDurationValue)
    .dimension(lucidPieNumeratorDimension)
    .group(lucidPieNumeratorDimensionGroup)
   // .valueAccessor(function(d){ console.log(d)})
    .radius(90)    
    .minAngleForLabel(0.5)    
    .renderTitle(true);    
    
    //=========================Stack chart, Max Denominator and Max Numerator with respect to measure id==============================
    //get width for volumeChart based on no. of record
    var title = "";
    stackChartLength= measureNames.length*32.5;    
    stackChart. width(stackChartLength)
    .height(300)
    .margins({
        top: 10, 
        right: 50, 
        bottom: 30, 
        left: 50
    })
    .dimension(lucidStackDimension)
    .transitionDuration(transitionDurationValue)
    .group(lucidStackDimensionDenomiatorGroup,"Denominator")
    .stack(lucidStackDimensionNumeratorGroup,"Numerator")
    .gap(10)    
    .renderTitle(false)    
    .colors(d3.scale.category20())    
    .x(d3.scale.ordinal().domain(measureNames))
    .xUnits(dc.units.ordinal)    
    .elasticY(true)    
      
    //=========================Stack chart End Here =================================================================================
    
    
    //=========================Row chart with respect to Doctor values===============================================================
    
    //get height according to the number of doctor's
    rowHeight = lucidRowChartDimensionGroup.all().length*30;
    
    rowChart.width(350)
    .height(rowHeight)
    .margins({top: 5, left: 10, right: 10, bottom: 20})
    .dimension(lucidRowChartDimension)
    .group(lucidRowChartDimensionGroup)
    .colors(d3.scale.category20())
    .label(function (d){
       return d.key;
    })
    .transitionDuration(transitionDurationValue)
    .renderTitle(false)
    .elasticX(true)
    .xAxis().ticks(5);
    //=========================Row chart end here ======================================================================================   
    
    
    
    //render and draw all charts	
    dc.renderAll();
    dc.redrawAll();
    
    //rotate the x axis text of stack chart
    rotateStackChartLabels()
    
    // call to data table function 
    createDataTable();
                
    
    //Function call to append x and y axis on bubble chart and tooltip for all charts
    createSVGTextAndTollTip()    
    
    //function call to create code for data table filteration for each chart
    dataTableFilteration()

	//unblock loading effect
    setTimeout($.unblockUI(), 500);
	
	//unset top header z-index to 0
	$(".navbar-fixed-top").css('z-index','1030')
	$(".navbar-fixed-bottom").css('z-index','1030')
    
});

/*
 *Function Name : rotateStackChartLabels
 *@description: Function is used for rotate the label of stack charts on x-axis
 */
function rotateStackChartLabels()
{
             stackChart.selectAll(".x text")
		.attr("transform", function(d) {
			return "translate(" + this.getBBox().height*-1 + "," + parseInt(d.length*3)+ ")rotate(-90)";
		    });
   
}

/*
 *Function Name : dataTableFilteration
 *@description: Inside this function define all data table filteration code
 */
function dataTableFilteration()
{
            //filter data table on click event by bubble chart bubbles
    $("#dc-bubble-graph .bubble, #dc-bubble-graph .node text").on('click' , function(){
	setTimeout(function(){	    	    	
	    table_filter_data_region= [];
	    if($("#dc-bubble-graph .selected").length > 0 ){		
		$.each($(".chart-body g.selected"), function(k,v) {                        
		    if(table_filter_data_region.indexOf($(v).text()) < 0){
			table_filter_data_region.push($(v).text());		    
		    }		
		});		
            }	    
	    createDataTable();
	},transitionDurationValue);
    });
    
    //filter data tabel  by when select row chart
    $(".row rect, .row text").on('click' , function(){
	setTimeout(function(){	    	    	
	    table_filter_data_doctor= [];
	    if($(".row  rect.selected").length > 0){		
		$.each($(".row  rect.selected"), function(k,v) {                        
		    if(table_filter_data_doctor.indexOf($(v).parent().text()) < 0){
			table_filter_data_doctor.push($(v).parent().text());		    
		    }		
		});	    
	    }            
	    createDataTable();
	},transitionDurationValue);
    });
    
    
    //filter data tabel on click by stack bar chart
    $("#denominator_numerator_stack ._0 rect, #denominator_numerator_stack ._1 rect").on('click' , function(){
	setTimeout(function(){	    	    	
	    table_filter_data_measure= [];
	    if($("#denominator_numerator_stack ._0 rect.selected").length > 0){		
		$.each($("#denominator_numerator_stack ._0 rect.selected"), function(k,v) {                        
                    search_text = ($(v).children('label').first().text()).split(':');
		    if(table_filter_data_measure.indexOf(search_text[0]) < 0){
			table_filter_data_measure.push(search_text[0]);
		    }		
		});	    
	    }            
	    createDataTable();
	},transitionDurationValue);
    });
    
    //filter data tabel on click by pie chart
    $(".deno_mum_pie_chart .pie-slice path").on('click' , function(){
	setTimeout(function(){	    	    	
	    table_filter_data_measure= [];
	    if($(".deno_mum_pie_chart .selected").length > 0){		
		$.each($(".deno_mum_pie_chart .selected"), function(k,v) {                        
                    search_text = ($(v).text()).split(':');                    
		    if(table_filter_data_measure.indexOf(search_text[0]) < 0){
			table_filter_data_measure.push(search_text[0]);
		    }		
		});	    
	    }            
	    createDataTable();
	},transitionDurationValue);
    });
}

/*
 *Function Name : createSVGTextAndTollTip
 *@description: Function is used for crate x and y axis label on bubble chart and and create tooltip for all chart
 */
function createSVGTextAndTollTip()
{
            //Append y axis text on bubble chart
	var svg = d3.select("#dc-bubble-graph svg g")
			
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", -5)
		.attr("x",-135)
		.attr("dy", "1em")
		.attr("text-anchor", "middle")
		.attr("class", "bubble_label")
		.text("Average Numerator");
		
	
	//Append text on x axis on bubble chart
	var svg = d3.select("#dc-bubble-graph svg g"); 	
	svg.append("text")
		.attr("transform", "rotate(0)")
		.attr("y", 320)
		.attr("x",420)
		.attr("dx", "1em")
		.style("text-anchor", "middle")
		.attr("class", "bubble_label")
		.text("Average Denominator");    
    
    
	    /* this is the tool tip code for all charts*/
	    
	    //define tooltip for buuble chart 
	    var toolTipBubble = d3.tip()
	      .attr('class', 'd3-tip')
	      .offset([-10, 0])
	      .html(function (p) {
		var avg_deno_num  = (bubble_text[p.key]).split(':');                
	        //if($(this).parent().children("g rect").attr('width') > 0){		
		    $('.d3-tip').css("background",$(this).attr('fill'));
		    $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
		    return "<span style='color: #FFF'> Region: " + p.key + "<br> Avg Deno: "+avg_deno_num[0]+"<br>Avg Nume: "+avg_deno_num[1]+"</span>"
		//}
	    });
	    
	    //define tooltip for row chart   
	    var toolTipRow = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function (p) {
	      //console.log(p);
	      //if($(this).parent().children("g rect").attr('width') > 0){		
		  $('.d3-tip').css("background",$(this).attr('fill'));
		  $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
		  return "<span style='color: #FFF'>" + p.key +" : "+p.value +"</span>"
	      //}
	    });
	    
	    //define tooltip for pie chart   
	    var toolTipPie = d3.tip()
	      .attr('class', 'd3-tip')
	      .offset([-10, 0])
	      .html(function (p) {
		    var title = ($(this).parent().children("g title").text()).split(":");		    
		    $('.d3-tip').css("background",$(this).attr('fill'));
		    $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
		    return "<span style='color: #FFF'>" + [title[0]] +":"+ title[1] + "</span>"
		
	    });
              
            //define tooltip for stack bar chart   
	    var toolTipStackBar = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function (p) {                        
	      var stack_title = $(this).children('label').first().text().split(':');              
	      //if($(this).parent().children("g rect").attr('width') > 0){		
		  $('.d3-tip').css("background",$(this).attr('fill'));
		  $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
		  return "<span style='color: #FFF'>" + stack_title[0] +" : "+stack_title[1] +"</span>"
	      //}
	    });
	    
	    
	    //call to  bubble chart  tooltip
	    d3.selectAll(".node circle").call(toolTipBubble);        
	    d3.selectAll(".bubble, .node text").on('mouseover', toolTipBubble.show).on('mouseout', toolTipBubble.hide);	    
	    
	    //call to  row chart  tooltip
	    d3.selectAll(".row rect").call(toolTipRow);	    
	    d3.selectAll(".row rect, .row text").on('mouseover', toolTipRow.show).on('mouseout', toolTipRow.hide);
	    
	    
	    //call to  pie chart  tooltip
	    d3.selectAll(".pie-slice path").call(toolTipPie);	    
	    d3.selectAll(".pie-slice path").on('mouseover', toolTipPie.show).on('mouseout', toolTipPie.hide);
                
            //call to  stack bar chart  tooltip
	    d3.selectAll(".stack_piechart ._0 rect, .stack_piechart ._1 rect").call(toolTipStackBar);	    
	    d3.selectAll(".stack_piechart ._0 rect,.stack_piechart ._1 rect").on('mouseover', toolTipStackBar.show).on('mouseout', toolTipStackBar.hide);
}

/*
 *Function Name : redrawAllCharts
 *@description: this function is call on reset event of charts and recreate all charts
 */
function redrawAllCharts()
{    
    //unset all data table filter array
    table_filter_data_measure = [];
    table_filter_data_doctor = [];
    table_filter_data_region = [];
    
    //refilter all charts
    bubbleChart.filterAll();
    rowChart.filterAll();
    pieChartDenominator.filterAll();
    pieChartNumerator.filterAll();
    stackChart.filterAll();
    
    dc.renderAll();
    dc.redrawAll();
    
    rotateStackChartLabels()
    createSVGTextAndTollTip();
    dataTableFilteration()
    setTimeout(function(){ createDataTable();},500)    
    
}

/*
 *Function Name : createDataTable
 *@description: Function is used for create data table
 */
function createDataTable()
{    
    data_table_data = lucidData;    
    //fileter datatabel on the basis of measure id's
    if(table_filter_data_measure.length > 0)
    {	
	data_table_data = data_table_data.filter(function(d,i){	    
	    return (table_filter_data_measure.indexOf(mesure_values[d.Measure_id]) >= 0);	    
	});	
    }
    
    //fileter datatabel on the basis of region id's
    if(table_filter_data_region.length > 0)
    {
        
	data_table_data = data_table_data.filter(function(d,i){	    
	    return (table_filter_data_region.indexOf(d.Region_id) >= 0);	    
	});        	
    }
    
    //fileter datatabel on the basis of doctors
    if(table_filter_data_doctor.length > 0)
    {	
	data_table_data = data_table_data.filter(function(d,i){	    
	    return (table_filter_data_doctor.indexOf(d.Description) >= 0);	    
	});	
    }
    
    heading_row_arr = [];    
    dataTable_data_measure_data = d3.nest().key(function(d) { return mesure_values[d.Measure_id]; }).entries(data_table_data);        
    
    
    dataTable_data_denominator_doctor = d3.nest().key(function(d) { return d.Description;  }).key(function(d) { return mesure_values[d.Measure_id];  }).rollup(function(d) { return d3.sum(d, function(g) {return g.Denominator; }); }).entries(data_table_data);
    dataTable_data_numerator_doctor = d3.nest().key(function(d) { return d.Description;  }).key(function(d) { return mesure_values[d.Measure_id];  }).rollup(function(d) { return d3.sum(d, function(g) {return g.Numerator; }); }).entries(data_table_data);    
    
    
    //create header of the table        
    var table_head = "";
    table_head += "<thead>";
    table_head += "<tr>";
    table_head += "<th>Doctor</th>";
    dataTable_data_measure_data.forEach(function(d){
	heading_row_arr.push(d.key);
	table_head += "<th>"+d.key+"</th>";	
    });
    table_head += "</tr>";
    table_head += "</thead>";
    table_head += "<tbody>";
    
    for(j = 0; j < dataTable_data_denominator_doctor.length; j++)
    {
	table_head += "<tr>";
	temp_column_arr = [];	
	table_tds = "";
	for(k = 0; k< dataTable_data_measure_data.length; k++)
	{
	    if(dataTable_data_denominator_doctor[j].values.length > k){		
		index = (heading_row_arr.indexOf(dataTable_data_numerator_doctor[j].values[k].key));
		deno_num_percent = (dataTable_data_numerator_doctor[j].values[k].values/ dataTable_data_denominator_doctor[j].values[k].values );
		
	    }
	    else{
		index = "";
		deno_num_percent = 0;
	    }	    
	    deno_num_percent = (isNaN(deno_num_percent)) ? 0 : parseInt(deno_num_percent*100);
	    
	    if( k==0) table_head += "<td>"+ dataTable_data_denominator_doctor[j].key+"</td>";
	    	    	    
	    temp_column_arr.splice(index,0,deno_num_percent)
	    if(k == (dataTable_data_measure_data.length-1)){
		temp_column_arr.forEach(function(percent){
		    table_head += "<td>"+percent+"%</td>";
		});
	    }
	    
	}
	table_head += "</tr>";
    }    
    table_head += "</tbody>";
    table_width = (dataTable_data_measure_data.length*7 > 56 ) ? dataTable_data_measure_data.length*7+"pc" : 56 + "pc";
    $("#dc-table-graph").css("width",table_width)    
    $("#dc-table-graph").html(table_head);
    
    /*if($(".row rect[width ='0']")){
            $(".row rect[width ='0']").parent().hide()
    }*/

	//unblock loading effect
	setTimeout($.unblockUI(), 500);
	
}


