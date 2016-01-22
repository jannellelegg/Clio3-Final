var map_width = 720;
var map_height = 425;

var data;

// Converting TopoJSON to GeoJSON in order to display
// projection = defines projection, path = generates path
var projection = d3.geo.albersUsa()
  .scale(850)
  .translate([map_width / 2, map_height / 2]);

var path = d3.geo.path().projection(projection);

//define linear for horizontal linear scale legend
/*var linear = d3.scale.linear()
	.domain([1,52])
	.range(['#80BEBC','#3B5857']);*/

//define colorScale for frequency of services for mission circles
var colorScale = d3.scale.linear()
  .domain([1,52])
  .range(['#80BEBC','#3B5857']);

var color = d3.scale.ordinal()
	.domain (["1", "52"])
	.range(['#80BEBC','#3B5857']);


// Create the SVGs and creating the zoom function
var map_svg = d3.select("#map")
.append("svg")
  .attr("width", map_width)
  .attr("height", map_height)
.append("g")
  .call(d3.behavior.zoom().scaleExtent([1,8]).on("zoom", zoom))
.append("g");

// Create the frequency legend -- original
/*var freqlegend = map_svg.append("g")
  .attr("class", "freqlegend")
  .attr("transform", "translate(" + (map_width - 70) + "," + (map_height - 50) + ")")
  .selectAll("g")
    .data([colorScale])
  .enter().append("g");
  freqlegend.append("circle")
    .attr("cy", function(d) {return -radius(d);})
    .attr("r", radius);
  freqlegend.append("text")
      .attr("dy", "-3em")
      .attr("dx", "-5.5em")
      .text("Mission Frequency 1:52");*/

//define linear scale legend -- failed this part
// var freqlegend = map_svg.append("g")
//   .attr("class", "freqlegend")
//   .attr("transform", "translate(" + (width - 190) + "," + 200 + ")");

/*freqlegend.append("text")
 	  .attr("dy", "-1.5em")
      .attr("dx", "-3.5em")
      .text("Mission Frequency 0-52");

var freqlegendField = freqlegend.append("g")
  .attr("transform", "translate(0,20)")
  .append("text");

var freqlegendColors = legend.append("g")
  .attr("class","legend-colors")
  .attr("transform", "translate(10,40)");*/


//this works, but only one circle.
var freqlegend = map_svg.append("g")
  .attr("class", "freqlegend")
  .attr("transform", "translate(" + (map_width - 610) + "," + (map_height - 50) + ")")
  .selectAll("g")
    .data([4])
  .enter().append("g");
  freqlegend.append("circle")
  	.attr("r", 4)
    .attr("cy", function(d) {return -colorScale(d);})
  freqlegend.append("text")
      .attr("dy", "-1.5em")
      .attr("dx", "-3.5em")
      .text("Mission Frequency 1:52");

//Create the legend
var legend = map_svg.append("g")
	.attr("class", "legend")
	.attr("transform", "translate(" + (map_width - 610) + "," + (map_height - 5) + ")")
	.selectAll("g")
		.data([4])
	.enter().append("g");
	legend.append("circle")
		.attr("r", 4);
	legend.append("text")
      .attr("dy", "-1em")
      .attr("dx", "-5em")
    	.text("Residential Deaf School");


queue()
  .defer(d3.json, "state_1870.json")
  .defer(d3.json, "railroads.json")
  .defer(d3.csv, "cleanCMDM.csv")
  .defer(d3.csv, "cleanSchools.csv")
  .await(ready);

function ready(error, state_1870, railroads, cleanCMDM, cleanSchools) {
  data = cleanCMDM;
  schools = cleanSchools;
  console.log(state_1870);

//state map
	  map_svg.selectAll(".states")
	  .data(topojson.feature(state_1870, state_1870.objects.state_1870).features)
	  .enter().append("path")
	  .attr("class", function(d) { return "state " + d.id; })
	  .attr("d", path);

		  map_svg.append("path")
		  .datum(topojson.mesh(state_1870, state_1870.objects.state_1870))
		  .attr("d", path)
		  .attr("class", "border");

//adding train map
    map_svg.selectAll(".train")
    .data(topojson.feature(railroads, railroads.objects.RR1870WGS84).features)
    .enter().append("path")
    .attr("class", function(d) { return "state " + d.id; })
    .attr("d", path);

      map_svg.append("path")
      .datum(topojson.mesh(railroads, railroads.objects.RR1870WGS84))
      .attr("d", path)
      .attr("class", "train");

	//creating the zoom overlay
	  map_svg.append("rect")
	  .attr("class", "overlay")
	  .attr("width", map_width)
	  .attr("height", map_height);

	//Add points for each of the schools
	  map_svg.selectAll(".school")
	    .data(cleanSchools)
	    .enter()
	    .append("circle")
	    .attr("r", 4)
    //Add tooltip on mouseover for each circle
	    .on("mouseover", function(d) {   
	      d3.select("#tooltip")
	        //Show the tooltip above where the mouse triggers the event
	        .style("left", (d3.event.pageX) + "px")     
	        .style("top", (d3.event.pageY - 90) + "px")
	        .select("#mission-label")  
	        .html("<strong>" + d.school + "</strong>" + "<br/>" + "location: " + d.location + "<br/>" + "founded: " + d.founded)      
	        //Show the tooltip
	      d3.select("#tooltip").classed("hidden", false);})
	    .on("mouseout", function() {
	        //Hide the tooltip
	        d3.select("#tooltip").classed("hidden", true);})
	    .attr("class","school")
	    .attr("transform", function(d) {
	      console.log(d);
	      return "translate(" + projection([d.lon,d.lat]) + ")";
	    });

	//Add points for each of the missions
	  map_svg.selectAll(".mission")
	    .data(cleanCMDM)
	    .enter()
	    .append("circle")
    //define the size of the circle
      .attr('r', 3)
    //style the circle to reflect the frequency of services offered
      .style('stroke', function(d) {return colorScale(d.frequency);})
      .style('fill-opacity', .7)
      .style('fill', function(d) {return colorScale(d.frequency);})
      
      
	    .on("mouseover", function(d) {   
	    //Add tooltip on mouseover for each circle
	      d3.select("#tooltip")
	      //Show the tooltip above where the mouse triggers the event
	        .style("left", (d3.event.pageX) + "px")     
	        .style("top", (d3.event.pageY - 90) + "px")
	        .select("#mission-label")  
	        .html("<strong>" + d.facility + "</strong>" + "<br/>" + "location: " + d.location + "<br/>" + "frequency: " + d.frequency + "<br/>" + "Church Clergy: " + d.churchClergy + "<br/>" + "CMDM Clergy: " + d.CMDMClergy + "<br/>" + "Notes: " + d.notes)      
	    //Show the tooltip
	      d3.select("#tooltip").classed("hidden", false);
	               })
	    .on("mouseout", function() {
	    //Hide the tooltip
	      d3.select("#tooltip").classed("hidden", true);})
	    .attr("class","mission")

	    .attr("transform", function(d) {return "translate(" + projection([d.lon,d.lat]) + ")";})};

// Create the slider
  d3.slider = function module() {
  "use strict";

  // Public variables width default settings
    var min = 1873,
        max = 1879,
        step = 1, 
        animate = true,
        orientation = "horizontal",
        axis = false,
        margin = 50,
        value = 1873,
        scale; 
  // Private variables
    var axisScale,
        dispatch = d3.dispatch("slide"),
        formatPercent = d3.format(".2%"),
        tickFormat = d3.format(".0"),
        sliderLength;
    function slider(selection) {
      selection.each(function() {
      // Create scale if not defined by user
        if (!scale) {
          scale = d3.scale.linear().domain([1873, 1879]);
        }  
        // Start value
        value = value || scale.domain()[1873]; 
        // DIV container
        var div = d3.select(this).classed("d3-slider d3-slider-" + orientation, true);
        var drag = d3.behavior.drag();
        // Slider handle
        var handle = div.append("a")
            .classed("d3-slider-handle", true)
            .attr("xlink:href", "#")
            .on("click", stopPropagation)
            .call(drag);
        // Horizontal slider
        if (orientation === "horizontal") {
          div.on("click", onClickHorizontal);
          drag.on("drag", onDragHorizontal);
          handle.style("left", formatPercent(scale(value)));
          sliderLength = parseInt(div.style("width"), 10);
        } 
        // Move slider handle on click/drag
    function moveHandle(pos) {
    var newValue = stepValue(scale.invert(pos / sliderLength));
      if (value !== newValue) {
        var oldPos = formatPercent(scale(stepValue(value))),
          newPos = formatPercent(scale(stepValue(newValue))),
          position = (orientation === "horizontal") ? "left" : "bottom";
        dispatch.slide(d3.event.sourceEvent || d3.event, value = newValue);
          if (animate) {
            handle.transition()
                .styleTween(position, function() { return d3.interpolate(oldPos, newPos); })
                .duration((typeof animate === "number") ? animate : 250);
          } else {
            handle.style(position, newPos);          
          }
        }
      }
    // Calculate nearest step value
    function stepValue(val) {
        var valModStep = (val - scale.domain()[0]) % step,
            alignValue = val - valModStep;
        if (Math.abs(valModStep) * 2 >= step) {
          alignValue += (valModStep > 0) ? step : -step;
        }
        return alignValue;
      }
    // define handle actions
    function onClickHorizontal() {
        moveHandle(d3.event.offsetX || d3.event.layerX);}
    function onDragHorizontal() {
        moveHandle(Math.max(0, Math.min(sliderLength, d3.event.x)));}    
    function stopPropagation() {
        d3.event.stopPropagation();}
    });
  } 
  d3.rebind(slider, dispatch, "on");
  return slider;
}
// calling the zoom function
function zoom() {
  map_svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// redraw points on the map based on the slider values
d3.select('#slider3').call(d3.slider().on("slide",redraw));
function redraw(evt, value) {
      console.log(value)
      d3.select('#slider3text').text(value);

      map_svg.selectAll(".mission")
        .data(data)
        .classed("hidden", true)
        .filter(function(d) {
           return +d.year === value;
       })
        .classed("hidden", false);
  }







