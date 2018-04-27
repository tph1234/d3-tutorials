    var Grid= Object.freeze({X:{"NotVisible":false, "Visible":true},Y:{"NotVisible":false, "Visible":true}});
	var AxisLine= Object.freeze({X:{"NotVisible":false, "Visible":true},Y:{"NotVisible":false, "Visible":true}});

    var Chart = function(opts) {
		this.version= '5.x'
        // load in arguments from config object
        this.element = opts.element;
        this.data = opts.data;

        this.initLayout();
        // create the chart
        this.draw();
    }

	Chart.prototype.initLayout = function() {
     			// define width, height and margin of svg area
     			this.width = +this.element.attributes.width.nodeValue;
     			this.height = +this.element.attributes.height.nodeValue;
     			var m= this.element.attributes.margin.value.split(' ');
     			this.margin = {top: +m[0].match(/(\d+)(px)?/)[1],right: +m[1].match(/(\d+)(px)?/)[1],
     			bottom: +m[2].match(/(\d+)(px)?/)[1],left: +m[3].match(/(\d+)(px)?/)[1]};
     	}

    Chart.prototype.draw = function() {
        // set up parent element and SVG
        // need for redraw. empty out all g children, otherwise will create more than one svg
        this.element.innerHTML = '';

		// new svg element
        this.svg = d3.select(this.element).append('svg')
        	.attr('width',  this.width)
        	.attr('height', this.height);

        // append plot to a <g> element
        this.plot = this.svg.append('g')
            .attr("transform", "translate("+ [this.margin.left, this.margin.top] + ")")
            .attr('width', +this.svg.attr("width") - (this.margin.left + this.margin.right))
            .attr('height', +this.svg.attr("height") - (this.margin.top + this.margin.bottom));

        // create the other stuff
        this.createBox();
        this.createScales();
        this.addAxes(AxisLine.X.NotVisible,AxisLine.Y.NotVisible,Grid.X.Visible,Grid.Y.NotVisible);
        this.addChartTitle('BRAF_V600R_PlxC');
        this.addXAxisLabel('Analytes');
        this.addYAxisLabel('Peak Height');
        this.addPlot();
        this.addAnnotation();
    }

	Chart.prototype.createBox = function(){
		// enclosing box
    	var rect= this.svg.append("rect")
    	.attr("x",0)
    	.attr("y",0)
    	.attr("width",+this.svg.attr("width"))
    	.attr("height",+this.svg.attr("height"))
    	.attr("style","stroke:gray;stroke-width:1;fill-opacity:0;stroke-opacity:0.5");
	}

    Chart.prototype.createScales = function(){
        // calculate max and min for data
        var xExtent = this.data.map(function(d) { return d.x; });
        var yExtent = [0, d3.max(this.data, function(d) { return d.y; })];

        this.xScale = d3.scalePoint().range([0, +this.plot.attr("width")]).padding(1)
            .domain(xExtent);

        this.yScale = d3.scaleLinear()
            .rangeRound([+this.plot.attr("height"), 0])
            .domain(yExtent);
    }

    Chart.prototype.addAxes = function(showXLine=true,showYLine=true,showHorizontalGrid=true,showVerticalGrid=false){
        var m = this.margin;

        // create and append axis
        var xAxis = d3.axisBottom(this.xScale);
        var xAxisElement = this.plot.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (+this.plot.attr("height")) + ")")
            .call(xAxis);

        var yAxis = d3.axisLeft(this.yScale)
        var yAxisElement = this.plot.append("g")
            .attr("class", "axis")
            .call(yAxis)

    // show vertical Y grid lines
        if (showVerticalGrid) {
          var verticalGrid = d3.axisTop(this.xScale)
            .tickSize(this.plot.attr("height"))
            .tickSizeOuter(0)
            .tickFormat('');
          xAxisElement.append('g')
          .attr('class', 'grid')
          .call(verticalGrid)
        }

    // show horizontal X grid lines
        if (showHorizontalGrid) {
          var horizontalGrid = d3.axisRight(this.yScale)
            .tickSize(this.plot.attr("width"))
            .tickSizeOuter(0)
            .tickFormat('');
          yAxisElement.append('g')
          .attr('class', 'grid')
          .call(horizontalGrid)
        }

        	// hide the X axis line but leave the ticks and tick labels
        	if(!showXLine)
        	 this.plot.append("line")
            .attr("x1", 0)
            .attr("y1", +this.plot.attr("height"))
            .attr("x2", +this.plot.attr("width"))
            .attr("y2", +this.plot.attr("height"))
            .attr("stroke-width", 2)
            .attr("stroke", "white");

        	// hide the Y axis line but leave the ticks and tick labels
        	if(!showYLine) this.plot.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", +this.plot.attr("height"))
            .attr("stroke-width", 3)
            .attr("stroke", "white");
    }


    Chart.prototype.addChartTitle = function(title){
        var yOffset = 2 * this.margin.top / 3;

        this.plot.append("text")
        	.attr("id", "chartTitle")
            .attr("transform", "translate("+ [this.plot.attr('width')/2, -yOffset] +")")
            .attr("text-anchor", "middle")
            .text(title);
    }

    Chart.prototype.addXAxisLabel= function(label){
        var yOffset = 2 * this.margin.bottom / 3;

        this.plot.append("text")
        	.attr("id", "axisLabel")
            .attr("transform", "translate("+[+this.plot.attr('width')/2, +this.plot.attr('height') + yOffset]+")")
            .attr("text-anchor", "middle")
            .text(label);
    }

    Chart.prototype.addYAxisLabel= function(label){
        var xOffset = 2 * this.margin.bottom / 3;

        this.plot.append("text")
        	.attr("id", "axisLabel")
        	.attr("transform", "rotate(-90)")  // rotate basis
        	.attr("y",-xOffset)  // y' new basis relative to old basis -x
            .attr("x",-(+this.plot.attr("height"))/2) // x' new basis relative to old basis y
            .attr("text-anchor", "middle")
            .text(label);

//                    this.plot.append("text")
//                    	.attr("id", "axisLabel")
//                    	 .attr('transform', `rotate(-90)translate(${-(+this.plot.attr("height"))/2},${-xOffset})`)
//                        .attr("text-anchor", "middle")
//                        .text(label);
    }

    Chart.prototype.addPlot = function(){
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

        // need to load `this` into `_this`...
        var _this = this;
        this.plot.selectAll(".cir")
                      .data(this.data.filter(d => d.symbol==0))
                      .enter()
                      .append("circle")
                        .attr("class", "cir")
                        .attr("cx", function(d) { return _this.xScale(d.x); })
                        .attr("cy", function(d) { return _this.yScale(d.y); })
                        .attr('r', 3)
                        .style('fill', this.dataColor || 'red');

    		var triangleSize= 20;
        	this.plot.selectAll('.symbol')
           .data(this.data.filter(d => d.symbol==1))
           .enter()
           .append('path')
           .attr('transform',function(d,i) { return "translate("+[+_this.xScale(d.x), +_this.yScale(d.y)]+")";})
           .attr('d', d3.symbol().size(triangleSize).type( d3.symbolTriangle ) );

    }

    Chart.prototype.addAnnotation = function() {
    	var dataY= 2;
    	this.plot.append("line")
        .attr("x1", 0)
        .attr("x2",+this.plot.attr("width"))
        .attr("y1", this.yScale(dataY))
        .attr("y2", this.yScale(dataY))
        .attr("stroke", "orange");
    }

    // the following are "public methods"
    // which can be used by code outside of this file

    Chart.prototype.setColor = function(newColor) {

        this.plot.selectAll('.cir')
            .style('fill',newColor);

        // store for use when redrawing
        this.dataColor = newColor;
    }

    Chart.prototype.setData = function(newData) {
        this.data = newData;

        // full redraw needed
        this.draw();
    }
