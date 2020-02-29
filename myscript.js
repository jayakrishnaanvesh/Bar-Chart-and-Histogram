function handle_pageload(){
	myfunc();
	d3.select('select')
 	 .on('change', function() {
    	myfunc();
	});
}
var hist_data;
var hist_attr;
var hist_bin;
function myfunc(){
	d3.csv("arcos-ny-statewide-itemized.csv",function(error,data){
		if(error){
			alert("failed loading data");
		}
		var attributesList= Object.getOwnPropertyNames(data[0]);
		loadOptions(attributesList);
		var attr_index=d3.select('#d3-dropdown').property("value");
		if(attr_index==undefined)
			attr_index=4;
		if(isNaN(Number(data[0][attributesList[attr_index]]))){
			formatted_data=prepareData_barchart(data,attributesList[attr_index]);
			loadBarChart(formatted_data,attributesList[attr_index]);			
		}
		else{
			formatted_data=prepareData_histogram(data,attributesList[attr_index]);
			hist_data=formatted_data
			hist_attr=attributesList[attr_index]
			bin=20
			loadhistogram(formatted_data,attributesList[attr_index],20);
		}
	})

}

function loadOptions(data){
	d3.select("#d3-dropdown")
		.selectAll("option")
		.data(data)
		.enter().append("option")
		.text(function(d) { 
			return d; })
		.attr("value", function (d, i) {
			return i;
		});
	}

function prepareData_barchart(items,attr){
	labels={};
	for(item in items){
		value=items[item][attr];
		if(value!=undefined){
			if(labels[value]==undefined || labels[value]==null){
				labels[value]=1;
			}
			else{
				labels[value]=labels[value]+1;
			}	
		}
	}
	return labels;
}
function prepareData_histogram(items,attr){
	values=[];
	for(item in items){
		value=items[item][attr];
		if(value!=undefined && value!="" && !isNaN(Number(value)) ){
			values.push(Number(value));
		}
	}
	return values;
}

function loadBarChart(d,x_label){
	var xam=Object.keys(d);
	var data=Object.values(d);
	var xdata = xam.map(function (key) { 
          
        // Using Number() to convert key to number type 
        // Using obj[key] to retrieve key value 
        return {"name":key, "value":d[key]}; 
	}); 
	var width = 900, height = 400;
	//svg
	d3.select("svg").remove();
	var svg = d3.select("#barchart")
		.append("svg")
		.attr("width", width+100)
		.attr("height", height+100)
		.style("background","azure")
	//scales	
	var xscale = d3.scaleBand()
		.domain(xam)
		.range([0,width]).padding(0.3);

	var yscale = d3.scaleLinear()
			.domain([0, d3.max(data)])
			.range([height, 50]);

	var x_axis=d3.axisBottom().scale(xscale);
	var y_axis = d3.axisLeft()
			.scale(yscale);

	svg.append("g")
		   .attr("transform", "translate(50,0)")
		   .call(y_axis)
		   .append("text")
         .attr("transform", "rotate(-90)")
		 .attr("y", -30)
		 .attr("x",-100)
		 .attr("text-anchor", "end")
		 .text("Number Of Items")
		 .attr("stroke", "black")
		 .attr("font-size",13);

	var xAxisTranslate = height;

	var k= svg.append("g")
				.attr("transform", "translate(50, " + xAxisTranslate+")")
				.call(x_axis)
				.selectAll("text")	
        			.style("text-anchor", "end")
        			.attr("transform", "rotate(-50)")
	svg.append("text")
			.attr("y", 480 )
			.attr("x", 500 )
			.attr("text-anchor", "end")
			.text(x_label)
			.attr("stroke", "black")
		 	.attr("font-size",13);
	svg.selectAll(".bar")
			.data(xdata)
			.enter().append("rect")
			.style('fill',"steelblue")
			.attr("x",function(d) { 
				return xscale(d.name)+50; })
			.attr("y",function(d) { return yscale(d.value); })
			.attr("width",xscale.bandwidth())
			.attr("height",function(d) { return height -  yscale(d.value); })
			.on("mouseover", function(d,i){
				d3.select(this)
				.style('fill',"navy")
				.attr("width",(xscale.bandwidth()+5))
				.attr("height",function(d) { return height -  yscale(d.value)+1; });
				svg.append("text")
					.attr("y", d3.select(this).attr("y")-10 )
					.attr("x", d3.select(this).attr("x") )
					.attr("text-anchor", "start")
					.attr("id","val")
					.text(d.value);
								
			})
          	.on("mouseout", function(d,i){
				d3.select(this).style('fill',"steelblue")
				.style('fill',"steelblue")
				.attr("width",xscale.bandwidth())
				.attr("height",function(d) { return height -  yscale(d.value); });
				svg.select("#val").remove();
			});	
}
function loadhistogram(d,x_label,bin){
	var data=d;
	var width = 900, height = 400;
	//svg
	d3.select("svg").remove();
	var svg = d3.select("#barchart")
		.append("svg")
		.attr("width", width+100)
		.attr("height", height+50)
		.style("background","azure")
	//scales	
	var xscale = d3.scaleLinear()
		.domain([d3.min(data),d3.max(data)])
		.range([0,width]);
	
	//bins
	var histogram = d3.histogram()
      .value(function(d) { return d })
      .domain(xscale.domain())
      .thresholds(xscale.ticks(bin));

	// And apply this function to data to get the bins
  	var bins = histogram(data);
	var yscale = d3.scaleLinear()
	  .domain([0, d3.max(bins, function(d) { return d.length; })])
	  .range([height, 50]);

	var x_axis=d3.axisBottom().scale(xscale);
	var y_axis = d3.axisLeft()
	  .scale(yscale);

	svg.append("g")
		   .attr("transform", "translate(50,0)")
		   .call(y_axis)
		   .append("text")
         .attr("transform", "rotate(-90)")
		 .attr("y", -30)
		 .attr("x",-100)
         .attr("text-anchor", "end")
		 .text("Number Of Items")
		 .attr("stroke", "black")
		 .attr("font-size",13);

	var xAxisTranslate = height;

	var k= svg.append("g")
				.attr("transform", "translate(50, " + xAxisTranslate+")")
				.call(x_axis)
	svg.append("text")
			.attr("y", 440 )
			.attr("x", 500 )
			.attr("text-anchor", "end")
			.text(x_label)
			.attr("stroke", "black")
		 	.attr("font-size",13);

	svg.selectAll("rect")
			.data(bins)
			.enter()
			.append("rect")
			.style('fill',"steelblue")
			.attr("x",function(d) { 
				return xscale(d.x0)+52 })
			.attr("y",function(d) { return yscale(d.length); })
			.attr("width",function(d) { return xscale(d.x1) - xscale(d.x0)-1 ; })
			.attr("height",function(d) { return height - yscale(d.length); })
			.on("mouseover", function(d,i){
				d3.select(this)
				.style('fill',"navy")
				.attr("width",function(d) { return xscale(d.x1) - xscale(d.x0)+4 ; })
				.attr("height",function(d) { return height - yscale(d.length)+1; })
				svg.append("text")
					.attr("y", d3.select(this).attr("y")-10 )
					.attr("x", d3.select(this).attr("x") )
					.attr("text-anchor", "start")
					.attr("id","val")
					.text(d.length);
								
			})
          	.on("mouseout", function(d,i){
				d3.select(this).style('fill',"steelblue")
				.style('fill',"steelblue")
				.attr("width",function(d) { return xscale(d.x1) - xscale(d.x0)-1 ; })
				.attr("height",function(d) { return height - yscale(d.length); });
				svg.select("#val").remove();
			})
				addSvgEvents(svg);
		
}

var oldx=0;
function addSvgEvents(svg){
	svg.on("mousedown",	function() {
			if(d3.event.button==0){
				var mp=d3.mouse(this);
				oldx=mp[0]
			}
		}
	)
	.on("mouseup",function() {
		if(d3.event.button==0){
			var mp=d3.mouse(this);
			pageX=mp[0];
			bin+=(oldx-pageX)/3;
			loadhistogram(hist_data,hist_attr,bin);
			oldx = pageX;
			console.log(pageX)
		}
	})
	.on("mousemove",function (e) {
	});
}