var mapSvg;
var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
var Country;

var mapData;
var timeData;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];
   
    drawMap();
  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key == 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap() {
  d3.select("#linear-gradient").remove();
  d3.select("#axis-B").remove();
 
  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);

  // get the selected year based on the input box's value
  //var year = "2000";
  //var p= d3.select("#year-input").html(this.value);
  var year=document.getElementById("year-input").value;
 console.log(year);
 //console.log(q);
  // get the GDP values for countries for the selected year
  
  let yearData = timeData.filter( d => d.Year == year)[0];
  
  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);
  console.log(extent[1])
 

  // get the selected color scale based on the dropdown value
  //var color_select=document.getElementById("color-scale-select").value;

  var color_select=d3.select("#color-scale-select").node().value;
  console.log(color_select)
  var colorScale = d3.scaleSequential(window["d3"][color_select])
                     .domain(extent);
  var div = d3.select("body").append("div")
      .attr("class", "tooltip-donut")
      .style("opacity", 0);

   
  // draw the map on the #map svg
  let g = mapSvg.append('g');
  g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .attr('id','bordercolors')
    .style('stroke','black')
    .attr('stroke-width','1')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if(isNaN(val) || val==0) 
        return 'white';
      return colorScale(val);
    })
    
    .on('mouseover', function(d) {
      var country=d.properties.name;
      var Gdp= yearData[d.properties.name];
      console.log('mouseover on ' + country);
      console.log('mouseover on ' + Gdp);
      d3.select(this).transition()
           .duration('50')
           .style('stroke', 'cyan')
           .attr('stroke-width','4')

           div.transition()
               .duration(50)
               .style("opacity", 1);
               div.html(`Country: ${country} <br> GDP: ${Gdp}`)
               .style("text-align","left")
               .style("left", (d3.event.pageX) + "px")
               .style("top", (d3.event.pageY - 15) + "px");
               
    })


    .on('mousemove',function(d,i) {
      console.log('mousemove on ' + d.properties.name);
    })


    .on('mouseout', function(d,i) {
      d3.select(this).transition()
           .duration('50')
           .style('stroke', 'black')
           .attr('stroke-width','1')
      div.transition()
           .style("opacity",0);
                     
    })
    .on('click', function(d,i) {
      console.log('clicked on ' + d.properties.name);
     Country=d.properties.name;
      drawLineChart(d.properties.name);


 });
  //const svg = d3.select(DOM.svg(width, height));
  var defs = g.append("defs");
  
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
  
  linearGradient.selectAll("stop")
    .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
  console.log(  d3.select("#linear-gradient"))
    g.append("rect")
        .attr("x", 10)
        .attr("y", 480)
        .attr("width", 250)
        .attr("height", 20)
        .attr("fill","url(#linear-gradient)");
    var axisScale = d3.scaleLinear()
        .domain(extent)
        .range([0,250]);
    

    var axisBottom = g => g
        .attr("id", "axis-B")
        .attr("class", `x-axis`)
        .attr("transform", `translate(10,500)`)
        .call(d3.axisBottom(axisScale)
        .ticks(7)
          
          .tickSize(-30));

    g.append('g')
          .call(axisBottom);
    d3.selectAll('line').attr("stroke","white");
    d3.selectAll('path').attr("stroke","white");
            
}


// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').
function drawLineChart(country) {
  d3.select("#lineSvg").remove();
  d3.select("#y-label").remove();
  if(!country)
    return;
  var year_list=[]
  var country_gdp=[];
  
  var div = d3.select("body").append("div")
  .attr("class", "tooltip-donut")
  .style("opacity", 0);
  for (i = 0; i < 52; i++) {
  year_list.push(1960+i)
  Object.entries(timeData[i]).forEach(item => {
    
    if(item[0]==country)
    {if(item[1]==""){
      country_gdp.push(0)
    }else{
      country_gdp.push(Number(item[1]))
    }}
    
  })}

console.log(`year:${year_list}`);   
console.log(`gdp:${country_gdp}`);



  
  /////////////////////////////////////////////////////
  // set the dimensions and margins of the graph
  var margin = {top: 100, right: 30, bottom: 60, left: 100},
width = lineWidth-(lineInnerWidth)/2 +90,
height =lineHeight-(lineInnerHeight)/2 +80;
data=[]
for (i=0;i<52;i++)
{
data.push({Year:`${year_list[i]}`,GDP:`${country_gdp[i]}`})
}
// set the ranges
var x = d3.scaleLinear().range([0, lineInnerWidth]);
var y = d3.scaleLinear().range([lineInnerHeight-101, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.Year); })
    .y(function(d) { return y(d.GDP); });

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var lineSvg = d3.select("#linechart")
.append("svg")
.attr("id", "lineSvg")
.attr("width", lineWidth)
.attr("height", lineHeight)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");



// format the data
data.forEach(function(d) {
  d.Year = d.Year;
  d.GDP = +d.GDP;
});


console.log(data)
// Scale the range of the data
x.domain(d3.extent(data, function(d) { return d.Year}));
y.domain([0, d3.max(data, function(d) { return d.GDP; })]);

// Create the circle that travels along the curve of chart
var focus = lineSvg
.append('g')
.append('circle')
  .style("fill", "none")
  .attr("stroke", "black")
  .attr('r', 10)
  .style("opacity", 0)

// Create the text that travels along the curve of chart
var focusText = lineSvg
.append('g')
.append('text')
  .style("opacity", 0)
  .attr("text-anchor", "left")
  .attr("alignment-baseline", "middle")

// Add the valueline path.
lineSvg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", valueline)
  .attr("fill", "none")
  .attr("stroke", "black")
  .attr("stroke-width", 2);


  
// Add the X Axis
//var tickLabels = ['1960','','1970','','1980','','1990','','2000','','2010']
const xAxis = d3.axisBottom(x).tickFormat((d,i) => `${d}`)
    lineSvg.append("g")
        .attr("id","xaxislabels")
        .attr("transform", "translate(0," + height + ")")
        .style("stroke","gray")
        .attr("class", "axisgray")
        .call(xAxis);
var ticks = d3.selectAll("#xaxislabels .tick text");
        ticks.each(function(_,i){
            if(i%2 != 0) d3.select(this).remove();
        });
        
// text label for the x axis
lineSvg.append("text")             
    .attr("transform",
    "translate(" + (width/2) + " ," + 
    (height + margin.top/2) + ")")
  .style("text-anchor", "middle")
  .style("stroke","gray")
  .text("Year");

// Add the Y Axis
lineSvg.append("g")
.call(d3.axisLeft(y).tickSize(-lineInnerWidth))
 .style("stroke","gray")
 .attr("class", "axisgray")
 .call(g => g.select(".domain")
        .remove())
 .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "5,10"))
  ;
  

// text label for the y axis
lineSvg.append("text")
  .attr("transform", "rotate(-90)")
  //.attr("id", "y-label")
  .attr("y", -60)
  .attr("x",0 - (height / 2))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("stroke","gray")
  .text("GDP for "+country+" (based on current USD)"); 

  lineSvg.selectAll(".tick line")
  .attr("stroke","gray");

  lineSvg.selectAll(".domain")
  .attr("stroke","gray");

// Create a rect on top of the svg area: this rectangle recovers mouse position
lineSvg
.append('rect')
.style("fill", "none")
.style("pointer-events", "all")
.attr('width', 640)
.attr('height', 419)
.on('mouseover', mouseover)
.on('mousemove', mousemove)
.on('mouseout', mouseout);

// This allows to find the closest X index of the mouse:
var bisect = d3.bisector(function(d) { return d.Year; }).left;

// What happens when the mouse move -> show the annotations at the right positions.
function mouseover() {
  focus.style("opacity", 1)
  focusText.style("opacity",1)
}

function mousemove() {
  // recover coordinate we need
  var x0 = x.invert(d3.mouse(this)[0]);
  var i = bisect(data, x0, 1);
  selectedData = data[i]
 
  focus
    .attr("cx", x(selectedData.Year))
    .attr("cy", y(selectedData.GDP))
  //focusText
    // .html("x:" + selectedData.Year + "  -  " + "y:" + selectedData.GDP)
    //.attr("x", x(selectedData.Year)+15)
     //.attr("y", y(selectedData.GDP))

     d3.select(this).transition()
           
           div.transition()
               .duration(50)
               .style("opacity", 1);
               div.html(`Year: ${selectedData.Year} <br> GDP: ${selectedData.GDP}`)
               .style("text-align","left")
               .style("left", (d3.event.pageX+10) + "px")
               .style("top", (d3.event.pageY+40) + "px");
  }
function mouseout() {
  focus.style("opacity", 0)
  div.transition().style("opacity", 0)
}


}