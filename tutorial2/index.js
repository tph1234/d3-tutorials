var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .domain([".", "A", "C", " "])
    .rangePoints([0, width]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var svg = d3.select('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("g")
    .attr("class", "x axis")
    .call(xAxis);
