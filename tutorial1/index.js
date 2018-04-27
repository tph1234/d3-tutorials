var dataset = [30, 68, 189, 234];

//d3.select('h1').style('color','red')
//.attr('class','heading')
//.text('Updated h1 tag');

//d3.select('body').append('p').text('firs paragrahp')
//d3.select('body').append('p').text('firs paragrahp')
//d3.select('body').append('p').text('firs paragrahp')

//d3.selectAll('p').style('color','blue')

//d3.select('body')
//.selectAll('p')
//.data(dataset)
//.enter()
//.append('p')
//.text(function(d) { return d; });
//
//d3.select('body')
//.selectAll('p')
//.data(dataset)
//.enter()
//.append('p')
//.text(function(d) { return d; });

// barchart
var x_dataset = [80, 100, 56, 120, 180, 30, 40, 120, 160];
var y_dataset = [10, 20, 30, 40, 50];
//var dataset = [1,2,3,4,5];


var svgWidth = 500, svgHeight = 300;

var barPadding = 5;
var barWidth = (svgWidth / y_dataset.length);

var svg = d3.select('svg')
    .attr("width", svgWidth)
    .attr("height", svgHeight)
//    .attr("class", "svg-container");


var yScale = d3.scaleLinear()
    .domain([0, d3.max(y_dataset)])
    .range([0, svgHeight]);

var barChart = svg.selectAll("rect")
    .data(y_dataset)
    .enter()
    .append("rect")
    .attr("y", function (d) {
        return svgHeight - yScale(d)
    })
    .attr("height", function (d) {
        return yScale(d);
    })
    .attr("width", barWidth - barPadding)
    .attr("transform", function (d, i) {
        var translate = [barWidth * i, 0];
        return "translate(" + translate + ")";
    })
    .attr("style", "fill:rgb(0,0,255);fill-opacity:0.1;stroke-width:1;stroke:rgb(0,255,0)");


var xScale = d3.scaleLinear()
    .domain([0, d3.max(x_dataset)])
    .range([0, svgWidth]);
var x_axis = d3.axisBottom()
    .scale(xScale);

yScale = d3.scaleLinear()
    .domain([0, d3.max(y_dataset)])
    .range([svgHeight, 0]);

var y_axis = d3.axisLeft()
    .scale(yScale);

svg.append("g")
    .attr("transform", "translate(50, -20)")
    .call(y_axis);

var xAxisTranslate = svgHeight - 20;

svg.append("g")
    .attr("transform", "translate(50, " + xAxisTranslate + ")")
    .call(x_axis);


var line = svg.append("line")
    .attr("x1", 50)
    .attr("x2", svgWidth)
    .attr("y1", yScale(10) - 20)
    .attr("y2", yScale(10) - 20)
    .attr("stroke", "red");


//
//
//
//var text = svg.selectAll("text")
//    .data(dataset)
//    .enter()
//    .append("text")
//    .text(function(d) {
//        return d;
//    })
//    .attr("y", function(d, i) {
//        return svgHeight - d - 2;
//    })
//    .attr("x", function(d, i) {
//        return barWidth * i;
//    })
//    .attr("fill", "#A64C38");