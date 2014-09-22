//set top header z-index to 0
$(".header").css('z-index','0')

//append loading effect
$.blockUI({ message: '<img src="images/loading.gif" /><h3> Please Wait</h3>' });

//define chart variables

var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
var doctorBasedPatientsRowChart= dc.rowChart("#doctor_based_patients_row");
var pieChartDenominator = dc.pieChart("#max-denominatar-based-pie");
var pieChartNumerator = dc.pieChart("#max-numerator-based-pie");
var stackChart = dc.barChart("#stack-bar-chart");

//define variable for x axis value in bar charts
var measureNames=[],doctorsNames = [];

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
            lucidData = che_data
            generateCharts()
});
function generateCharts(){
            
            lucidData = lucidData.filter(function(d){ return (d.Denominator != 0 && d.Numerator != 0)});
            lucidFilterData = crossfilter(lucidData);
            
            //======================== Row Chart Variables Start Here ====================================    
    
                var lucidRowChartDimension = lucidFilterData.dimension(function(d){ return (d.Denominator != 0 && d.Numerator != 0) ? d.Description : ""; });       
                var lucidRowChartDimensionGroup = lucidRowChartDimension.group().reduceSum(function(d){ return (d.Denominator != 0 && d.Numerator != 0) ? d.Denominator : '';});
    
            //======================== Row Chart Variables End Here ====================================
            
            
            //======================== Bubble Chart Variables Start Here ====================================    
    
                var lucidBubbleChartDimension = lucidFilterData.dimension(function (d) { return d.Region_id; });    
                var lucidBubbleChartDimensionGroup = lucidBubbleChartDimension.group().reduce(
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
    
            //======================== Bubble Chart Variables End Here ====================================
            
            //======================== Pie Chart Variables ================================================    
            
            //Denominator Based            
            var lucidPieDenominatorDimension = lucidFilterData.dimension(function (d,i) {  return mesure_values[d.Measure_id];});          
            
            // group on the base of numerator for measure
            var lucidPieDimensionDenominatorGroup =lucidPieDenominatorDimension.group().reduce(
                        function(p,v){                                    
                                    p.push(parseInt(v.Denominator))
                                    return p;
                                    //return (p > parseInt(v.Denominator)) ? p : parseInt(v.Denominator);
                        },
                        //remove
                        function(p,v){                                    
                                    p.splice(p.indexOf(parseInt(v.Denominator)),1)
                                    return p;
                                //return (p < parseInt(v.Denominator)) ? p : parseInt(v.Denominator);
                        },
                        //init
                        function(p,v){
                                return Max_numerator = [];
                        }
            );
            
            //numerator
            var lucidPieNumeratorDimension = lucidFilterData.dimension(function (d,i) {  return mesure_values[d.Measure_id];});            
            // group on the base of numerator for measure
           // var lucidPieNumeratorDimensionGroup = lucidPieNumeratorDimension.group().reduceSum(function(d){ return d.Numerator})
            var lucidPieNumeratorDimensionGroup =lucidPieNumeratorDimension.group().reduce(
                        function(p,v){                                    
                                    p.push(parseInt(v.Numerator))
                                    return p;
                                    //return (p > parseInt(v.Denominator)) ? p : parseInt(v.Denominator);
                        },
                        //remove
                        function(p,v){                                    
                                    p.splice(p.indexOf(parseInt(v.Numerator)),1)
                                    return p;
                                //return (p < parseInt(v.Denominator)) ? p : parseInt(v.Denominator);
                        },
                        //init
                        function(p,v){
                                return Max_numerator = [];
                        }
            );                        
            //======================== Pie Chart Variables End Here ====================================
            
            //======================== Stack bar Chart Variables ======================================            
            
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
            //======================== stack bar chart Variables End Here ====================================

            //======================== Data table Chart Variables ============================================            
            
            var lucidDataTableDimension= lucidFilterData.dimension(function(d){ return d.Description; });       
            var lucidDataTableDimensionGroup = lucidDataTableDimension.group().reduce(                                                
                                                function(p,v){
                                                            p.description = v.Description;
                                                            p.denominator.push(parseInt(v.Denominator))
                                                            p.numerator.push(parseInt(v.Numerator))
                                                            p.measure_ids.push(mesure_values[v.Measure_id])
                                                            return p
                                                },
                                                function(p,v){
                                                            p.description = v.Description;
                                                            p.denominator.splice(p.denominator.indexOf(parseInt(v.Denominator)),1)
                                                            p.numerator.splice(p.numerator.indexOf(parseInt(v.Numerator)),1)
                                                            p.measure_ids.splice(p.measure_ids.indexOf(mesure_values[v.Measure_id]),1)                                                            
                                                            return p
                                                },
                                                function(p,v){
                                                            return {description : "", measure_ids :[], denominator :[], numerator :[]};
                                                }
                                    ); 
            //======================== data table Variables End Here ========================================   

/*******************************************************************************************************************************************************/
/*                                              Start All Charts From Here                                                                             */
/*******************************************************************************************************************************************************/

            //========================= Row chart Start here ===============================================================
    
            //get height according to the number of doctor's
            var rowHeight = lucidRowChartDimensionGroup.all().length*30;
            
            doctorBasedPatientsRowChart.width(310)
                                    .height(rowHeight)
                                    .margins({top: 5, left: 10, right: 10, bottom: 20})
                                    .dimension(lucidRowChartDimension)
                                    .group(lucidRowChartDimensionGroup)
                                    .colors(d3.scale.category20b())
                                    .label(function (d){
                                       return d.key;
                                    })
                                    .transitionDuration(transitionDurationValue)
                                    .renderTitle(false)
                                    .elasticX(true)
                                    .xAxis().ticks(5);

            //doctorBasedPatientsRowChart.renderlet(function(){ showRowChartToolTip() });
            
            //========================= Row chart end here ===================================================================
            
            //========================= Bubble chart Start here ===============================================================
    
            bubbleChart.width(650)    
                        .height(400)    
                        .dimension(lucidBubbleChartDimension)
                        .group(lucidBubbleChartDimensionGroup)
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
            
            //bubbleChart.renderlet(function(){ showBubbleChartToolTip() });
            
            //========================= Bubble chart end here ==============================================================
            
            //========================= Pie chart Based on Max Denominator, Start here ======================================
    
            pieChartDenominator.width(200)
                        .height(200)    
                        .transitionDuration(transitionDurationValue)
                        .dimension(lucidPieDenominatorDimension)
                        .group(lucidPieDimensionDenominatorGroup)
                        .valueAccessor(function(d){return (typeof(d3.max(d.value)) != "undefined") ? d3.max(d.value) : 0})
                        .radius(90)    
                        .minAngleForLabel(0.5)
                        .legend(dc.legend().x(0).y(180).itemHeight(13).gap(10))
                        .renderTitle(true)
                        .renderlet(function(chart) {
                                    setLegendPieChart("max-denominatar-based-pie")
                                    //showPieChartToolTip()
                        }); 
            
            //========================= Pie chart end here ===================================================================
            
            //========================= Pie chart Based on Max Numerator, Start here ======================================
    
            pieChartNumerator.width(200)
                        .height(200)    
                        .transitionDuration(transitionDurationValue)
                        .dimension(lucidPieNumeratorDimension)                        
                        .group(lucidPieNumeratorDimensionGroup)
                        .valueAccessor(function(d){return (typeof(d3.max(d.value)) != "undefined") ? d3.max(d.value) : 0})
                        .radius(90)    
                        .minAngleForLabel(0.5)
                        .legend(dc.legend().x(0).y(180).itemHeight(13).gap(10))
                        .renderTitle(true)
                        .renderlet(function(chart) {
                                    setLegendPieChart("max-numerator-based-pie")
                                   // showPieChartToolTip()
                        }); 
            
            //========================= Pie chart end here ===================================================================
            
            //========================= Stack chart Based on Max Numerator And Denominator, Start here ======================================
    
            stackChartLength= measureNames.length*45.5;    
            stackChart. width(stackChartLength)
                      .height(400)
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
                      .gap(20)
                      .colors(d3.scale.category20b())
                      .renderTitle(false)    
                      .colors(d3.scale.category20())    
                      .x(d3.scale.ordinal().domain(measureNames))
                      .xUnits(dc.units.ordinal)    
                      .elasticY(true)
                      .renderlet(function(){
                                    (stackChart.hasFilter()) ? $(".stack-bar-chart-reset").css("display","block") : $(".stack-bar-chart-reset").css("display","none");
                                    rotateStackChartLabels();
                                    createDifferentColorBarChart();
                                    //showStackBarChartToolTip();
                      })
            
            //========================= stack bar chart end here ===================================================================
            
            //========================= Data table start here  =====================================================================
    
            var temp_thead_index = 0,table_head_arr = [];
            var dataTableData = [];     
            
            dc.dataTable("#dc-table-graph")
               .dimension(lucidDataTableDimension)        
               .group(function (d) {
                        temp_thead_index++                        
                        if(temp_thead_index == 1){                        
                               dataTableData = lucidDataTableDimensionGroup.all().filter(function(d){ return (d.value.measure_ids.length > 0)})                        
                               createTableHead()
                        }
                   return "";
               })
               .size(lucidDataTableDimensionGroup.all().length)
               .columns([
                   function (d,i) {return getDoctoName(i)},
                   function (d,i) {return dataTableColumnLoop(0,i)},
                   function (d,i) {return dataTableColumnLoop(1,i)},
                   function (d,i) {return dataTableColumnLoop(2,i)},
                   function (d,i) {return dataTableColumnLoop(3,i)},
                   function (d,i) {return dataTableColumnLoop(4,i)},
                   function (d,i) {return dataTableColumnLoop(5,i)},
                   function (d,i) {return dataTableColumnLoop(6,i)},
                   function (d,i) {return dataTableColumnLoop(7,i)},
                   function (d,i) {return dataTableColumnLoop(8,i)},
                   function (d,i) {return dataTableColumnLoop(9,i)},
                   function (d,i) {return dataTableColumnLoop(10,i)},
                   function (d,i) {return dataTableColumnLoop(11,i)},
                   function (d,i) {return dataTableColumnLoop(12,i)},
                   function (d,i) {return dataTableColumnLoop(13,i)},
                   function (d,i) {return dataTableColumnLoop(14,i)},
                   function (d,i) {return dataTableColumnLoop(15,i)},
                   function (d,i) {return dataTableColumnLoop(16,i)},
                   function (d,i) {return dataTableColumnLoop(17,i)},
                   function (d,i) {return dataTableColumnLoop(18,i)},
                   function (d,i) {return dataTableColumnLoop(19,i)},
                   function (d,i) {return dataTableColumnLoop(20,i)},
                   function (d,i) {return dataTableColumnLoop(21,i)},
                   function (d,i) {return dataTableColumnLoop(22,i)},
                   function (d,i) {return dataTableColumnLoop(23,i)},
                   function (d,i) {return dataTableColumnLoop(24,i)},
                   function (d,i) {return dataTableColumnLoop(25,i)},
                   function (d,i) {return dataTableColumnLoop(26,i)},
                   function (d,i) {return dataTableColumnLoop(27,i)},
                   function (d,i) {return dataTableColumnLoop(28,i)},           
               ])        
               .sortBy(function (d) {
                   return d.Description;
               })                
               .order(d3.ascending);
               
               /*function is used for create table head*/
               function createTableHead()
               {            
                   //get all measure_ids in the table_head_arr
                   table_head_arr = [];
                   $.each(dataTableData, function(i,data){
                               $.each(data.value.measure_ids, function(i,d){                                    
                                           if(table_head_arr.indexOf(d) == -1)
                                           {
                                              table_head_arr.push(d)
                                           }
                               })
                   })
                   //remove first one  table head
                   $(".data_table_head").remove();
                   
                   //after assinging all measures create the table head                   
                   var table_tr = "<thead class='data_table_head'><tr><td style='width:100px'>Doctor Name</td>";
                   var table_width = (table_head_arr.length*7 > 80) ? table_head_arr.length*7 : 80 ;
                   
                   table_head_arr.forEach(function(d){                    
                           table_tr +="<td>"+d+"</td>";
                   })
                   table_tr += "</tr></thead>";
                   $("#dc-table-graph").append(table_tr)
                   
                   //assign width to datatable
                   $("#dc-table-graph").css("width",table_width+"pc");
                   
                   //remove data table group and blank tr's
                   setTimeout(function(){
                               $(".dc-table-group").remove()
                               $('tr').each(function () {
                                           var totalTDs = $(this).find('td').length;
                                           var emptyTDS = 0;                           
                                           $(this).find('td').each(function () {
                                               if ($(this).text().trim() == "") {
                                                   emptyTDS += 1;
                                               };
                                           });
                           
                                           if (emptyTDS == totalTDs) {
                                               $(this).remove();
                                           }
                               });
                   },500)   
                   
               }
            /*function is used for return doctor name*/
            function getDoctoName(index)
            {            
                if(typeof(dataTableData[index]) != "undefined" )
                            if(dataTableData[index].value.measure_ids.length > 0) return dataTableData[index].value.description
                
            }
        
            //function is used for append column in datat table            
            function dataTableColumnLoop(value, index){
                temp_thead_index = 0;            
                if(typeof(table_head_arr[value]) != "undefined"){
                        if(typeof(dataTableData[index]) != "undefined" ) {
                                if(dataTableData[index].value.measure_ids.length >0 )
                                {
                                            var result = 0;                                    
                                            for(var j =0; j< dataTableData[index].value.measure_ids.length; j++){                                                                
                                                        if(typeof(dataTableData[index].value.measure_ids[j]) != "undefined" && dataTableData[index].value.measure_ids[j] == table_head_arr[value])
                                                        {                                                            
                                                            result  = parseFloat((dataTableData[index].value.numerator[j]/dataTableData[index].value.denominator[j])*100).toFixed(0)                                                            
                                                        }                                                                
                                            }
                                            return result +"%";                                        
                                }
                        }
                }
            }
            
            //========================= Data table end here  =======================================================================
            
            
            //render and draw all chart by call dc's functions
            dc.renderAll();
            dc.redrawAll();
           
           //function call for show tooltip on all chart
           showToolTipOnAllChart()
    
            //after full load the page then unblock to ui    
            setTimeout($.unblockUI(), 500);	
     
            
            //unset top header z-index to 0            
            $(".header").css('z-index','1030')
    
}

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
 *Function Name : setLegendPieChart
 *@description: Function is used for set legend in two block in pie chart
 */
function setLegendPieChart(id)
{
            var i = 1;            
            var value1_index = 1,value2_index = 0;
            var value1, value2= 0;
            d3.selectAll("#"+ id +" .dc-legend-item").attr("transform",function(d){                        
                        value1 = 0;
                        if(value1_index % 2 == 0)
                        {
                                    value1 = 150;                                     
                        }
                        if(value2_index % 2 == 0)
                        {
                                    value2 = 17*i;
                                    i++;
                        }
                        value2_index++;
                        value1_index++;                        
                        return "translate(" + value1 + "," + value2 + ")";
            })
}


/*
 *Function Name : redrawAllCharts
 *@description: this function is call on reset event of charts and recreate all charts
 */
function redrawAllCharts()
{   
    dc.filterAll();
    dc.renderAll();
    dc.redrawAll();
    
    showToolTipOnAllChart()
}



/*******************************************************************************************************************************************************/
/*                                              Apply tooltip on All Charts From Here                                                                  */
/*******************************************************************************************************************************************************/


/*
 *Function Name : showRowChartToolTip
 *@description: this function is used for show tool tip on row chart
 */
function showToolTipOnAllChart()
{
            
	    var toolTipRow = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function (p) {	      
		  $('.d3-tip').css("background",$(this).attr('fill'));
		  $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
		  return "<span style='color: #000'>" + p.key +" : "+p.value +"</span>"	    
	    });
	    
	    //call to  bubble chart  tooltip
	    d3.selectAll(".row rect").call(toolTipRow);	    
	    d3.selectAll(".row rect, .row text").on('mouseover', toolTipRow.show).on('mouseout', toolTipRow.hide);

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
	    
	    d3.selectAll(".node circle").call(toolTipBubble);        
	    d3.selectAll(".bubble, .node text").on('mouseover', toolTipBubble.show).on('mouseout', toolTipBubble.hide);	               
            

	    var toolTipBarChart = d3.tip()
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
	    
	    d3.selectAll("#stack-bar-chart ._0 rect, #stack-bar-chart ._1 rect").call(toolTipBarChart);	    
	    d3.selectAll("#stack-bar-chart ._0 rect,#stack-bar-chart ._1 rect").on('mouseover', toolTipBarChart.show).on('mouseout', toolTipBarChart.hide);
            
	    var toolTipPie = d3.tip()
	      .attr('class', 'd3-tip')
	      .offset([-10, 0])
	      .html(function (p) {
		    var title = ($(this).parent().children("g title").text()).split(":");		    
		    $('.d3-tip').css("background",$(this).attr('fill'));
		    $('.d3-tip').after($('.d3-tip').css("color",$(this).attr('fill')));
		    return "<span style='color: #FFF'>" + [title[0]] +":"+ title[1] + "</span>"
		
	    });	 	    
	    
	    d3.selectAll(".pie-slice path").call(toolTipPie);	    
	    d3.selectAll(".pie-slice path").on('mouseover', toolTipPie.show).on('mouseout', toolTipPie.hide);
            
}
/*
 *Function Name : createDifferentColorBarChart()
 *@description: Function is used after render the ctach chart and change
 * it's bar color 
 *
 */
 
function createDifferentColorBarChart(){
            
            color_array1 = Array("7ac1b1","d9706a","b6619a","6c64ad","ec9552","e1b131","71be76","4a92ba","4c6dba","44bfab","c53b48","a6ce39");
            color_array2 = Array("aee0d5","eeada9","daa9c9","b1acd4","f9bc8d","f6d272","b7e8bb","abd1e6","819bd6","7ce1d1","e18790","c9e382")
            
            var i = -1;
            stackChart.selectAll("._0 rect")
                        .attr("fill", function(d){
                                    i++;
                                    i = (i < 12 ) ? i : 0;                                    
                                    return "#"+color_array1[i];                                    
            })
            i = -1;
            stackChart.selectAll("._1 rect")
            .attr("fill", function(d){
                        i++;
                        i = (i < 12 ) ? i : 0;                                    
                        return "#"+color_array2[i];                                    
            })             
}