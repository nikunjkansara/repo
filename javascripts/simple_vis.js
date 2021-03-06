/********************************************************
*														*
* 	Step0: Create the dc.js chart objects & ling to div	*
*														*
********************************************************/
var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
var rowChart = dc.rowChart("#row-graph");
var pieChart = dc.pieChart("#dc-pie-graph");
var volumeChart = dc.barChart("#dc-volume-chart");
var pieOuterChart = dc.pieChart("#dc-outer-chart");
//var bubbleRegion = dc.dataTable("#dc-bubble-region");


var bubble_text = []
var table_filter_data = [];
var table_filter_data_doctor = [];
var mesureData, data_table_data;


/*var collectionRate = dc.barChart("#dc-collection-rate-stacked");
//var collectionRatePct = dc.barChart("#dc-collection-rate-stacked-pct");
var collectionRatePie = dc.pieChart("#dc-collection-rate-pie");*/

/********************************************************
*														*
* 	Step1: Load data from json file						*
*														*
********************************************************/
d3.tsv("data/measure.csv", function (che_data) {
	
    /********************************************************
*														*
* 	Step2:	Run data through crossfilter				*
*														*
********************************************************/
    mesureData = che_data;

    var ndx = crossfilter(che_data);
    
    var sort = crossfilter.quicksort.by(function(d) {
        return d.Measure_id;
    });
    //console.log(sort);
    //console.log(ndx);
	
    data = che_data;
    /********************************************************
*														*
* 	Step3: 	Create Dimension that we'll need			*
*														*
********************************************************/
    /*TESTING*/
    var group_avg = 0;
    var doctors_measure = [];
    /*TESTING*/
    
    // for volumechart
    var measureVal = ndx.dimension(function (d) {
        return d.Region_id;
    });
    //var measureGroup = measureVal.group(function(d) { return d; });
    set_max_deno = Array();
    set_max_num = Array();
    var measureGroup = measureVal.group().reduce(
        //add
        function(p,v){
            //console.log(v.Description+"<><>"+v.Measure_id+"<><>"+v.Denominator+"<><>"+v.Numerator);
            ++p.count;

            p.Denominator = parseInt(p.Denominator) + parseInt(v.Denominator) ;
            p.Numerator = parseInt(p.Numerator) + parseInt(v.Numerator);
            p.charges_avg =  parseInt((p.Numerator / p.Denominator) * 100);
			
            p.startValueGroup = v.Description;

            p.nume_avg = (parseFloat(p.Numerator) / 29);
            p.deno_avg = (parseFloat(p.Denominator) / 29);
			
            set_max_deno.push(p.deno_avg);
            set_max_num.push(p.nume_avg);
            
            return p;
        },
        //remove
        function(p,v){
            --p.count;
            p.Denominator -= parseInt(v.Denominator);
            p.Numerator -= parseInt(v.Numerator);
            p.charges_avg =  parseInt((p.Numerator / p.Denominator) * 100);

            p.startValueGroup = v.Description;

            p.nume_avg = (parseFloat(p.Numerator) / 29);
            p.deno_avg = (parseFloat(p.Denominator) / 29);			
            set_max_deno.push(p.deno_avg);
            set_max_num.push(p.nume_avg);
			
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
                description:""
            };
        }
        );	
   

    // for rowChart
    var measure_row_Val = ndx.dimension(function (d) {
        return d.Description;
    });
    var measure_row_Group = measure_row_Val.group();
    
    // for rowChart
    var measure_bar_Val = ndx.dimension(function (d) {
        return d.Description;
    });
    var count = 0;
    //console.log(measure_bar_Val.group().all());
    var measure_bar_Group = measure_bar_Val.group().reduceSum(function (d) {
        ++count;
        return count;
    });
    //console.log(measure_bar_Group.all());	

    // for pieChart
    var maxDinominator = [];
    var arrayMeasure = [];
    var arrayDinominator = [];
    var arrayNumerator = [];
    
    var startValue = ndx.dimension(function (d) {
        return d.Measure_id;
    });
        
    d3.nest().key(function (d){
        return d.Measure_id
    }).key(function (d){
        return d.Measure_id
    }).entries(data).map(function(d){
        arrayMeasure.push(d.key);
        d.values.map(function(dd){
            
            dd.values.forEach(function(ddd){
                arrayDinominator[ddd.Measure_id] = parseInt(ddd.Denominator);
                arrayNumerator[ddd.Measure_id] = parseInt(ddd.Numerator);
                        
            });                    
        });                
    });
    //console.log(arrayDinominator);
    //console.log(arrayNumerator);
    //console.log(arrayMeasure);
    
    /*var filterVal = che_data.filter(function(d){
        return (d.Measure_id == "ED87A3EC-8929-4397-B1AB-B6E3460F63E7")
    });*/
    var startValueOrder = startValue.group().order(function (d){
        d.Denominator
        });  
    console.log(startValueOrder.all());
    
    var startValueGroup = startValue.group().reduce(    
        //add
        function(p,v){
            //console.log(v.Description+"<><>"+v.Measure_id+"<><>"+v.Denominator+"<><>"+v.Numerator);
            ++p.count;

            p.Denominator = parseInt(p.Denominator) + parseInt(v.Denominator) ;
            p.Numerator = parseInt(p.Numerator) + parseInt(v.Numerator);
            p.charges_avg =  parseInt((p.Numerator / p.Denominator) * 100);
          			
            p.startValueGroup = v.Description;

            p.nume_avg = (parseFloat(p.Numerator) / 29);
            p.deno_avg = (parseFloat(p.Denominator) / 29);
			
            p.maxDinominator = arrayDinominator[v.Measure_id];
            
            
            return p;
        },
        //remove
        function(p,v){
            --p.count;
            p.Denominator -= parseInt(v.Denominator);
            p.Numerator -= parseInt(v.Numerator);
            p.charges_avg =  parseInt((p.Numerator / p.Denominator) * 100);

            p.startValueGroup = v.Description;

            p.nume_avg = (parseFloat(p.Numerator) / 29);
            p.deno_avg = (parseFloat(p.Denominator) / 29);			
            maxDinominator[v.Measure_id] = p
            set_max_num.push(p.nume_avg);
			
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
                description:"",                
                maxDinominator: 0
            };
        }); 
    console.log(startValueGroup.all());
    //console.log(maxDinominator);
    
    // for pieChart
    var maxNum = ndx.dimension(function (d) {
        return d.Measure_id;
    });
    var maxNumGroup = maxNum.group();
    
    
    // Stack chart
    
    var totalPatients = ndx.dimension(function (d){
        return d.Description;
    });
    

    var totalPatientsGroup = totalPatients.group();
    //console.log(totalPatientsGroup.all());
    
	
    // For datatable
    /*var DoctorsDimension = ndx.dimension(function (d) { return d.Description; });	
	var MeasureDimension = ndx.dimension(function (d) { return getMeasureValue(d.Measure_id); });
	console.log(MeasureDimension.group().all());*/
/********************************************************
*							*
* 	Step4: Create the Visualisations		*
*							*
********************************************************/
	
    bubbleChart.width(840)
    .height(300)
    .dimension(measureVal)
    .group(measureGroup)
    .transitionDuration(1500)
    .mouseZoomable(true)
    .colors(d3.scale.category20())
    .margins({
        top: 10, 
        right: 50, 
        bottom: 30, 
        left: 50
    })
    .colorDomain([-12000, 2000])
    .x(d3.scale.linear().domain([-100, 1000]))
    .y(d3.scale.linear().domain([-100, 1000]))
    .r(d3.scale.linear().domain([0, 100]))
    .keyAccessor(function (p) {				
        return parseInt(p.value.Denominator / p.value.count);
    //return 50;
    })
    .valueAccessor(function (p) {				
        return parseInt(p.value.Numerator / p.value.count);;
    //return 50;
    })
    .radiusValueAccessor(function (a) {
        return a.value.charges_avg/10;
    })
    .transitionDuration(1500)
    .elasticY(true)
    .elasticX(true)
    //.elasticRadius(true)
    .yAxisPadding(50)
    .xAxisPadding(50)
    .label(function (p) {
        bubble_text[getMeasureValue(p.key)] = getMeasureValue(p.key);
        return getMeasureValue(p.key)				
    //p.value.charges_avg+"%";        
    //return getMeasureValue(p.key);
    })
    .renderLabel(true)
    //.yAxis().ticks(10)
    .xAxis().ticks(6);


    pieChart.width(200)
    .height(200)
    .transitionDuration(1500)
    .dimension(startValue)
    .group(startValueGroup)
    .radius(90)
    .minAngleForLabel(0.5)
    /*.on("filtered", function (chart) {
			dc.events.trigger(function () {
				console.log(total_payment);
			});
		});*/
    .label(function(d) { 
        bubble_text[getMeasureValue(d.key)] = getMeasureValue(d.key);
        return d.key;
    });
    //.on("filtered", function (chart) {
    //	dc.events.trigger(function () {
    //		if(chart.filter()) {
    //			//console.log(chart.filter());
    //			volumeChart.filter(chart.filter());
    //			}
    //		else volumeChart.filterAll();
    //	});
    //});
    rowHeight = measure_row_Group.all().length*30;
    
    pieOuterChart.width(400)
    .height(400)
    .radius(90)
    .dimension(maxNum)
    .group(maxNumGroup);
    //.innerRadius(100)
    //.slicesCap(10);
    
    
    

    rowChart.width(300)
    .height(rowHeight)
    .dimension(measure_row_Val)
    .group(measure_row_Group)
    .renderLabel(true)
    .colors(d3.scale.category20())
    .margins({
        top: 5, 
        right: 10, 
        bottom: 20, 
        left: 10
    })
    .label(function (d){
        return d.key;
    })
    .renderTitle(false)
    .gap(10)
    .labelOffsetX(20)	
    .elasticX(true)		
    .xAxis().ticks(5);
          
    volumeChart.width(400)
    .height(300)
    .dimension(measure_bar_Val)
    .group(measure_bar_Group)
    .transitionDuration(1000)
    .margins({
        top: 30, 
        right: 50, 
        bottom: 25, 
        left: 40
    })
    .centerBar(true)
    .y(d3.scale.linear().domain([-100, 1000]))
    .x(d3.scale.linear().domain([-100, 1000]))
    .xAxis().ticks(5);
          

        
    // /********************************************************
    // *														*
    // * 	Step6: 	Render the Charts							*
    // *														*
    // ********************************************************/
			
    dc.renderAll();
    createDataTable();
	

    //filter datatable on click event by bubble chart bubbles
    $("#dc-bubble-graph .bubble, #dc-bubble-graph .node text,  .row rect, .row text, .pie-slice path").on('click' , function(){
        setTimeout(function(){
            table_filter_data = [];
            if($("#dc-bubble-graph .selected").length > 0 || $(".row  rect.selected").length > 0){		
		
                $.each($(".chart-body g.selected"), function(k,v) {
			
                    if(table_filter_data.indexOf(bubble_text[$(v).text()]) < 0){
                        table_filter_data.push(bubble_text[$(v).text()]);		    
                    }		
                });
                $.each($(".row  rect.selected"), function(k,v) {			
                    if(table_filter_data.indexOf($(v).parent().text()) < 0){
                        table_filter_data_doctor.push($(v).parent().text());		    
                    }		
                });
                $.each($(".pie-slice title"), function(k,v) {			
                    if(table_filter_data.indexOf($(v).parent().text()) < 0){
                        table_filter_data.push($(v).parent().text());		    
                    }		
                });	    
            }
            createDataTable();
        },200);
    });

});


function change()
{    
    //dc.redrawAll();    
    dc.filterAll();
   
    
    table_filter_data = [];
    createDataTable();
}

function createDataTable()
{    
    if(table_filter_data.length > 0)
    {	
        data_table_data = mesureData.filter(function(d,i){	    
            return (table_filter_data.indexOf(getMeasureValue(d.Measure_id)) >= 0);	    
        });	
    }
    if(table_filter_data_doctor.length > 0)
    {	
        data_table_data = mesureData.filter(function(d,i){	    
            return (table_filter_data_doctor.indexOf(d.Description) >= 0);	    
        });	
    }
    else{
        data_table_data = mesureData;
    }    

    
    heading_row_arr = [];    
    dataTable_data_measure_data = d3.nest().key(function(d) {
        return getMeasureValue(d.Measure_id);
    }).entries(data_table_data);        

    
    dataTable_data_denominator_doctor = d3.nest().key(function(d) {
        return d.Description;
    }).key(function(d) {
        return getMeasureValue(d.Measure_id);
    }).rollup(function(d) {
        return d3.sum(d, function(g) {
            return g.Denominator;
        });
    }).entries(data_table_data);
    dataTable_data_numerator_doctor = d3.nest().key(function(d) {
        return d.Description;
    }).key(function(d) {
        return getMeasureValue(d.Measure_id);
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
    
}

function getMeasureValue(key){
    var measureValue = {
        "EA1B89D2-A6B0-4CA4-BC8F-A4F6E4A9030E":"IVD Antithrombotic Neuro",
        "7EDBB118-73D8-4625-9227-CB6857ECF26C":"LDL Control",
        "16DD1D03-FC36-41DA-B628-FE5FDA8C4EA0":"Chlamydia Screening",
        "41FD2DB3-D29C-494A-BC96-D43B22D5754D":"HIV/AIDS",
        "8A6CFD1E-E0FC-4999-BD2B-6521142F2B80":"Lipid LT 100",
        "0EA806A0-BA8E-422A-B909-0A9758057D22":"CAD Antiplatelet",
        "D1369E14-A3B4-4949-9476-15742E406D3C":"CAD Lipid Lowering Drugs",
        "B2C981A6-BE1B-4C73-A2A8-18E30ECE3707":"Lipid Testing",
        "6041FEEB-20CE-4CE9-B0AD-2652CF08ABAA":"Pneumonia Vaccination",
        "4BEA4AE5-6F1A-4CC0-BB5B-4F128D4D6E6A":"Influenza",
        "8321E347-BA9F-4C9F-ACE4-520E111D782F":"Depression",
        "92877B4E-A96E-45A4-8734-53D5A6100069":"Heart Failure ACE Arb",
        "B28AF571-9833-474D-8F35-5BC557C89BEE":"IVDBP",
        "FD13C439-E2CC-4D4E-B5B2-67E8A976BB95":"Diabetes: Eye Exam",
        "9B6F3897-53F0-40EE-BFBC-6DD4162618F8":"BMI",
        "086B0985-E4AD-43C1-9C22-88CFBE261E3F":"HbA1C > 9",
        "61173E6E-083D-4F59-8097-921C8AD4A8F0":"HTN",
        "D03562F7-FF8A-405C-BCA9-94DEC092F33E":"Diabetes: Nephro Screening",
        "849E7DDB-8DDB-4175-982D-974EFAFB808F":"Osteoarthritis OTC Meds",
        "DDF1489B-C3F6-46C3-A403-B5F7D0C9E379":"HbA1C < 8",
        "ED87A3EC-8929-4397-B1AB-B6E3460F63E7":"Colon Cancer Screening",
        "6F3C49DB-F20A-40AE-846E-B79DE7343243":"Colon Cancer Screening Education",
        "D06F1D7A-1E8A-4DAD-8ED0-B95ACFB2F2D4":"Diabetes: Foot Exam",	
        "11E825E0-F8A8-4BEB-8C9A-BD8F4EB33814":"Heart Failure Beta",
        "5A58F529-B673-4BC7-B686-CB9B3B755778":"Mammo",
        "BD246D76-724D-4CB8-BC0A-D2AD73EB2801":"Cervical Cancer Screening",
        "F1670A16-6D8A-4B33-9EC7-E62382F5031B":"IVD Antithrombotic",
        "2F3C6ED6-D3DB-498F-B881-ED9A3A66E476":"Smoking",
        "BD709062-B9D6-406F-BCED-FD892B81ED6E":"Osteoarthritis F and P"
    };
    return result = measureValue[key];


}
