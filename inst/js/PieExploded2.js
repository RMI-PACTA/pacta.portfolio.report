class PieExploded {

  constructor(container, data, labels_pie, opts) {
    let container_div;
    if (typeof container === "string") {
      container_div = document.querySelector(container);
    } else {
      container_div = container;
    }
    
    d3.select(container_div).attr("chart_type", "PieExploded");
    d3.select(container_div).attr("chart_type_data_download",container_div.id); //matching the names in the export/ folder
    
    container_div.classList.add("PieExploded");
    container_div.classList.add("d3chart");
    container_div.classList.add("chart_container");
    
    let container_div_width = parseInt(window.getComputedStyle(container_div, null).width);
    
    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);
    
    this.container = d3.select(chart_div);
    
    opts = (typeof opts === "undefined") ? {} : opts;
    
    let asset_class = (typeof opts.default_class === "undefined") ? "Listed Equity" : opts.default_class;

    this.unit = (typeof opts.unit === "undefined") ? "USD" : opts.unit;
    this.hole_percent = (typeof opts.hole_percent === "undefined") ? 0.4 : opts.hole_percent;

    var labels_pie = (typeof labels_pie === "undefined") ? {} : labels_pie;
    let title = (typeof labels_pie.title === "undefined") ? "" : labels_pie.title;
    let asset_class_comment = (typeof labels_pie.asset_class === "undefined") ? "Asset Class" : labels_pie.asset_class;
    let comment = (typeof labels_pie.comment === "undefined") ? ["",""] : Array.from(labels_pie.comment); // create a new variable so we don't modify the original labels
    comment[0] = comment[0].replace("_PORT_", asset_class_comment);
    let numbers_long = (typeof labels_pie.comment === "undefined") ? {M: " million", G: " billion", T: " trillion"} : labels_pie.numbers_long;

    function findLongestName(data,label) {
        let longest_name_length = d3.max(data, d=>d[label].length);
        let long_test_label = new Array(longest_name_length).join("a")
        return long_test_label; 
    };

    function findTextWidth(text,chart_div) {
      let label_width = 0;
      let test_svg = d3.select(chart_div).append("svg");
      test_svg.append("text")
        .attr("font-size","10")
        .text(text)
        .each(function() { label_width = this.getBBox().width; })
      ;
      test_svg.remove();
      return label_width;
    }

    let comment_length = Math.max(comment[0].length,comment[1].length) + 4; //4 is the length of '100%'
    let long_test_label = new Array(comment_length).join("a");
    let label_width = findTextWidth(long_test_label,chart_div);

    let comment_position = label_width + 70;

    let long_label = findLongestName(data,"key_translation");
    let tech_label_width = findTextWidth(long_label + "aaaaa",chart_div);

    this.width = 700;
    this.height = 500;
    this.margin = {top: 40, bottom: 170, left: 110, right: 40};

    this.radius = Math.min(this.width - this.margin.left - this.margin.right,
                           this.height - this.margin.top - this.margin.bottom) / 2;

    this.pie_center = this.radius + this.margin.left;

    this.exploded_offset = 80;

    this.text_right_offset = 50;
    this.text_left_offset = Math.min(100, this.margin.left + this.exploded_offset - tech_label_width);
    this.minLabelSpacing = 16;

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = this.width + "px";
    titlediv.classList = "chart_title";
    let title_p = document.createElement("p");
    let bold_elt = document.createElement("b");
    //strong_class.classList = "boldText";
    bold_elt.appendChild(document.createTextNode(asset_class));
    title_p.appendChild(bold_elt);
    //let strong_class = ;
    //strong_class.classList = "boldText";
    title_p.appendChild(document.createTextNode(title));
    titlediv.appendChild(title_p);
    chart_div.appendChild(titlediv);
    
    this.svg_total = this.container
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
    ;
    
    this.svg_total
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;
    
    this.svg = this.svg_total.append("g")
      .attr("transform", "translate(" + (this.pie_center) + "," + this.height / 2 + ")")
    ;

    this.color = d3.scaleOrdinal(d3.schemeCategory10);
    
    const fillRange = (start, end) => {
      return Array(end - start + 1).fill().map((item, index) => start + index);
    };
    var greyscale = d3.scaleSequential(d3.interpolateGreys).domain([0, 30]);
    var greys15 = fillRange(5,20).map(d => greyscale(d));
    this.greys = d3.scaleOrdinal().range(greys15);

    this.arc = d3.arc()
      .innerRadius(this.radius * this.hole_percent)
      .outerRadius(this.radius)
      .cornerRadius(5)
    ;

    this.tooltip = this.container
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;

    this.update(data,{comment:comment,numbers_long:numbers_long},comment_position);
  };

  update(data,labels_plot,comment_position) {
    this.data = data;
    var chart = this;

    this.total_value = d3.sum(chart.data, d => d.value);
    var total_exploded_value = d3.sum(chart.data, d => d.exploded ? d.value : 0);
    var percent_exploded = total_exploded_value / this.total_value;
    var anglepush = (Math.PI * 2) * (percent_exploded / 2);
    var chart_startAngle = (Math.PI * 0.5) - anglepush;

    this.pie = d3.pie()
      .startAngle(chart_startAngle)
      .endAngle((Math.PI * 2) + chart_startAngle)
      .sort((a,b) => a.exploded < b.exploded ? 1 : -1)
      .value(d => d.value)
    ;

    var data_ready = this.pie(chart.data);
    data_ready.forEach(d => d.midAngle = d3.mean([d.startAngle, d.endAngle]));
    data_ready.forEach(d => d.midAngle += d.midAngle <= Math.PI * 0.5 ? (Math.PI * 2) : 0);
    data_ready.forEach(d => d.rightHalf = Math.sin(d.midAngle) > 0);
    data_ready.forEach(d => d.topHalf = Math.cos(d.midAngle) > 0);
    data_ready.forEach(d => d.quadrant = (d.topHalf ? "N" : "S") + (d.rightHalf ? "E" : "W"));
    data_ready.forEach(d => d.ascending = Math.sin(d.midAngle) > 0 == Math.cos(d.midAngle) > 0 ? -1 : 1);
    data_ready.forEach(d => d.texty = Math.round(point_coord(d.midAngle, chart.radius)[1]));
    data_ready.forEach(d => 
      d.textx = 
        d.rightHalf ? 
          Math.round(point_coord(d.midAngle, chart.radius)[0]) + chart.text_right_offset : 
          Math.round(point_coord(d.midAngle, chart.radius)[0]) - chart.text_left_offset
      ) ;

    data_ready.sort((a,b) => a.quadrant > b.quadrant ? 1 : -1)
    
    data_ready.sort(function(a, b) {
      if (a.quadrant == b.quadrant) {
        if (a.midAngle > b.midAngle) return 1 * a.ascending;
      }
      return 0;
    })

    data_ready.forEach(function(d){
      var point = point_coord(d.midAngle, chart.radius);
      var offset = Math.abs(d.texty - point[1]);
      d.elbowx = 
        d.rightHalf ? 
          d.textx - (chart.text_right_offset * numberSign(d.textx)) : 
          d.textx - (chart.text_left_offset * numberSign(d.textx));
    });
    data_ready.forEach(d => d.elbowy = d.texty);
    
    data_ready.sort((a,b) => a.startAngle > b.startAngle ? 1 : -1);

    function numberSign(number) {
      return number < 0 ? -1 : 1; 
    };

    function point_coord(angle, radius) {
      return [radius * Math.sin(angle), radius * Math.cos(angle) * -1];
    }
    
    function prcnt_format(num) {
      if (num < 0.001) {
        return "< 0.1%";
      } else {
        return d3.format(".2p")(num);
      }
    }
    
    function num_format(num) {
      return d3.format(".2s")(num)
        .replace(/M/,labels_plot.numbers_long.M)
        .replace(/G/,labels_plot.numbers_long.G)
        .replace(/T/,labels_plot.numbers_long.T) +
        " " + chart.unit
      ;
    }

    data_ready = data_ready.sort(d => d.data.exploded);
    
    var slices = chart.svg
      .selectAll("g")
      .data(data_ready)
      .enter()
      .append("g")
      .attr("transform", d => d.data.exploded ? "translate(" + chart.exploded_offset + " 0)" : "translate(0 0)")
    ;

    slices
      .append("path")
      .attr("class", d => d.data.exploded ? d.data.key : "non-PACTA")
      .attr("d", chart.arc)
      .attr("fill", d => d.data.exploded ? chart.color(d.data.key) : chart.greys(d.data.key))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 1)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout)
    ;

    var slicelabels = slices.filter(d => d.data.exploded);
    var linesLabels = slicelabels
      .append("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", d => [point_coord(d.midAngle, chart.radius), [d.elbowx, d.elbowy], [d.textx - (2 * numberSign(d.textx)), d.texty]])
    ;

    var textLabels = slicelabels.append("text")
      .attr("x", function(d, i) {return d.textx})
      .attr("y", function(d, i) {return d.texty})
      .attr("text-anchor", function(d, i) {
            return d.rightHalf ? "start" : "end";
          })
      .text(d => d.data.key_translation + " " + prcnt_format(d.data.value / chart.total_value))
      .style("dominant-baseline", "middle")
    ;

    const alpha = 0.5;

    function relaxLabels() {
      let again, thisLabel, thisLabelDoc, y1, thatLabel, thatLabelDoc, y2, deltaY, sign, adjustment,
        labelForLine;

      again = false;
      textLabels.each(function(d, i) {
        thisLabel = this;
        thisLabelDoc = d3.select(thisLabel);
        y1 = thisLabelDoc.attr("y");
        textLabels.each(function(d, i) {
          thatLabel = this;
          if (thisLabel == thatLabel) 
            return;

          thatLabelDoc = d3.select(thatLabel);
          if (thisLabelDoc.attr("text-anchor") != thatLabelDoc.attr("text-anchor"))
            return;

          y2 = thatLabelDoc.attr("y");
          deltaY = y1 - y2;
          if (Math.abs(deltaY) > chart.minLabelSpacing) 
            return;

          again = true;
          sign = deltaY > 0 ? 1 : -1;
          adjustment = sign * alpha;
          thisLabelDoc.attr("y",+y1 + adjustment);
          thatLabelDoc.attr("y",+y2 - adjustment);
        })
      });

      if (again) {
        linesLabels.attr("points", function(d, i) {
          labelForLine = d3.select(textLabels.nodes()[i]);
          return [point_coord(d.midAngle, chart.radius), [d.elbowx, labelForLine.attr("y")], [d.textx - (2 * numberSign(d.textx)), labelForLine.attr("y")]];
        })
        setTimeout(relaxLabels, 20);
      }
    }

    relaxLabels();

    let comment_height = Math.max(4 * chart.height / 5, d3.max(data_ready,d => (d.textx > 0) ? d.texty : 0) + chart.height/2 + 30);

    chart.svg_total.append("text")
      .attr("transform", "translate(" + [chart.width - comment_position, comment_height] + ")")
      .text(prcnt_format(total_exploded_value / chart.total_value) + labels_plot.comment[0])
      .style("dominant-baseline", "middle")
      .style("font-weight","bold")
      .style("text-anchor", "start")
      
    chart.svg_total.append("text")
      .attr("transform", "translate(" + [chart.width - comment_position, comment_height+20] + ")")
      .text(labels_plot.comment[1])
      .style("dominant-baseline", "middle")
      .style("font-weight","bold")
      .style("text-anchor", "start")
    ;

    function mouseover(d) {
      chart.tooltip
        .html(d.data.key_translation + "<br>" +
              num_format(d.data.value) + 
              " (" + prcnt_format(d.data.value / chart.total_value) + ")"
              )
        .style("display", "inline-block")
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
      ;
    }

    function mousemove() {
      chart.tooltip
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
      ;
    }

    function mouseout() {
      chart.tooltip.style("display", "none");
    }
  }
}
