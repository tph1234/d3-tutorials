const Grid = Object.freeze({X: {"NotVisible": false, "Visible": true}, Y: {"NotVisible": false, "Visible": true}});
const AxisLine = Object.freeze({X: {"NotVisible": false, "Visible": true}, Y: {"NotVisible": false, "Visible": true}});
const pointRadius = 3;
const pointTriangleSize = 20;
const pointColor = '#D733FF';
const selectedPointColor = '#33E6FF';

var Chart = function (opts) {
    this.version = '5.x'
    // load in arguments from config object
    this.element = opts.element;
    this.data = opts.data;

    this.initLayout();
    // create the chart
    this.draw();
}

Chart.prototype.initLayout = function () {
    // define width, height and margin of svg area
    this.width = +this.element.attributes.width.nodeValue;
    this.height = +this.element.attributes.height.nodeValue;
    const m = this.element.attributes.margin.value.split(' ');
    this.margin = {
        top: +m[0].match(/(\d+)(px)?/)[1], right: +m[1].match(/(\d+)(px)?/)[1],
        bottom: +m[2].match(/(\d+)(px)?/)[1], left: +m[3].match(/(\d+)(px)?/)[1]
    };
}

Chart.prototype.draw = function () {
    // set up parent element and SVG
    // need for redraw. empty out all g children, otherwise will create more than one svg
    this.element.innerHTML = '';

    // new svg element
    this.svg = d3.select(this.element).append('svg')
        .attr('width', this.width)
        .attr('height', this.height);

    // append plot to a <g> element
    this.plot = this.svg.append('g')
        .attr("transform", "translate(" + [this.margin.left, this.margin.top] + ")")
        .attr('width', +this.svg.attr("width") - (this.margin.left + this.margin.right))
        .attr('height', +this.svg.attr("height") - (this.margin.top + this.margin.bottom));

    // create the other stuff, careful about 'fill' or mouse events won't be picked up
    this.createBox();
    this.createScales();
    this.addAxes(AxisLine.X.NotVisible, AxisLine.Y.NotVisible, Grid.X.Visible, Grid.Y.Visible);
    this.addChartTitle('BRAF_V600R_PlxC');
    this.addXAxisLabel('Analytes');
    this.addYAxisLabel('Peak Height');
    this.addAnnotation();

    //this.addPlot();
    this.addSwarmPlot();
}

Chart.prototype.createBox = function () {
    // enclosing box
    this.svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", +this.svg.attr("width"))
        .attr("height", +this.svg.attr("height"))
        .attr("style", "stroke:gray;stroke-width:1;fill-opacity:0;stroke-opacity:0.5")
        .attr("fill", 'none')
}

Chart.prototype.createScales = function () {
    // calculate max and min for data
    const xExtent = this.data.map((d) => d.x);
    const yExtent = [0, d3.max(this.data, (d) => d.y)];

    this.xScale = d3.scalePoint()
        .range([0, +this.plot.attr("width")]).padding(1)
        .domain(xExtent);

    this.yScale = d3.scaleLinear()
        .rangeRound([+this.plot.attr("height"), 0])
        .domain(yExtent);
}

Chart.prototype.addAxes = function (showXLine = true, showYLine = true, showHorizontalGrid = true, showVerticalGrid = false) {
    // create and append axis
    const xAxis = d3.axisBottom(this.xScale);
    const xAxisElement = this.plot.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (+this.plot.attr("height")) + ")")
        .call(xAxis);

    const yAxis = d3.axisLeft(this.yScale)
    const yAxisElement = this.plot.append("g")
        .attr("class", "axis")
        .call(yAxis)

    // show vertical Y grid lines
    if (showVerticalGrid) {
        const verticalGrid = d3.axisTop(this.xScale)
            .tickSize(this.plot.attr("height"))
            .tickSizeOuter(0)
            .tickFormat('');
        xAxisElement.append('g')
            .attr('class', 'grid')
            .call(verticalGrid)
    }

    // show horizontal X grid lines
    if (showHorizontalGrid) {
        const horizontalGrid = d3.axisRight(this.yScale)
            .tickSize(this.plot.attr("width"))
            .tickSizeOuter(0)
            .tickFormat('');
        yAxisElement.append('g')
            .attr('class', 'grid')
            .call(horizontalGrid)
    }

    // hide the X axis line but leave the ticks and tick labels
    if (!showXLine)
        this.plot.append("line")
            .attr("x1", 0)
            .attr("y1", +this.plot.attr("height"))
            .attr("x2", +this.plot.attr("width"))
            .attr("y2", +this.plot.attr("height"))
            .attr("stroke-width", 2)
            .attr("stroke", "white");

    // hide the Y axis line but leave the ticks and tick labels
    if (!showYLine) this.plot.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", +this.plot.attr("height"))
        .attr("stroke-width", 15)
        .attr("stroke", "white");
}

Chart.prototype.addChartTitle = function (title) {
    const yOffset = 2 * this.margin.top / 3;

    this.plot.append("text")
        .attr("id", "chartTitle")
        .attr("transform", "translate(" + [this.plot.attr('width') / 2, -yOffset] + ")")
        .attr("text-anchor", "middle")
        .text(title);
}

Chart.prototype.addXAxisLabel = function (label) {
    const yOffset = 2 * this.margin.bottom / 3;

    this.plot.append("text")
        .attr("id", "axisLabel")
        .attr("transform", "translate(" + [+this.plot.attr('width') / 2, +this.plot.attr('height') + yOffset] + ")")
        .attr("text-anchor", "middle")
        .text(label);
}

Chart.prototype.addYAxisLabel = function (label) {
    const xOffset = 2 * this.margin.bottom / 3;

    this.plot.append("text")
        .attr("id", "axisLabel")
        .attr("transform", "rotate(-90)")  // rotate basis
        .attr("y", -xOffset)  // y' new basis relative to old basis -x
        .attr("x", -(+this.plot.attr("height")) / 2) // x' new basis relative to old basis y
        .attr("text-anchor", "middle")
        .text(label);

//                    this.plot.append("text")
//                    	.attr("id", "axisLabel")
//                    	 .attr('transform', `rotate(-90)translate(${-(+this.plot.attr("height"))/2},${-xOffset})`)
//                        .attr("text-anchor", "middle")
//                        .text(label);
}

Chart.prototype.addPlot = function () {
    // need to load `this` into `_this`...
    const _this = this;

    this.plot.selectAll("point")
        .data(this.data.filter(d => d.symbol == 0))
        .enter()
        .append('path')
        .attr('class', d => `point ${d.symbol}`)
        .attr('d', d3.symbol().size(8 * pointRadius).type(d3.symbolCircle))
        .attr('stroke-width', 5)
        .attr('transform', d => `translate(${this.xScale(d.x)},${d.y})`)
        .style('fill', this.dataColor || pointColor)
        .style('opacity', 0.7)
        .on('click', (d) => {
            Chart.prototype.handleMouseClick(_this, d, pointRadius);
        });

    this.plot.selectAll('point')
        .data(this.data.filter(d => d.symbol == 1))
        .enter()
        .append('path')
        .attr('transform', (d, i) => {
            return "translate(" + [+_this.xScale(d.x), +_this.yScale(d.y)] + ")";
        })
        .attr('d', d3.symbol().size(pointTriangleSize).type(d3.symbolTriangle))
        .on('click', (d) => {
            Chart.prototype.handleMouseClick(_this, d, pointRadius);
        })


    // need to load `this` into `_this`...
//        var _this = this;
//        var line = d3.svg.line()
//            .x(function(d) {
//                // ... so we can access it here
//                return _this.xScale(d[0]);
//            })
//            .y(function(d) {
//                return _this.yScale(d[1]);
//            });
//        this.plot.append('path')
//            // use data stored in `this`
//            .datum(this.data)
//            .classed('line',true)
//            .attr('d',line)
//            // set stroke to specified color, or default to red
//            .style('stroke', this.lineColor || 'red');

    // var lineData = [{"x": 0, "y": 0}, {"x": +this.svg.attr("width"), "y": 0},
    //     {"x": +this.svg.attr("width"), "y": +this.svg.attr("height")}, {"x": 0, "y": +this.svg.attr("height")},
    //     {"x": 0, "y": 0}];
    // var lineFunction = d3.line()
    //     .x(function (d) {
    //         return d.x;
    //     })
    //     .y(function (d) {
    //         return d.y;
    //     });
    // this.svg.append("path")
    //     .attr("d", lineFunction(lineData))
    //     .attr("stroke", "blue")
    //     .attr("stroke-width", 2)
    //     .attr("fill", 'none')
}

// arbitrary number of categories
Chart.prototype.addSwarmPlot0 = function () {
    const _this = this;

    let categories = Array.from(new Set(this.data.map((d) => d.x)));
    let swarm = categories.map((c) => d3.beeswarm()
        .data(this.data.filter(point => point.x === c))
        .distributeOn(d => this.yScale(d.y))
        .radius(8)
        .orientation('vertical')
        .arrange()
    );
    var swarm1 = swarm.reduce((a1, a2) => a1.concat(a2));
    this.plot.selectAll("point")
        .data(swarm1)
        .enter()
        .append('path')
        .attr('class', d => `point ${d.datum.symbol}`)
        .attr('d', d3.symbol().size(pointTriangleSize).type(d3.symbolTriangle))
        .attr('stroke-width', 5)
        .attr('transform', d => `translate(${this.xScale(d.datum.x) + d.x},${d.y})`)
        .on('click', (d) => {
            Chart.prototype.handleSwarmMouseClick(_this, d, pointRadius);
        });
}

// 2 categories only
// https://bl.ocks.org/Kcnarf/5c989173d0e0c74ab4b62161b33bb0a8
Chart.prototype.addSwarmPlot = function () {
    const _this = this;

    // circles
    let swarm1 = d3.beeswarm()
        .data(this.data.filter(point => point.symbol === 0))
        .distributeOn(d => this.yScale(d.y))
        .radius(1.5*pointRadius) // set the radius for overlapping detection
        .orientation('vertical')
        .arrange(); // launch arrangement computation;
                     // return an array of {datum: , x: , y: }
                    // where datum refers to an element of data
                    // each element of data remains unchanged

    this.plot.selectAll("point")
        .data(swarm1)
        .enter()
        .append('path')
        .attr('class', d => `point ${d.datum.symbol}`)
        .attr('d', d3.symbol().size(8 * pointRadius).type(d3.symbolCircle))
        .attr('stroke-width', 5)
        .attr('transform', d => `translate(${this.xScale(d.datum.x) + d.x},${d.y})`)
        .style('fill', this.dataColor || pointColor)
        .style('opacity', 0.7)
        .on('click', (d) => {
            Chart.prototype.handleSwarmMouseClick(_this, d, pointRadius);
        });

    // triangles
    let swarm2 = d3.beeswarm()
        .data(this.data.filter(point => point.symbol === 1))
        .distributeOn(d => this.yScale(d.y))
        .radius(1.5*pointRadius)
        .orientation('vertical')
        .arrange();

    this.plot.selectAll("point")
        .data(swarm2)
        .enter()
        .append('path')
        .attr('class', d => `point ${d.datum.symbol}`)
        .attr('d', d3.symbol().size(pointTriangleSize).type(d3.symbolTriangle))
        .attr('stroke-width', 5)
        .attr('transform', d => `translate(${this.xScale(d.datum.x) + d.x},${d.y})`)
        .on('click', (d) => {
            Chart.prototype.handleSwarmMouseClick(_this, d, pointRadius);
        });
}

Chart.prototype.handleMouseClick = function (_this, d, pointRadius) {
    console.log(`draw big circle around (${_this.xScale(d.x)},${_this.yScale(d.y)},${d.symbol})`);

    _this.plot.append("circle")
        .attr('class', 'click-circle')
        .attr("cx", _this.xScale(d.x))
        .attr("cy", _this.yScale(d.y))
        .attr('r', 2 * pointRadius)
        .style('fill', 'none')
        .style('stroke', selectedPointColor)
        .style("stroke-width", 2)
}

Chart.prototype.handleSwarmMouseClick = function (_this, d, pointRadius) {
    console.log(`draw big circle around (${d.datum.x}, ${_this.xScale(d.datum.x) + d.x}, ${_this.yScale(d.datum.y)}, ${d.datum.symbol})`);

    _this.plot.append("circle")
        .attr('class', 'click-circle')
        .attr("cx", _this.xScale(d.datum.x) + d.x)
        .attr("cy", _this.yScale(d.datum.y))
        .attr('r', 2 * pointRadius)
        .style('fill', 'none')
        .style('stroke', '#33E6FF')
        .style("stroke-width", 2)
}

Chart.prototype.addAnnotation = function () {
    const dataY = 2;
    this.plot.append("line")
        .attr("x1", 0)
        .attr("x2", +this.plot.attr("width"))
        .attr("y1", this.yScale(dataY))
        .attr("y2", this.yScale(dataY))
        .attr("stroke", "orange");
}

// the following are "public methods"
// which can be used by code outside of this file

Chart.prototype.setColor = function (newColor) {

    this.plot.selectAll('.cir')
        .style('fill', newColor);

    // store for use when redrawing
    this.dataColor = newColor;
    // full redraw needed
    this.draw();
}

Chart.prototype.setData = function (newData) {
    this.data = newData;

    // full redraw needed
    this.draw();
}
