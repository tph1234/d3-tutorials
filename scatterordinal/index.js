var svg, margin, width, height, xScale, yScale, g, xAxis, yAxis;
var drawingArea, header, xAxisTitle, yAxisTitle;
var numYTicks = 8;

function drawHeader(title) {
    var yOffset = margin.top / 3;
    header.append("text")
        .attr("id", "title")
        .attr("transform", "translate(" + [width / 2, yOffset] + ")")
        .attr("text-anchor", "middle")
        .text(title)
}

function drawXAxisTitle(title) {
    var yOffset = margin.bottom / 3;
    xAxisTitle.append("text")
        .attr("transform", "translate(" + [width / 2, +svg.attr("height") - yOffset] + ")")
        .attr("text-anchor", "middle")
        .text(title)
}

function drawYAxisTitle(title) {
    yAxisTitle.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 2 * margin.left / 3)
        .attr("x", 0 - (+svg.attr("height")) / 2)
        .attr("text-anchor", "middle")
        .text(title);
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisRight(yScale)
        .ticks(numYTicks)
}

function initLayout() {
    svg = d3.select("svg"),
        margin = {top: 60, right: 65, bottom: 65, left: 65},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    // set the ranges
    xScale = d3.scalePoint().range([0, width]).padding(1),
        yScale = d3.scaleLinear().rangeRound([height, 0]);

    // enclosing box
    var rect = svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", +svg.attr("width"))
        .attr("height", +svg.attr("height"))
        .attr("style", "stroke:gray;stroke-width:5;fill-opacity:0;stroke-opacity:0.5");

    g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    xAxis = d3.axisBottom(xScale);
    yAxis = d3.axisLeft(yScale).ticks(numYTicks, "");

    // drawing area
    drawingArea = svg.append("g")
        .classed("drawingArea", true)
        .attr("transform", "translate(" + [margin.left, 0] + ")");

    // header
    header = drawingArea.append("g")
        .attr("id", "header");
    drawHeader('BRAF_V600R_PlxC');

    // x axis label
    xAxisTitle = drawingArea.append("g").attr("id", "axisTitle");
    drawXAxisTitle('Analyte');

    // y axis label
    yAxisTitle = drawingArea.append("g").attr("id", "axisTitle");
    drawYAxisTitle('Peak Height');

    // add the Y gridlines
//  	g.append("g")
//      .attr("class", "grid")
//      .call(make_y_gridlines()
//          .tickSize(width)
//          .tickFormat("")
//      )


}


function plotData() {
    var data = [{category: 'A', peakheight: 2.5}, {category: 'A', peakheight: 18}, {
        category: 'A',
        peakheight: 30
    }, {category: 'C', peakheight: 40}, {category: 'C', peakheight: 12}, {category: 'C', peakheight: 12}];
    // Define Extent for each Dataset
    xScale.domain(data.map(function (d) {
        return d.category;
    }));
    yScale.domain([0, d3.max(data, function (d) {
        return d.peakheight;
    })]);
    // Add Axes
    // X AXIS
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    // Y AXIS
    var yAxisElement = g.append("g")
        .call(yAxis);

    const yGridLines = d3.axisRight(yScale)
        .tickSize(width)
        .tickFormat('');
    yAxisElement.append('g')
        .attr('class', 'grid')
        .call(yGridLines);

    g.selectAll(".cir")
        .data(data)
        .enter().append("circle")
        .attr("class", "cir")
        .attr("cx", function (d) {
            return xScale(d.category);
        })
        .attr("cy", function (d) {
            return yScale(d.peakheight);
        })
        .attr('r', 3)


    var data2 = [{category: 'A', peakheight: 0}, {category: 'A', peakheight: 1}, {
        category: 'A',
        peakheight: 3
    }, {category: 'C', peakheight: 0}, {category: 'C', peakheight: 2}, {category: 'C', peakheight: 3.5}];
//	var triangleSize= 3;
//	var triangles= data2.map(d=> {
//		var vertices= [{x:xScale(d.category), y:yScale(d.peakheight)-triangleSize},{x:xScale(d.category)+triangleSize, y:yScale(d.peakheight)+triangleSize},{x:xScale(d.category)-triangleSize, y:yScale(d.peakheight)+triangleSize}];
//		return "M"+ vertices[0].x+ " " + vertices[0].y+ " L" + vertices[1].x+ " " + vertices[1].y+ " L" + vertices[2].x+ " "+ vertices[2].y+ " Z";
//	});

//  g.selectAll(".tria")
//    .data(triangles)
//    .enter().append("path")
//      .attr("d",function(d) { return d; })

    var triangleSize = 20;
    g.selectAll('.symbol')
        .data(data2)
        .enter()
        .append('path')
        .attr('transform', function (d, i) {
            return "translate(" + [+xScale(d.category), +yScale(d.peakheight)] + ")";
        })
        .attr('d', d3.symbol().size(triangleSize).type(d3.symbolTriangle));
}

function drawThreshold() {
    var threshold = svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", +svg.attr("width") - margin.right)
        .attr("y1", yScale(2) + margin.top)
        .attr("y2", yScale(2) + margin.top)
        .attr("stroke", "orange");
}


initLayout();
plotData();
drawThreshold;



