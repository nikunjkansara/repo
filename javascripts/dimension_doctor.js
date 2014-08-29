//set top header z-index to 0
$(".navbar-fixed-top").css('z-index','0')
$(".navbar-fixed-bottom").css('z-index','0')

//append loading effect
$.blockUI({
    message: '<img src="images/loading.gif" /><h3> Please Wait</h3>'
});

//define chart variables
var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
var rowChart = dc.rowChart("#row-graph");
var pieChart = dc.pieChart("#dc-pie-graph");  
var pieNueChart = dc.pieChart("#dc-nue-pie-graph");  

var data_table_data, table_filter_data_measure = [], table_filter_data_doctor = [];

//define variable for contain filter data for bubble chart
var bubble_text = [];

var maxi_array = [];
var maxi = 0;
var maxi_value = "";
var doctor_name = "";

//define transitionDurationValue for all charts transitionDuration
var transitionDurationValue = 800;

//define the measure id and their values
var data_table_data, table_filter_data = [],doctors_denominator_arr = [];

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
    var measureVal = lucidFilterData.dimension(function (d) {
        return (mesure_values[d.Measure_id]);
    });    
    var measureGroup = measureVal.group().reduce(
        //add
        function(p,v){
            //console.log(v.Description+"<><>"+v.Measure_id+"<><>"+v.Denominator+"<><>"+v.Numerator);
            ++p.count;

            p.Denominator = parseInt(p.Denominator) + parseInt(v.Denominator) ;
            p.Numerator = parseInt(p.Numerator) + parseInt(v.Numerator);
            p.charges_avg = parseInt((p.Numerator/p.Denominator)*100);
            p.Description = v.Description;		    
            p.nume_avg = parseFloat(p.Numerator);		    
            p.deno_avg = parseFloat(p.Denominator);
		    
            return p;
        },
        //remove
        function(p,v){
            --p.count;
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
            return {
                count: 0, 
                Denominator: 0, 
                Numerator: 0, 
                charges_avg: 0, 
                deno_avg: 0, 
                nume_avg: 0, 
                max_numeraotr:0
            };
        }
        );
            
            
    // for pieChart
    var lucidPieDimension = lucidFilterData.dimension(function (d,i) {
        return d.Description;
    });    
    var lucidPieDimensionGroup = lucidPieDimension.group().reduceSum(function(d) {
        return d.Denominator
    });
    //console.log(lucidPieDimensionGroup.all());
    
    //For puie chart for Numirator 
    //pieNueChart
    var pieNumerator = lucidFilterData.dimension(function (d,i) {
        return d.Description;
    });    
    var pieNumeratorGroup = lucidPieDimension.group().reduceSum(function(d) {
        return d.Numerator
    });
    
    
    //define for row chart 
    var lucidRowChartDimension = lucidFilterData.dimension(function(d){
        return d.Description;
    });       
    var lucidRowChartDimensionGroup = lucidRowChartDimension.group().reduceSum(function(d,i){
        return maximumValue(d.Description);	
    });    
    
    //get all the maximum denominator for all doctors    
    
    
    doctors_denominator = d3.nest().key(function(d) {
        return d.Description;
    }).key(function(d) {
        return d.Description;
    }).entries(lucidData).map(function(d){
        var group = d.key	    
        var value = d.values.map(function(dd){		
            var total = 0;
            dd.values.forEach(function(ddd){
                if(parseInt(ddd.Denominator) > total)
                    total = parseInt(ddd.Denominator);
            })		
            return total;		
        })
        doctors_denominator_arr[group] = value[0];
    });        
    
    //return maximum denominator for doctor
    function maximumValue(description)
    {	
        if(doctor_name != description)
        {	    
            doctor_name = description;	    
            val = (doctors_denominator_arr[description]) ? doctors_denominator_arr[description] : 0;
        }
        else{
            val = 0;    
        }
        return val;
    }
   
    //var bottomRow = lucidRowChartDimensionGroup.bottom(4);
    //console.log(lucidRowChartDimensionGroup.all());
    //console.log(maxi_array);
    //Make code for get minimum and maximum average 
    
    measures = denominator_data = d3.nest().key(function(d) {
        return mesure_values[d.Measure_id];
    }).entries(lucidData)
    denominator_data = d3.nest().key(function(d) {
        return mesure_values[d.Measure_id];
    }).rollup(function(d) {
        return d3.sum(d, function(g) {
            return g.Denominator;
        });
    }).entries(lucidData);
    
    numerator_data = d3.nest().key(function(d) {
        return mesure_values[d.Measure_id];
    }).rollup(function(d) {
        return d3.sum(d, function(g) {
            return g.Numerator;
        });
    }).entries(lucidData);       
    
    difference_denominator_numerator = []
    max_denominator= []
    max_numerator = []
    difference_denominator_numerator_values = [];
    
    for(var j = 0; j < measures.length; j++)
    {
        max_denominator.push(parseFloat(denominator_data[j].values/measures[j].values.length))
        max_numerator.push(parseFloat(numerator_data[j].values/measures[j].values.length))	
    }
    //end here code for maximum and minimum average     
    
    
    
    
    
    
    
    // create all charts
    
    //bubble chart with respect to measure and average of denominator and numerator
    bubbleChart.width(850)    
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
    .x(d3.scale.linear().domain([d3.min(max_denominator)-20, d3.max(max_denominator)+100]))
    .y(d3.scale.linear().domain([d3.min(max_numerator)-20, d3.max(max_numerator)+100]))
    .r(d3.scale.linear().domain([0, 100]))  
    .keyAccessor(function (p) {		
        return (p.value.deno_avg/p.value.count);
    })
    .valueAccessor(function (p,i) {
        return (p.value.nume_avg/p.value.count);
    })
    .radiusValueAccessor(function (p) {	
        return p.value.charges_avg/10;
    })        
    .elasticY(false)
    .elasticX(false)    
    .yAxisPadding(1000)
    .xAxisPadding(800)    
    .renderHorizontalGridLines(true)    
    .renderVerticalGridLines(true)
    .label(function (p) {
	
        //append measure value in array for filteration and tool tip 
        bubble_text[p.value.charges_avg+"%"] = p.key;
	
        return p.value.charges_avg+"%";        
    })        
    .renderLabel(true).xAxis().ticks(8);
    
    
    //Pie Chart with respect to measures
    pieChart.width(200)
    .height(200)    
    .transitionDuration(transitionDurationValue)
    .dimension(lucidPieDimension)
    .group(lucidPieDimensionGroup)
    .radius(90)    
    .minAngleForLabel(0.5)    
    .label(function(d) {	
        return d.key + ": " + d.value.max;
    })    
    .renderTitle(true);   
      
    
    pieNueChart.width(200)
    .height(200)    
    .transitionDuration(transitionDurationValue)
    .dimension(pieNumerator)
    .group(pieNumeratorGroup)
    .radius(90)    
    .minAngleForLabel(0.5)    
    .label(function(d) {	
        return d.key + ": " + d.value.max;
    })    
    .renderTitle(true);  
    
    
    //Row chart with respect to Doctor values
    //get height according to the number of doctor's
    rowHeight = lucidRowChartDimensionGroup.all().length*30;
    rowChart.width(350)
    .height(rowHeight)
    .margins({
        top: 5, 
        left: 10, 
        right: 10, 
        bottom: 20
    })
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
    
    // call to data table function 
    createDataTable();
    
    
    //render and draw all charts	
    dc.renderAll();
    dc.redrawAll();
    
    //this if for append text title on y and x axis in bubble chart after some time of render all charts
    setTimeout(function(){
	
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
            //console.log(p);
            //if($(this).parent().children("g rect").attr('width') > 0){		
            $('.d3-tip').css("background",$(this).attr('fill'));
            $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
            return "<span style='color: #FFF'>" + p.key + "</span>"
        //}
        });
	    
        //define tooltip for row chart   
        var toolTipRow = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (p) {
            //console.log(p);
            //if($(this).parent().children("g rect").attr('width') > 0){		
            $('.d3-tip').css("background",($(this).attr('fill'))?$(this).attr('fill'):"#9EE49C");
            $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
            return "<span style='color: #FFF'>" + p.key + "</span><br/>\n\
                    <span style='color: #FFF'>Max Denominator:" + p.value + "</span>  ";
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
	    
	    
        //call to  bubble chart  tooltip
        d3.selectAll(".node circle").call(toolTipBubble);        
        d3.selectAll(".bubble, .node text").on('mouseover', toolTipBubble.show).on('mouseout', toolTipBubble.hide);	    
	    
        //call to  row chart  tooltip
        d3.selectAll(".row rect").call(toolTipRow);	    
        d3.selectAll(".row rect, .row text").on('mouseover', toolTipRow.show).on('mouseout', toolTipRow.hide);
	    
	    
        //call to  pie chart  tooltip
        d3.selectAll(".pie-slice path").call(toolTipPie);	    
        d3.selectAll(".pie-slice path").on('mouseover', toolTipPie.show)
        .on('mouseout', toolTipPie.hide);
	    
    },1000);    
    
    
    //filter datatable on click event by bubble chart bubbles
    $("#dc-bubble-graph .bubble, #dc-bubble-graph .node text").on('click' , function(){
        setTimeout(function(){	    	    	
            table_filter_data_measure = [];
            if($("#dc-bubble-graph .selected").length > 0 ){		
                $.each($(".chart-body g.selected"), function(k,v) {
                    if(table_filter_data_measure.indexOf(bubble_text[$(v).text()]) < 0){
                        table_filter_data_measure.push(bubble_text[$(v).text()]);		    
                    }		
                });		
            }
            console.log(table_filter_data_measure)
            createDataTable();
        },transitionDurationValue);
    });
    
    //filter data by when select row chart
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
    
    //filter data by when select pie chart nodes
    $(".pie-slice path, .pie-slice title").on('click' , function(){	
        setTimeout(function(){	    	    	
            table_filter_data_doctor= [];	    
            if($("#dc-pie-graph g.selected").length > 0 || $("#dc-nue-pie-graph g.selected").length > 0){
                $.each($("#dc-pie-graph g.selected"), function(k,v) {
                    text = $(v).text().split(':');		    
                    if(table_filter_data_doctor.indexOf(text[0]) < 0){
                        table_filter_data_doctor.push(text[0]);		    
                    }		
                });
		$.each($("#dc-nue-pie-graph g.selected"), function(k,v) {
                    text = $(v).text().split(':');		    
                    if(table_filter_data_doctor.indexOf(text[0]) < 0){
                        table_filter_data_doctor.push(text[0]);		    
                    }		
                });
            }	    
            createDataTable();
        },transitionDurationValue);
    });
    
});


/*this function is call on reset event of charts and recreate table*/
function redrawAllCharts()
{
    bubbleChart.filterAll();
    pieChart.filterAll();
    pieNueChart.filterAll();
    rowChart.filterAll();    
    dc.redrawAll();
    
    table_filter_data_measure = [];
    table_filter_data_doctor = [];
    setTimeout(function(){
        createDataTable();
    },600)
    
}

/*
 *Function Name : createDataTable
 *@description: Function is used for create data table
 */
function createDataTable()
{    
    
    data_table_data = lucidData;
    if(table_filter_data_measure.length > 0)
    {	
        data_table_data = data_table_data.filter(function(d,i){	    
            return (table_filter_data_measure.indexOf(mesure_values[d.Measure_id]) >= 0);	    
        });
        $(".row rect[width ='0']").parent().hide()
        $(".row rect[width!='0']").parent().show()
    }    
    if(table_filter_data_doctor.length > 0)
    {	
        data_table_data = data_table_data.filter(function(d,i){	    
            return (table_filter_data_doctor.indexOf(d.Description) >= 0);	    
        });
        $(".row rect[width ='0']").parent().hide()
        $(".row rect[width!='0']").parent().show()
    }    
    else{	
        $(".row rect").parent().show()
    }    
    
    heading_row_arr = [];    
    dataTable_data_measure_data = d3.nest().key(function(d) {
        return mesure_values[d.Measure_id];
    }).entries(data_table_data);        
    
    
    dataTable_data_denominator_doctor = d3.nest().key(function(d) {
        return d.Description;
    }).key(function(d) {
        return mesure_values[d.Measure_id];
    }).rollup(function(d) {
        return d3.sum(d, function(g) {
            return g.Denominator;
        });
    }).entries(data_table_data);
    dataTable_data_numerator_doctor = d3.nest().key(function(d) {
        return d.Description;
    }).key(function(d) {
        return mesure_values[d.Measure_id];
    }).rollup(function(d) {
        return d3.sum(d, function(g) {
            return g.Numerator;
        });
    }).entries(data_table_data);    
    
    
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

    //unblock loading effect
    setTimeout($.unblockUI(), 500);
	
    //unset top header z-index to 0
    $(".navbar-fixed-top").css('z-index','1030')
    $(".navbar-fixed-bottom").css('z-index','1030')
    }


