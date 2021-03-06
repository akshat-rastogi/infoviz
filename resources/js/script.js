/****************************
Step 1: Initializations

		- Necessary Global Variables
		- Chart Dimensions
		- SVG Container Set up
		- Setting Scales
		- Axes + Gridlines
		- Labels
		- Create Tooltip Div
****************************/

//Global Variables
	activeYear = 1900;	
	yearIndex = 0;
	activeCountry = "All";
	comparisonCountry = "None";
	intervalHandle =null;
	animationTransitionDuration = 700;
	var plots = ['scatter-plot','region-bar-chart','govt-bar-chart','coastline-bar-chart'];
	var width=[], height=[], colorscheme=[];
	var svg_array = [], y_axis=[], x_axis =[];

	var scatterTicks = {x:[200,300,500, 1000, 2000, 5000, 10000, 20000, 50000],
							y:[20,30,40,50, 60, 70, 80 ,90]};

	var plot_labels = {	x:['INCOME PER PERSON in US Dollars (GDP/capita, Inflation adjusted, log scale) ','NO. OF COUNTRIES ','NO. OF COUNTRIES ','COASTLINE (in 1000Km) '],	
						y:['LIFE EXPECTANCY (in years) ','REGIONS ','GOVERNMENT TYPES ','REGIONS '],
						title:['GapMinder World ','Number of Countries per Region ',
								'Number of Countries per Government Type ',
								'Coastline per Region ']};

	var countryPath = {}				
/******* Chart Dimensions & SVG container (Create, Set Origin) *******/	

	var margin = {top: 20, right: 4, bottom: 60, left: 60};
	var margin_bars = {top: 20, right: 4, bottom: 60, left: 175};
	colorscheme = d3.schemeCategory10; // Color Codes for regions

	for(i in plots)
	{
		// Chart Dimensions
		var outer_width = 500, outer_height = 250; // for rest of the plots
		if(plots[i] == 'scatter-plot') // for Scatter Plot
		{
			outer_width = 800; 
			outer_height = 500; 
			class_name = "scatter";
			width.push(outer_width - margin.right - margin.left);
			height.push(outer_height - margin.top - margin.bottom);
			//SVG container (Create, Set Origin)
			svg_array.push(d3.select("#"+plots[i])
						.append("svg")
						.attr("width", width[i] + margin.left + margin.right)
						.attr("height", height[i] + margin.top + margin.bottom)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")"));
		}
		else{
			width.push(outer_width - margin_bars.right - margin_bars.left);
			height.push(outer_height - margin_bars.top - margin_bars.bottom);
			//SVG container (Create, Set Origin)
			svg_array.push(d3.select("#"+plots[i])
						.append("svg")
						.attr("width", width[i] + margin_bars.left + margin_bars.right)
						.attr("height", height[i] + margin_bars.top + margin_bars.bottom)
						.append("g")
						.attr("transform", "translate(" + margin_bars.left + "," + margin_bars.top + ")"));
		}
		
	}

	//Legend SVG Container
	var svg_l = d3.select("#legend-svg")
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%")
			.append("g");

/******* Scales (Assumptions) *******/
	
	var xScaleArr = [], yScaleArr =[];
	
	//X and Y axes Scales
	
	//1. Scatter Plot
	xScaleArr.push(d3.scaleLog().domain([140, 200000]).range([0, width[0]]));
	yScaleArr.push(d3.scaleLinear().domain([10, 95]).range([height[0], 0]));	
	
	//2. Bar Chart (Region)
	xScaleArr.push(d3.scaleLinear()
						.domain([0, 70])
						.range([0,width[1]- 50]));
	yScaleArr.push(d3.scaleBand()
						.range([height[1], 0], 0.1)
						.paddingInner(0.05)
						.paddingOuter(0.05));

	//3. Bar Chart (Government)
	xScaleArr.push(d3.scaleLinear()
	                     .domain([0, 150])
	                     .range([0,width[2]- 50]));
	yScaleArr.push(d3.scaleBand()
						.range([height[2], 0], 0.1)
						.paddingInner(0.05)
						.paddingOuter(0.05));
	
	//4. Bar Chart (Costal Regions)
	xScaleArr.push(d3.scaleLinear()
						.domain([0, 3e5])
						.range([0,width[3]- 50]));
	yScaleArr.push(d3.scaleBand()
						.range([height[3], 0], 0.1)
						.paddingInner(0.05)
						.paddingOuter(0.05));

	
	//Extra Scales
	var radiusScale = d3.scaleSqrt().domain([0, 5e8]).range([2, 20]);
	var textScale = d3.scaleSqrt().domain([0, 5e8]).range([3, 20]);
	var colorScale = d3.scaleOrdinal(colorscheme);

/******* Create and Append X & Y axes, Add Axis Labels, Add Chart Title *******/
	
for(i in plots)
{
	x_label_xoffset=width[i]/4;  //Adjustment for Bar chart x labels
	x_label_yoffset = 35; 		//Adjustment for Bar chart x labels
	y_label_xoffset = -180; 	//Adjustment for Bar chart y labels
	y_label_yoffset = -125; 	//Adjustment for Bar chart y labels
	
	title_yoffset = -30; 		//Adjustment for Bar chart title
	title_font = "13px"; 		//Adjustments for title font size
	otherClass = "bar-labels"	// Label class to adjust font sizes for small bar charts
	// Create X & Y axes	
	if(plots[i] == 'scatter-plot') 	// For Scatter Plot
	{
		 x_axis.push(d3.axisBottom(xScaleArr[i])
								.tickValues(scatterTicks.x)
								.tickFormat(function (d) {return ""+d;}).tickSize(4));
		 y_axis.push(d3.axisLeft(yScaleArr[i])
							.tickValues(scatterTicks.y)
							.tickSize(4));
		
		//X Axis Ticks known for Scatter Plot - Call X-Axis					
		svg_array[i].append("g")
			.attr("class", "axis "+plots[i])
			.attr("transform", "translate(0," + height[i] + ")")
			.call(x_axis[i]);
		
		x_label_xoffset = 90;
		x_label_yoffset = 52;
		y_label_xoffset = -340;
		y_label_yoffset = -45;
		title_yoffset = 0;
		title_font = "20px";
		otherClass="";
		
		// Append Y axes
		svg_array[i].append("g")
			.attr("class", "axis")
			.attr("id", "y-axis")
			.call(y_axis[i]);
		
	}
	else  // For Bar Charts
	{
		x_axis.push(d3.axisBottom()
						.scale(xScaleArr[i])
						.tickFormat(function (d) {
							if ((d / 10000) >= 1) {
								d = d / 1000;
							}
							return ""+d;
						}).ticks(5));
		y_axis.push(d3.axisLeft()
						.scale(yScaleArr[i]));	

		//Y Axis Ticks unknown for Bar scale - Don't Call X-Axis					
		svg_array[i].append("g")
			.attr("class", "axis "+plots[i]);
			
		// Append X axes
		svg_array[i].append("g")
			.attr("class", "axis")
			.attr("id", "x-axis"+plots[i])
			.attr("transform", "translate(0," + height[i] + ")")
			.call(x_axis[i]);
	}
	

	
	// X-axis Label & Arrow
	svg_array[i].append("text")
		.attr("class", "x label "+otherClass)
		.attr("text-anchor", "start")
		.attr("x",x_label_xoffset)
		.attr("y", height[i] + x_label_yoffset)
		.html(plot_labels.x[i]+" &nbsp;&rarr;")	
		
	// Y-axis Label & Arrow
	svg_array[i].append("text")
		.attr("class", "y label "+otherClass)
		.attr("y", y_label_yoffset)
		.attr("x", y_label_xoffset)
		.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.html(plot_labels.y[i]+"&nbsp;&rarr;");	
	
	//Chart Title
	svg_array[i].append("text")
		.attr("class", "title")
		.attr("text-anchor", "start ")
		.attr("y", margin.top + title_yoffset)
		.attr("x", margin.left-50)
		.style("font-size",title_font)
		.style("opacity", 1)
		.html(plot_labels.title[i]+"<tspan class='yearlabel'>"+activeYear+"</tspan>");	
}


/******* Additional Details for Scatter Plot *******/
	
	//Create X gridlines
	var xGrid = d3.axisBottom(d3.scaleLinear().range([0, width[0]]))
	  .ticks(5)
	  .tickSize(-height[0])
	  .tickFormat("")

	//Create Y gridlines  
	var yGrid =d3.axisLeft(d3.scaleLinear().range([height[0],0]))
	  .ticks(5)
	  .tickSize(-width[0])
	  .tickFormat("")

	//Append X gridlines
	svg_array[0].append("g")			
	  .attr("class", "gridline")
	  .attr("transform", "translate(0," + height[0] + ")")
	  .call(xGrid)

	//Append Y gridlines
	svg_array[0].append("g")			
	  .attr("class", "gridline")
	  .call(yGrid)
			
	//Scatter Plot Sub-title
	svg_array[0].append("text")
		.attr("class", "sub-title")
		.attr("text-anchor", "start")
		.attr("y", margin.top+20)
		.attr("x", margin.left-50)
		.text("Mapping the health and Wealth of Nations")
		.style("opacity", 1);
		
	//Scatter Plot Background Year Label	
	svg_array[0].append("text")
		.attr("class", "yearlabel backgroundlabel")
		.attr("text-anchor", "middle")
		.attr("y", 3*height[0]/4)
		.attr("x", width[0]/2)
		.text(activeYear);

	//Scatter Plot Population Legend
	l_population = svg_array[0].append("g");
	
	l_population.append("text")
		.attr("text-anchor", "start")
		.attr("y", yScaleArr[0](24))
		.attr("x", xScaleArr[0](55000))
		.text("Size by Population")
		.style("font-weight", "700")
		.style("opacity", 1);		
	
	//Scatter Plot Population Legend - 100
	l_population.append("circle")
		.attr("class", "legend-circle")
		.attr("cy", yScaleArr[0](19))
		.attr("cx", xScaleArr[0](54000))
		.attr("r", radiusScale(100))
		.style("opacity", 1)
		.style( "stroke", "#000")
		.attr("fill","white");
	
	l_population.append("text")
		.attr("class", "sub-title")
		.attr("text-anchor", "start")
		.attr("y", yScaleArr[0](15))
		.attr("x", xScaleArr[0](50000))
		.html("100");	
	
	
	//Scatter Plot Population Legend - 10 million
	l_population.append("circle")
		.attr("class", "legend-circle")
		.attr("cy", yScaleArr[0](19))
		.attr("cx", xScaleArr[0](80000))
		.attr("r", radiusScale(1e7))
		.style("opacity", 1)
		.style( "stroke", "#000")
		.attr("fill","white");
	
	l_population.append("text")
		.attr("class", "sub-title")
		.attr("text-anchor", "start")
		.attr("y", yScaleArr[0](15))
		.attr("x", xScaleArr[0](65000))
		.html("10 million");	
	
	//Scatter Plot Population Legend - 1000 million
	l_population.append("circle")
		.attr("class", "legend-circle")
		.attr("cy", yScaleArr[0](17))
		.attr("cx", xScaleArr[0](140000))
		.attr("r", radiusScale(1e9))
		.style("opacity", 1)
		.style( "stroke", "#000")
		.attr("fill","white");
	
	l_population.append("text")
		.attr("class", "sub-title")
		.attr("text-anchor", "start")
		.attr("y", yScaleArr[0](17.5))
		.attr("x", xScaleArr[0](122500))
		.html("1000");
		
	l_population.append("text")
		.attr("class", "sub-title")
		.attr("text-anchor", "start")
		.attr("y", yScaleArr[0](15))
		.attr("x", xScaleArr[0](121500))
		.html("million");	
	
	
/******* Create Tool-tip Div *******/
var tooltipDiv = d3.select("body").append("div").attr("class", "tt").style("opacity", 0);

/******* Additional Tool-tips *******/
d3.select("#playPath")
	.on("mouseover", function(d){showHideToolTip(200,1,"Play")})
	.on("mouseout", function(d){showHideToolTip(500,0,"")});
d3.select("#pausePath")
	.on("mouseover", function(d){showHideToolTip(200,1,"Pause")})
	.on("mouseout", function(d){showHideToolTip(500,0,"")});
	
d3.select("#stopPath")
	.on("mouseover", function(d){showHideToolTip(200,1,"Stop")})
	.on("mouseout", function(d){showHideToolTip(500,0,"")});

d3.select("#reset")
	.on("mouseover", function(d){showHideToolTip(200,1,"Reset")})
	.on("mouseout", function(d){showHideToolTip(500,0,"")});
	
/****************************
Step 2: Widget Handlers(including functions)

		- Animation Handlers
		- Country Change Handler
		- Visible Bar Charts Handler
		- Jump to Year (Function)
		- Play (Function)
		- Pause (Function)
		- Enable Buttons (Function)
		- Disable Buttons (Function)
		- Show/Hide All Countries (Function)
		- Show/Hide Tool Tip (Function)
****************************/

//Event Handler for Click on Play Button 
d3.select("#animate").on("click", function(){ 
	console.log(yearIndex);
	if(yearIndex == yearArray.length-1)
	{
		yearIndex = 0;
		activeYear = yearArray[yearIndex];
		generateVisualization();
	}
	play();
});

//Event Handler for Click on Pause Button
d3.select("#unanimate").on("click", function(){pause();});

//Event Handler for Changing country from dropdown
d3.selectAll('#countrylist,#countrylist-2').on('change', showHideCountryHandler);

//Event handler for Visible Bar Charts Checkboxes
var limit = 2;
d3.selectAll('input.ckbox').on('change', function(evt) {
	d3.selectAll('.bars-charts').classed('visible-bar-charts', false).classed('hidden-bar-charts', true);
	if(d3.selectAll("input.ckbox:checked").size() > limit)
       this.checked = false;
	d3.selectAll("input.ckbox:checked").each(function(){ 
		d3.select("#"+this.dataset.id).classed('visible-bar-charts', true).classed('hidden-bar-charts', false);
	});	
	generateVisualization();

});

function showHideCountryHandler()
{
	activeCountry = d3.select("#countrylist").property('value');
	pause();
	if(activeCountry != "All")
	{
		comparisonCountry = d3.select("#countrylist-2").property('value');
		d3.select("#countrylist-2").attr('disabled', null).style("opacity","1");
		d3.select("#countrylist-label-2").style("opacity","1");
		disableButtons();
		generateVisualization();
	}
	else{
		d3.select("#countrylist-2").property("value","None").attr('disabled', 'disabled').style("opacity","0.3");
		d3.select("#countrylist-label-2").style("opacity","0.3");
		enableButtons();
		showHideCountries(animationTransitionDuration,0.9)
		svg_array[0].selectAll(".countryView1").remove();
		svg_array[0].selectAll(".countryView2").remove();
	}
}

//Function to see data for a particular year 
function jumpToIndex(i)
{
	pause();
	activeYear = yearArray[i];
	yearIndex = i;
	generateVisualization();
}

//Function to play Animation
function play()
{
	d3.select("#animate").style("opacity", 0.3);
	d3.select("#unanimate").style("opacity", 1);
	intervalHandle = setInterval(function() {
						yearIndex = parseInt(yearIndex) + 1;
						activeYear = yearArray[yearIndex];
						if(yearIndex >= yearArray.length){
							yearIndex = yearArray.length - 1;
							activeYear = yearArray[yearIndex];
							pause();
						}
						else{
							generateVisualization();
						}
					}, animationTransitionDuration-5);
} 
function stop()
{
	pause();
	yearIndex = 0
	activeYear = yearArray[yearIndex];
	generateVisualization();
}
function resetCountry()
{
	d3.select("#countrylist").property("value","All");
	showHideCountryHandler();
}
//Function to pause Animation
function pause()
{
	if(intervalHandle!=null)
		clearInterval(intervalHandle);
	
	d3.select("#animate").style("opacity", 1);
	d3.select("#unanimate").style("opacity", 0.3);
}

//Function to enable buttons for All Country selection (Default mode)
function enableButtons() {
    d3.selectAll('button').attr('disabled', null).classed("disable",false).classed("enable",true); 
	d3.selectAll('button#reset').attr('disabled', true).classed("disable",true).classed("enable",false);
	d3.selectAll('#yearSlider').attr('disabled', null).classed("disable",false).classed("enable",true);
};

//Function to disable buttons for a single country selection
function disableButtons() {
    d3.selectAll('button').attr('disabled', true).classed("disable",true).classed("enable",false); 
	d3.selectAll('button#reset').attr('disabled', null).classed("disable",false).classed("enable",true); 
	d3.selectAll('#yearSlider').attr('disabled', true).classed("disable",true).classed("enable",false); 
	
};

//Function to show/hide all countries for a single country/ All Countries selection
//Parameters: d - duration, 
//			  o - opacity			
function showHideCountries(d, o)
{
	d3.selectAll(".dot,.countrylabel")
		.transition()
		.duration(d)
		.ease(d3.easeCircle)
		.style("opacity", o);
}

//Function to show/hide tool tip div
//Parameters: t - duration, 
//			  o - opacity,
//			  d - data(html)
function showHideToolTip(t,o,d)
{
	tooltipDiv.transition()		
		.duration(t)
		.ease(d3.easeLinear)
		.style("opacity", o);
	var left = "0px";
	var top = "0px"
	if(o!=0)
	{
			left = (d3.event.pageX+18) + "px";
			top = (d3.event.pageY-28) + "px";
	}
	tooltipDiv.html(d)	
			.style("left", left)		
			.style("top", top);
}

/****************************
Step 3: Load data
		- Load data
		- Get year array
		- Set country dropdown
		- Set year buttons
		- Set dataset global variables - Master data, Region Filtered Data, Government Filtered Data 
		- Generate Visualization
		- Handlers for Buttons and Slider
****************************/

// Load the file data.csv and generate a visualisation based on it
d3.queue().defer(d3.csv, './resources/data/Gapminder_All_Time.csv').await(function(error,data) {
	// handle any data loading errors
	if(error){
		console.log("Something went wrong");
		console.log(error);
	}else{
		console.log("Data Loaded");
		enableButtons();
		
		//Set Country Dropdown
		d3.selectAll(".c-list").selectAll("option")
			.data(d3.map(data, function(d){return d.Country;}).keys())
			.enter()
			.append("option")
			.text(function(d){return d;})
			.attr("value",function(d){return d;});

		//Set Year buttons (stored years in global variable)
		yearArray = d3.map(data, function(d){return d.Year;}).keys().sort();
		
		d3.select("#yearlist").selectAll("button")
			.data(yearArray)
			.enter()
			.append("button")
			.attr("name",function(d,i){return i;})
			.attr("value",function(d){return d;})
			.attr("class",function(d){return ("year-button y_"+d);})
			.text(function(d){return d;});
		// Assign  the data object loaded to the global dataset variable
		dataset = data;
		
		//Filter Nested data for regions and their country counts
		regionArray = d3.map(data, function(d){return d.Region;}).keys();
		regiondata = d3.nest()
			.key(function(d) { return d.Year; })
			.key(function(d) { return d.Region; }).sortKeys(d3.ascending)
			.rollup(function(d) { return d.length; })
			.entries(dataset);	
		
		//Filter Nested data for government type and their counts
		govtdata = d3.nest()
			.key(function(d) { return d.Year; })
			.key(function(d) { return d.Government; }).sortKeys(d3.ascending)
			.rollup(function(d) { return d.length; })
			.entries(dataset);
			
		//Filter Nested data for Coastal region and their sum
		coastlinedata = d3.nest()
			.key(function(d) { return d.Year; })
			.key(function(d) { return d.Region; }).sortKeys(d3.ascending)
			.rollup(function(d) { 
				 return d3.sum(d, function(g) {return g.Coastline; }); 
			}).entries(dataset);
		
		// Generate the visualisation
		generateVisualization();
		
		//Generate Legend for regions
		generateLegend()
		
		//Handle Year Transitions (Through Button)
		d3.selectAll(".year-button").on("click", function(){
			jumpToIndex(d3.select(this).attr("name"));
		});

		//Handle Year Transitions (Through Slider)
		d3.select("#yearSlider").on("click", function(){
			jumpToIndex(d3.select(this).property("value"));
		});

	}
});  

/****************************
Step 4: Generate Visualization

		- Generate Visualization for All Countries
		- Generate Visualization for Selected Countries
			- Private functions to generate scatter plot, static country view and bar charts 
		- Generate Legend for regions
		- Year Filter (Function) - Part a
		- Country Filter (Function) - Part b
		- MouseOver Event Handler
		- MouseOut Event Handler
****************************/

function generateVisualization()
{
	var filtered_dataset = []
	if(activeCountry == "All")
	{
		//Set Widgets and labels
		d3.selectAll(".yearlabel").text(activeYear)
		d3.selectAll("#yearlist .year-button").classed("year-selected", false);
		d3.select(".y_"+activeYear).classed("year-selected", true);
		d3.select("#yearSlider").property("value", yearIndex);
		
		//1. Scatter Plot
		generateScatterPlot();		
		
		//2. Bar Chart (Region vs Number of Countries)
		filteredData = regiondata.filter(nestYearFilter)[0].values.sort(order);
		i=plots.indexOf("region-bar-chart");
		generateBarChart(filteredData, i, "regionlabel", function(d){ //for mouse over event
							d3.select(this).transition().style("opacity","1");
							var h = "<b>Region: </b>"+d.key+"<br><b>Number of Country: </b>" + d.value+"<br><b>Year: </b>"+activeYear;
							showHideToolTip(200,1,h)
						},function(d){ //for mouse out event 
							d3.select(this).transition().style("opacity","0.9");
							showHideToolTip(500,0,"")}, 
						function(d) { return colorScale(d.key); }); //for color scale
		
		//3. Bar Chart (Goervnement vs Number of Countries)
		filteredData=govtdata.filter(nestYearFilter)[0].values.sort(order);
		i=plots.indexOf("govt-bar-chart");
		generateBarChart(filteredData, i, "regionlabel_g", function(d){ //for mouse over event
					d3.select(this).transition().style("opacity","1");
					var h = "<b>Government: </b>"+d.key+"<br><b>Number of Country: </b>" + d.value+"<br><b>Year: </b>"+activeYear;
					showHideToolTip(200,1,h)
			},function(d){ //for mouse out event
					d3.select(this).transition().style("opacity","0.9");
					showHideToolTip(500,0,"")},  
			function(d) { return "cornflowerblue"; }); //for constant color
		

		//4. Bar Chart (Coastline Bar chart vs Number of Countries)
		filteredData = coastlinedata.filter(nestYearFilter)[0].values.sort(order);
		i=plots.indexOf("coastline-bar-chart");
		generateBarChart(filteredData, i, "coastlinelabel", function(d){ //for mouse over event
				d3.select(this).transition().style("opacity","1");
				var h = "<b>Region: </b>"+d.key+"<br><b>Coastline: </b>" + d.value+"<br><b>Year: </b>"+activeYear;
				showHideToolTip(200,1,h)
			},function(d){ //for mouse out event
				d3.select(this).transition().style("opacity","0.9");
				showHideToolTip(500,0,"")
			}, function(d) { return colorScale(d.key); }); //for color scale
	}
	else
	{
		//Filter dataset according to country name	
		filtered_dataset = dataset.filter(function countryFilter(value){
			return (value.Country == activeCountry)
		});
		generateStaticCountryPlot(filtered_dataset,1);			//4. Visualization for Selected Country
		if(comparisonCountry != "None")
		{
			//Filter dataset according to country name	
			filtered_dataset2 = dataset.filter(function countryFilter(value){
				return (value.Country == comparisonCountry)
			});
			generateStaticCountryPlot(filtered_dataset2,2);			//5. Visualization for Selected Country for comparison
		}
		else
			svg_array[0].selectAll(".countryView2").remove();
	}

	//Private function to generate bar charts 
	function generateBarChart(filteredData, i, text_labelclass, mover, mout, colorScaleFunction)
	{
		// Update the domain of the x scale
		yScaleArr[i].domain(filteredData.map(function(d) { return d.key; }));
		// Call the x-axis
		svg_array[i].select(".axis."+plots[i]).call(y_axis[i]);
	
		/******** PERFORM DATA JOIN ************/
		// Join new data with old elements, if any.
		var bars = 	svg_array[i].selectAll("rect")
								.data(filteredData, function key(d) { return d.key;});
		
		var barsText = svg_array[i].selectAll("text."+text_labelclass)
								   .data(filteredData, function key(d) { return d.key;});

		/******** HANDLE UPDATE SELECTION ************/
		// Update the display of existing elelemnts to match new data
		bars
			.transition()
			.duration(animationTransitionDuration)
			.ease(d3.easeLinear)
			.attr("y", function(d) {
				return yScaleArr[i](d.key);
		   })
		   .attr("x", 1)
		   .attr("height", yScaleArr[i].bandwidth())
		   .attr("width", function(d) {
				return xScaleArr[i](+d.value);
		   }).style("fill", colorScaleFunction)
		   .style("opacity","0.9");
		
		barsText
			.transition()
			.ease(d3.easeLinear)
			.text(function(d) {return (d.value)})
			.attr("class", "label "+text_labelclass)
			   .attr("y", function(d,j) {return (height[i]-((yScaleArr[i].bandwidth()+1.5)*j)-3)})
			   .attr("x", function(d) {
				return (xScaleArr[i](+d.value) + 5) ;});

		/******** HANDLE ENTER SELECTION ************/
		// Create new elements in the dataset
		bars.enter()
			.append("rect")
			.attr("y", function(d) {
				return yScaleArr[i](d.key);
		   })
		   .attr("x", 1)
		   .attr("height", yScaleArr[i].bandwidth())
		   .attr("width", function(d) {
				return xScaleArr[i](+d.value);
		   })
		   .on("mouseover", mover)
			.on("mouseout", mout)
			.style("fill", colorScaleFunction)
			.style("opacity","0.9");

			barsText.enter()
			.append("text")
			   .text(function(d) {return (d.value)})
			   .attr("class", "label "+text_labelclass)
			   .attr("y", function(d,j) {return (height[i]-((yScaleArr[i].bandwidth()+1.5)*j)-3)})
			   .attr("x", function(d) {
				return (xScaleArr[i](+d.value) + 5) ;});


		/******** HANDLE EXIT SELECTION ************/
		// Remove bars that not longer have a matching data eleement
		bars.exit().remove();
		barsText.exit().remove();
	}
	
	
	//Private function to generate scatter plot for health and weatlh of nations
	function generateScatterPlot()
	{
		filtered_dataset = dataset.filter(yearFilter);
		i=plots.indexOf("scatter-plot");
		//Join new data with old elements, if any
		var countryCircle = svg_array[i]
							.selectAll("circle.dot")
							.data(filtered_dataset, function key(d) { return d.Code; });
		var countryText = svg_array[i]
							.selectAll("text.countrylabel")
							.data(filtered_dataset, function key(d) { return d.Code; });

		/******** HANDLE UPDATE SELECTION ************/
		// Update the display of existing circles to match new data 
		countryCircle
			.transition()
			.duration(animationTransitionDuration)
			.ease(d3.easeLinear)
			.attr("class", function(d){ return ("dot " +d.Code+" "+d.Region); })
			.attr("id", function(d){ return d.Code; })
			.attr("cx", function(d) { return xScaleArr[i](+d.GDP); })
			.attr("cy", function(d) { return yScaleArr[i](+d.LifeExp); })
			.attr("r", function(d) { return radiusScale(+d.Population); })
			.style("fill", function(d) { return colorScale(d.Region); })

		// Update the display of existing country text labels to match new data
		countryText
			.transition()
			.duration(animationTransitionDuration)
			.ease(d3.easeLinear)
			.attr("class", function(d){ return ("countrylabel " +d.Code+" "+d.Region); })
			.attr("text-anchor", "middle")
			.attr("y", function(d) { return (yScaleArr[i](+d.LifeExp) + (radiusScale(+d.Population)/2));})
			.attr("x", function(d) { return (xScaleArr[i](+d.GDP)+ radiusScale(+d.Population)); })
			.style("font-size",function(d) { return textScale(+d.Population)+"!important"; })
			.text(function(d){ return d.Country; });

		/******** HANDLE ENTER SELECTION ************/
		// Create new circles in the dataset
		countryCircle
			.enter().append("circle")
			.attr("class", function(d){ return ("dot " +d.Code+" "+d.Region); })
			.attr("id", function(d){ return d.Code; })
			.attr("cx", function(d) { return xScaleArr[i](+d.GDP); })
			.attr("cy", function(d) { return yScaleArr[i](+d.LifeExp); })
			.attr("r", function(d) { return radiusScale(+d.Population); })
			.style("fill", function(d) { return colorScale(d.Region); })
			.on("mouseover", mouseOverCountry)
			.on("mouseout", mouseOutCountry);
		
		// Create new country text labels in the dataset
		countryText
			.enter().append("text")
			.attr("class", "countrylabel")
			.attr("text-anchor", "middle")
			.attr("y", function(d) { return (yScaleArr[i](+d.LifeExp) + (radiusScale(+d.Population)/2));})
			.attr("x", function(d) { return (xScaleArr[i](+d.GDP)+ radiusScale(+d.Population)); })
			.style("font-size",function(d) { return textScale(+d.Population); })
			.on("mouseover", mouseOverCountry)
			.on("mouseout", mouseOutCountry)
			.text(function(d){ return d.Country; });
		
		/******** HANDLE EXIT SELECTION ************/
		countryCircle.exit().remove();
		countryText.exit().remove();
	}
	

	//Private function to generate static country plot
	//Parameters: Country filtered dataset and id of the country 
	function generateStaticCountryPlot(filtered_datset, id)
	{
		//Hide All Countries
		d3.selectAll(".dot,.countrylabel")
			.transition()
			.duration(200)
			.style("opacity", 0.10);
		
		//Create group to plot country path
		countryPath[id] = svg_array[0].attr("class","countryView"+id).selectAll("circle.countryView"+id).data(filtered_datset);
		
		/******** HANDLE UPDATE SELECTION ************/
		// Update the display of existing circles to match new data 
		countryPath[id]
			.transition()
			.duration(animationTransitionDuration)
			.ease(d3.easeLinear)
			.attr("class", function(d){ return ("countryView"+id+" "+d.Code+" "+d.Region); })
			.attr("cx", function(d) { return xScaleArr[0](+d.GDP); })
			.attr("cy", function(d) { return yScaleArr[0](+d.LifeExp); })
			.attr("r", function(d) { return radiusScale(+d.Population); })
			.style("fill", function(d) { return colorScale(d.Region); })
			.style( "stroke", "#000");
		
		/******** HANDLE ENTER SELECTION ************/
		// Create new circles in the dataset
		countryPath[id]
				.enter().append("circle")
				.attr("class", function(d){ return ("countryView"+id+" "+d.Code+" "+d.Region); })
				.attr("cx", function(d) { return xScaleArr[0](+d.GDP); })
				.attr("cy", function(d) { return yScaleArr[0](+d.LifeExp); })
				.attr("r", function(d) { return radiusScale(+d.Population); })
				.style("fill", function(d) { return colorScale(d.Region); })
				.style( "stroke", "#000")
				.on("mouseover", mouseOverCountry)
				.on("mouseout", mouseOutCountry);
		
		/******** HANDLE EXIT SELECTION ************/
		countryPath[id].exit().remove();
	}
}
//Function to generate legend
function generateLegend()
{
	var filteredLegendData = regiondata.filter(nestYearFilter)[0].values.sort(order);
	var legend = svg_l.selectAll(".legend")
		.data(filteredLegendData)
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) {
			if(i<=(regionArray.length/2-1))
				return "translate("+ i * 115 +",0)";
			else
				return "translate("+ ((i-regionArray.length/2) * 115) +",15)";
		});

	legend.append("rect")
		.attr("width", 11)
		.attr("height", 11)
		.style("fill", function(d) { return colorScale(d.key); });

	legend.append("text")
		.attr("x",13)
		.attr("y", 9)
		.style("text-anchor", "start")
		.text(function(d) { return d.key+" "; });
}

//Defines a sort order so that the largest bars are drawn first.
function order(a, b) {
	return +b.value - +a.value;
}

//Define a function that filters data by year
function yearFilter(value){
	return (value.Year == activeYear)
}
//Define a function that filters data by year (For nested data -region)
function nestYearFilter(value){
	return (value.key == activeYear)
}

//Function for Country Tooltip - MouseOverEvent
function mouseOverCountry(d){
	if(activeCountry == "All")
	{	
		pause();
		showHideCountries(animationTransitionDuration,0.1)
		d3.select("#"+d.Code)
			.transition()
			.duration(200)
			.style("opacity", 1);
	}
	var lifeExp = Math.round(d.LifeExp * 100) / 100
	var h = "<b>Country: </b>" + d.Country+"<br><b>Year: </b>"+d.Year+"<br><b>GDP: </b>"+d.GDP
			+"<br><b>Life Expectency: </b>"+lifeExp+"<br><b>Population: </b>"+d.Population;
	showHideToolTip(200,1,h)
}
//Function for Country Tooltip - MouseOutEvent
function mouseOutCountry(d)
{
	if(activeCountry == "All")
		showHideCountries(animationTransitionDuration,0.9)
	showHideToolTip(500,0,"")
}