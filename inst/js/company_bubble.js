class company_bubble {

  constructor(container, data, labels, opts) {
    if (typeof container === "string") {
      this.container_div = document.querySelector(container);
    } else {
      this.container_div = container;
    }
    
    d3.select(this.container_div).attr("chart_type", "company_bubble");
    d3.select(this.container_div).attr("chart_type_data_download", "company_bubble"); //matching the names in the export/ folder
    
    this.container_div.classList.add("BubbleChart");
    this.container_div.classList.add("d3chart");
    this.container_div.classList.add("companybubble_chart");
    this.container_div.classList.add("chart_container");
    
    let container_div_width = parseInt(window.getComputedStyle(this.container_div, null).width);
    
    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    this.container_div.insertBefore(chart_div, this.container_div.firstChild);
    
    this.container = d3.select(chart_div);
    
    opts = (typeof opts === 'undefined') ? {} : opts;
      
    this.namevar = (typeof opts.namevar === "undefined") ? "company_name" : opts.namevar;
    this.xvar = (typeof opts.xvar === "undefined") ? "plan_tech_share" : opts.xvar;
    this.yvar = (typeof opts.yvar === "undefined") ? "y" : opts.yvar;
    this.zvar = (typeof opts.zvar === "undefined") ? "plan_carsten" : opts.zvar;
    this.bkg_fill = (typeof opts.bkg_fill === "undefined") ? true : opts.bkg_fill;
    this.xintcpt = (typeof opts.xintcpt === "undefined") ? true : opts.xintcpt;
    this.yintcpt = (typeof opts.yintcpt === "undefined") ? true : opts.yintcpt;
    this.xticksfrmt = (typeof opts.xticksfrmt === "undefined") ? ".0%" : opts.xticksfrmt;
    this.yticksfrmt = (typeof opts.yticksfrmt === "undefined") ? ".0%" : opts.yticksfrmt;
    this.bblfill = (typeof opts.bblfill === "undefined") ? "#8597a6" : opts.bblfill;
    this.bblstroke = (typeof opts.bblstroke === "undefined") ? "#1b324f" : opts.bblstroke;
    this.filter = (typeof opts.filter === "undefined") ? "ald_sector_translation" : opts.filter;
    this.chrtwidth = (typeof opts.chrtwidth === "undefined") ? 580 : opts.chrtwidth;
    this.chrtheight = (typeof opts.chrtheight === "undefined") ? 580 : opts.chrtheight;
    this.chrttitle = (typeof opts.chrttitle === "undefined") ? "" : opts.chrttitle;
    this.hghlt_varname = (typeof opts.hghlt_varname === "undefined") ? null : opts.hghlt_varname;
    this.hghlt_color = (typeof opts.hghlt_color === "undefined") ? "#1b324f" : opts.hghlt_color;
    this.xmaxfixed = (typeof opts.xmaxfixed === "undefined") ? false : opts.xmaxfixed;
    this.ymaxfixed = (typeof opts.ymaxfixed === "undefined") ? false : opts.ymaxfixed;
    this.xymaxfixed = (typeof opts.xymaxfixed === "undefined") ? false : opts.xymaxfixed;
    this.subtitlesuffix = (typeof opts.subtitlesuffix === "undefined") ? "" : opts.subtitlesuffix;
    this.asset_class = (typeof opts.asset_class === "undefined") ? "" : opts.asset_class;
    this.company = (typeof opts.company === "undefined") ? true : opts.company;
    this.year_span = (typeof opts.year_span === "undefined") ? 5 : opts.year_span;
    let default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    let default_sector = (typeof opts.default_sector === 'undefined') ? "" : opts.default_sector;
    let axis_color = (typeof opts.axis_color === 'undefined') ? "" : opts.axis_color;
    
    this.samesize = typeof this.zvar === "number";

    // set labels
    labels = (typeof labels === 'undefined') ? {} : labels;

    this.xtitle = (typeof labels.xtitle === "undefined") ? "Share of the Client capacity in low-carbon technologies" : labels.xtitle;
    this.ytitle = (typeof labels.ytitle === "undefined") ? "% of required build-out" : labels.ytitle;
    this.xsubtitle = (typeof labels.xsubtitle === "undefined") ? "(as % of sector production capacity)" : labels.xsubtitle;
    this.ysubtitle = (typeof labels.ysubtitle === "undefined") ? "(as ratio of the B2DS scenario build-out)" : labels.ysubtitle;
    this.xtooltip = (typeof labels.xtooltip === "undefined") ? this.xtitle : labels.xtooltip;
    this.ytooltip = (typeof labels.ytooltip === "undefined") ? this.ytitle : labels.ytooltip;
    this.ztooltip = (typeof labels.ztooltip === "undefined") ? "Weight in portfolio (% of AUM)" : labels.ztooltip;
    const title_what = (typeof labels.title_what === "undefined") ? ": Current low carbon technology share vs. future scenario compatibility of planned production of " : labels.title_what;
    const title_what_after = (typeof labels.title_what_after === "undefined") ? "companies in this portfolio." : labels.title_what_after;
    const legend_title = (typeof labels.legend_title === "undefined") ? " " : labels.legend_title;
    this.footnote = (typeof labels.footnote === "undefined") ? "* Scenario: " : labels.footnote;

    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "companybubble_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", update);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';
    
    // sector selector
    let sector_names = d3.map(data, d => d.ald_sector_translation).keys().sort();
    sector_names.sort(d => d === "Total" ? -1 : 1);
    let sector_selector = document.createElement("select");
    sector_selector.classList = "companybubble_group_selector inline_text_dropdown";
    sector_selector.addEventListener("change", update);
    sector_names.forEach(sector_name => sector_selector.add(new Option(sector_name, sector_name)));
    sector_selector.options[Math.max(sector_names.indexOf(default_sector), 0)].selected = 'selected';
    
    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = this.chrtwidth + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(sector_selector);
    titlediv.appendChild(document.createTextNode(title_what_after));
    chart_div.appendChild(titlediv);
    
    // set the width of the chart container div
    chart_div.style.width = this.chrtwidth + "px";
    
    this.selector = sector_selector;

    this.margin = {top: 90, right: 150, bottom: 110, left: 80};
    let size = Math.min(this.chrtwidth - this.margin.left - this.margin.right, this.chrtheight - this.margin.top - this.margin.bottom)
    this.width = size;
    this.height = size;
    
    this.svg = this.container
      .append("svg")
      .attr("width", this.chrtwidth)
      .attr("height", this.chrtheight)
    ;
    
    this.svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;
    
    let legend = this.svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (this.width + this.margin.left) + "," + this.margin.top + ")")
    ;
    
    this.svg = this.svg.append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    ;

    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]).clamp(true);
    this.z = d3.scaleLinear().range([1, 20]);

    this.tooltip = this.container
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
      ;

    let gradient = this.svg.append("defs")
      .append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("gradientTransform", "rotate(-45,0.5,0.5)")
    ;
    
    gradient.append("stop")
      .attr('class', 'start')
      .attr("offset", "0%")
      .attr("stop-color", "#d62728")
      .attr("stop-opacity", 1)
    ;
    
    gradient.append("stop")
      .attr('class', 'middle')
      .attr("offset", "50%")
      .attr("stop-color", "#ffffcc")
      .attr("stop-opacity", 1)
    ;
    
    gradient.append("stop")
      .attr('class', 'end')
      .attr("offset", "100%")
      .attr("stop-color", "#2ca02c")
      .attr("stop-opacity", 1)
    ;
    
    this.container.select("svg")
      .append("text")
      .attr("class", "chrttitle")
      .attr("transform", "translate(" + (this.chrtwidth/2) + " ," + 0 + ")")
      .attr("dominant-baseline", "hanging")
      .style("text-anchor", "middle")
      .style("font-size", "1.3em")
    ;
    
    this.container.select("svg")
      .append("text")
      .attr("class", "subtitle")
      .attr("transform", "translate(" + (this.chrtwidth/2) + " ," + 16 + ")")
      .attr("dominant-baseline", "hanging")
      .style("text-anchor", "middle")
      .style("font-size", "1.3em")
    ;

    this.svg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", this.width)
      .attr("height", this.height)
      .style("fill", this.bkg_fill ? "url('#linear-gradient')" : "white")
      .style("stroke-width", "1px")
      .style("stroke", this.bkg_fill ? "none" : axis_color)
    ;

    this.svg.append("line")
      .attr("x1", this.x(0.5))
      .attr("x2", this.x(0.5))
      .attr("y1", this.y(0))
      .attr("y2", this.y(1))
      .attr("stroke", this.xintcpt ? "black" : "none")
      .attr("stroke-dasharray", "1, 2")
    ;

    this.svg.append("line")
      .attr("x1", this.x(0))
      .attr("x2", this.x(1))
      .attr("y1", this.y(0.5))
      .attr("y2", this.y(0.5))
      .attr("stroke", this.yintcpt ? "black" : "none")
      .attr("stroke-dasharray", "1, 2")
    ;

    this.svg.append("g")
      .attr("class", "xaxis")
      .style("stroke-width", "1px")
      .attr("transform", "translate(0," + this.height + ")")
    ;

    this.svg.append("text")
      .attr("class", "xtitle")
      .attr("transform", "translate(" + (this.width/2) + " ," +
                          (this.height + this.margin.top - 35) + ")")
      .style("text-anchor", "middle")
    ;
    this.svg.append("text")
      .attr("class", "xsubtitle")
      .attr("transform", "translate(" + (this.width/2) + " ," +
                          (this.height + this.margin.top - 20) + ")")
      .style("text-anchor", "middle")
    ;

    this.svg.append("g")
      .attr("class", "yaxis")
      .style("stroke-width", "1px")
    ;

    this.svg.append("text")
      .attr("class", "ytitle")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
    ;

    this.svg.append("text")
      .attr("class", "ysubtitle")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - this.margin.left + 15)
      .attr("x", 0 - (this.height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
    ;

    this.svg.append("text")
      .attr("class", "footnote")
      .attr("transform", "translate(" + (this.width + this.margin.left) + " ," + (this.height + this.margin.top + 10) + ")")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "0.7em")
      .style("text-anchor", "end");
    
    let chart = this;
    this.svg.append("g")
      .selectAll(".bubble")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .style("opacity", "0.7")
    ;

    this.data = data;
    update();
    
    function update() {
      let subdata;
      subdata = chart.data.filter(d => d[chart.filter] == sector_selector.value & d.asset_class_translation == class_selector.value);
      
      var year_future = subdata.map(d => d.year)[0] + chart.year_span;
      var scenario = subdata.map(d => d.scenario)[0];
      var buffer = 0.00;
      var xmax = d3.max(subdata, d => d[chart.xvar]);
      var ymax = d3.max(subdata, d => d[chart.yvar]);
      if (chart.xymaxfixed) {
        var chartmax = d3.max([xmax, ymax]);
        chart.x.domain([0 - buffer, chartmax + buffer]).nice();
        chart.y.domain([0 - buffer, chartmax + buffer]).nice();
      } else {
        chart.x.domain([0 - buffer, (chart.xmaxfixed ? 1 : xmax) + buffer]).nice();
        chart.y.domain([0 - buffer, (chart.ymaxfixed ? 1 : d3.max([1, d3.min([2, ymax])])) + buffer]).nice();
      }
      
      chart.x.domain([0 - buffer, 1 + buffer]).nice();
      chart.y.domain([0 - buffer, 1 + buffer]).nice();
      chart.z.domain(d3.extent(subdata, d => d[chart.zvar])).nice();
      
      chart.xaxis = d3.axisBottom(chart.x).ticks(6).tickFormat(d3.format(chart.xticksfrmt));
      chart.yaxis = d3.axisLeft(chart.y).ticks(6).tickFormat(d3.format(chart.yticksfrmt));
      
      chart.container.select(".chrttitle").text(chart.chrttitle).style("font-size", "1.2em");
      chart.container.select(".subtitle").text(chart.subtitlesuffix != "" ? chart.current_selection + chart.subtitlesuffix : "");
  
      chart.svg.select(".xaxis").transition().call(chart.xaxis)
      .selectAll(".domain").attr("stroke", axis_color);
      chart.svg.select(".xaxis").selectAll(".tick").selectAll("line").attr("stroke", axis_color);
      chart.svg.select(".xtitle").text(chart.xtitle);
      chart.svg.select(".xsubtitle").text(chart.xsubtitle);

      chart.svg.select(".yaxis").transition().call(chart.yaxis)
      .selectAll(".domain").attr("stroke", axis_color);
      chart.svg.select(".yaxis").selectAll(".tick").selectAll("line").attr("stroke", axis_color);
      chart.svg.select(".ytitle").text(chart.ytitle);
      chart.ysubtitle = chart.ysubtitle.replaceAll("YEAR", year_future);
      chart.svg.select(".ysubtitle").text(chart.ysubtitle);

      chart.svg.select(".footnote").text(chart.footnote + scenario + ".");
  
      chart.svg.selectAll(".bubble").remove();
      let bubbles = chart.svg.selectAll(".bubble").data(subdata);
      
      bubbles
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .style("opacity", "0.0")
        .attr("cx", d => chart.x(d[chart.xvar]))
        .attr("cy", d => chart.y(d[chart.yvar]))
        .attr("r", 0)
        .style("fill", d => d[chart.hghlt_varname] ? chart.hghlt_color : chart.bblfill)
        .attr("stroke", d => d[chart.hghlt_varname] ? chart.hghlt_color : chart.bblstroke)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .transition()
        .attr("r", d => chart.z(d[chart.zvar]))
        .style("opacity", "0.7")
      ;
      
      let ticks = chart.z.ticks(3);
      let tick_size = ticks.map(d => chart.z(d));
      let cumsum = d3.cumsum(tick_size.map(d => d * 2));
      let legend_data = d3.zip(ticks, cumsum);

      legend.selectAll("circle").remove();
      legend.selectAll("text").remove();
      
      legend.selectAll("circle")
        .data(legend_data)
        .enter()
        .append("circle")
        .attr("cx", 35)
        .attr("cy", d => 20 + d[1])
        .attr("r", d => chart.z(d[0]))
        .style("fill", chart.bblfill)
        .attr("stroke", chart.bblstroke)
        .style("opacity", "0.7")
      ;
      
      legend.selectAll("text")
        .data(legend_data)
        .enter()
        .append("text")
        .attr("x", 40 + chart.z.range()[1])
        .attr("y", d => 20 + d[1])
        .attr("alignment-baseline", "central")
        .text(d => d3.format("~%")(d[0].toPrecision(3)))
      ;

      legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("alignment-baseline", "central")
        .text(legend_title)
      ;
  
      function mouseover(d) {
        let ztooltiptext = chart.ztooltip != "" ? "<br>" + chart.ztooltip + ": " + d3.format("~%")(d[chart.zvar].toPrecision(3)) : "";
        
        chart.tooltip
          .html("<b>" + d[chart.namevar] + "</b><br><br>" +
                chart.xtooltip + ": " + d3.format(".1%")(d[chart.xvar]) + "<br>" +
                chart.ytooltip + ": " + d3.format(".1%")(d[chart.yvar]) + 
                ztooltiptext)
          .style("display", "inline-block")
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 20 + "px")
      }
  
      function mousemove() {
        chart.tooltip
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 20 + "px")
      }
  
      function mouseout() {
        chart.tooltip
          .style("display", "none")
      }
    }
  }
}
