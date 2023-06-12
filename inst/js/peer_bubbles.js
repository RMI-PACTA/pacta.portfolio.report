class peer_bubbles {

  constructor(container, data, labels, opts) {
    if (typeof container === "string") {
      this.container_div = document.querySelector(container);
    } else {
      this.container_div = container;
    }
    
    d3.select(this.container_div).attr("chart_type", "peer_bubbles");
    d3.select(this.container_div).attr("chart_type_data_download", "peer_bubbles"); //matching the names in the export/ folder
    
    this.container_div.classList.add("BubbleChart");
    this.container_div.classList.add("d3chart");
    this.container_div.classList.add("portfoliobubble_chart");
    this.container_div.classList.add("chart_container");
    
    let container_div_width = parseInt(window.getComputedStyle(this.container_div, null).width);
    
    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    this.container_div.insertBefore(chart_div, this.container_div.firstChild);
    
    this.container = d3.select(chart_div);
    
    opts = (typeof opts === 'undefined') ? {} : opts;

    this.namevar = (typeof opts.namevar === "undefined") ? "portfolio_name" : opts.namevar;
    this.xvar = (typeof opts.xvar === "undefined") ? "plan_tech_share" : opts.xvar;
    this.yvar = (typeof opts.yvar === "undefined") ? "y" : opts.yvar;
    this.zvar = opts.zvar;
    this.bkg_fill = (typeof opts.bkg_fill === "undefined") ? true : opts.bkg_fill;
    this.xintcpt = (typeof opts.xintcpt === "undefined") ? false : opts.xintcpt;
    this.yintcpt = (typeof opts.yintcpt === "undefined") ? false : opts.yintcpt;
    this.xticksfrmt = (typeof opts.xticksfrmt === "undefined") ? ".0%" : opts.xticksfrmt;
    this.yticksfrmt = (typeof opts.yticksfrmt === "undefined") ? ".0%" : opts.yticksfrmt;
    this.bblfill = (typeof opts.bblfill === "undefined") ? "#8597a6" : opts.bblfill;
    this.bblstroke = (typeof opts.bblstroke === "undefined") ? "#8597a6" : opts.bblstroke;
    this.filter = (typeof opts.filter === "undefined") ? "ald_sector_translation" : opts.filter;
    this.chrtwidth = (typeof opts.chrtwidth === "undefined") ? 580 : opts.chrtwidth;
    this.chrtheight = (typeof opts.chrtheight === "undefined") ? 580 : opts.chrtheight;
    this.chrttitle = (typeof opts.chrttitle === "undefined") ? "" : opts.chrttitle;
    this.hghlt_varname = (typeof opts.hghlt_varname === "undefined") ? "this_portfolio" : opts.hghlt_varname;
    this.hghlt_color = (typeof opts.hghlt_color === "undefined") ? "#1b324f" : opts.hghlt_color;
    this.xmaxfixed = (typeof opts.xmaxfixed === "undefined") ? false : opts.xmaxfixed;
    this.ymaxfixed = (typeof opts.ymaxfixed === "undefined") ? true : opts.ymaxfixed;
    this.xymaxfixed = (typeof opts.xymaxfixed === "undefined") ? false : opts.xymaxfixed;
    this.subtitlesuffix = (typeof opts.subtitlesuffix === "undefined") ? "" : opts.subtitlesuffix;
    this.asset_class = (typeof opts.asset_class === "undefined") ? "" : opts.asset_class;
    this.company = (typeof opts.company === "undefined") ? false : opts.company;
    this.year_span = (typeof opts.year_span === "undefined") ? 5 : opts.year_span;
    let default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    let default_sector = (typeof opts.default_sector === 'undefined') ? "" : opts.default_sector;
    let axis_color = (typeof opts.axis_color === 'undefined') ? "" : opts.axis_color;

    // set labels
    labels = (typeof labels === 'undefined') ? {} : labels;

    this.xtitle = (typeof labels.xtitle === "undefined") ? "Current share of low-carbon technologies" : labels.xtitle;
    this.ytitle = (typeof labels.ytitle === "undefined") ? "% of required build-out" : labels.ytitle;
    this.xsubtitle = (typeof labels.xsubtitle === "undefined") ? "(as % of sector production capacity)" : labels.xsubtitle;
    this.ysubtitle = (typeof labels.ysubtitle === "undefined") ? "(as ratio of the B2DS scenario build-out)" : labels.ysubtitle;
    this.xtooltip = (typeof labels.xtooltip === "undefined") ? this.xtitle : labels.xtooltip;
    this.ytooltip = (typeof labels.ytooltip === "undefined") ? this.ytitle : labels.ytooltip;
    this.ztooltip = (typeof labels.ztooltip === "undefined") ? "" : labels.ztooltip;
    const title_what = (typeof labels.title_what === "undefined") ? ": Current low-carbon share and future scenario compatibility of " : labels.title_what,
    title_with_whom = (typeof labels.title_with_whom === "undefined") ? "compared to: " : labels.title_with_whom,
    port_label = (typeof labels.port_label === "undefined") ? "This portfolio" : labels.port_label,
    comp_label = (typeof labels.comp_label === "undefined") ? "Benchmark" : labels.comp_label,
    all_label = (typeof labels.all_label === "undefined") ? "All participants" : labels.all_label;
    this.footnote = (typeof labels.footnote === "undefined") ? "* Scenario: " : labels.footnote;

    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "peerbubbles_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", update);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';
    
    // sector selector
    let sector_names = d3.map(data, d => d.ald_sector_translation).keys().sort();
    sector_names.sort(d => d === "Total" ? -1 : 1);
    let sector_selector = document.createElement("select");
    sector_selector.classList = "peerbubbles_sector_selector inline_text_dropdown";
    sector_selector.addEventListener("change", update);
    sector_names.forEach(sector_name => sector_selector.add(new Option(sector_name, sector_name)));
    sector_selector.options[Math.max(sector_names.indexOf(default_sector), 0)].selected = 'selected';
    
    // peer group selector
    let this_peer_group = d3.map(data.filter(d => d.this_portfolio), d => d.peer_group_translation).keys()[0];
    let peer_options = [all_label, this_peer_group];
    let peer_selector = document.createElement("select");
    peer_selector.classList = "peerbubbles_peer_selector inline_text_dropdown";
    peer_selector.addEventListener("change", update);
    peer_options.forEach(peer_option => peer_selector.add(new Option(peer_option, peer_option)));
    peer_selector.options[0].selected = 'selected';
    
    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = this.chrtwidth + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(sector_selector);
    titlediv.appendChild(document.createTextNode(title_with_whom));
    titlediv.appendChild(peer_selector);
    titlediv.appendChild(document.createTextNode("."))
    chart_div.appendChild(titlediv);
    
    // set the width of the chart container div
    chart_div.style.width = this.chrtwidth + "px";
    
    this.selector = sector_selector;

    this.margin = {top: 90, right: 150, bottom: 110, left: 80};
    // make sure that we draw a square
    let size = Math.min(this.chrtwidth - this.margin.left - this.margin.right, this.chrtheight - this.margin.top - this.margin.bottom); 
    this.width = size;
    this.height = size;

    let fixed_circle_size = 4;
    
    this.svg = this.container
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
    ;
    
    this.svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
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

    this.svg.append("defs")
      .append("linearGradient")
      .attr("id", "linear-gradient")
      .attr("gradientTransform", "rotate(-45,0.5,0.5)")
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#d62728"},
        {offset: "50%", color: "#ffffcc"},
        {offset: "100%", color: "#2ca02c"}
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)
    ;
    
    let legend = this.container.select("svg").append("g").attr("class", "legend");
    
    legend.append("circle")
      .style("opacity", "0.7")
      .attr("cx", this.chrtwidth - this.margin.right + 10)
      .attr("cy", this.margin.top + 20)
      .attr("r", fixed_circle_size)
      .style("fill", this.hghlt_color)
      .attr("stroke", this.hghlt_color)
    ;
    
    legend.append("circle")
      .style("opacity", "0.7")
      .attr("cx", this.chrtwidth - this.margin.right + 10)
      .attr("cy", this.margin.top + 40)
      .attr("r", fixed_circle_size)
      .style("fill", this.bblfill)
      .attr("stroke", this.bblstroke)
    ;
    
    legend.append("text")
      .attr("x", this.chrtwidth - this.margin.right + 20)
      .attr("y", this.margin.top + 20)
      .attr("alignment-baseline", "middle")
      .text(port_label)
    ;
    
    legend.append("text")
      .attr("x", this.chrtwidth - this.margin.right + 20)
      .attr("y", this.margin.top + 40)
      .attr("alignment-baseline", "middle")
      .text(comp_label)
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
      .style("stroke", this.bkg_fill ? "none" : "black")
      .style("opacity", "0.6")
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
      subdata = subdata.sort((a,b) => a.this_portfolio ? 1 : -1);
      
      if (peer_selector.value != all_label) {
        subdata = subdata.filter(d => d.peer_group_translation == peer_selector.value);
      }
      
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
        chart.y.domain([0 - buffer, (chart.ymaxfixed ? 1 : ymax) + buffer]).nice();
      }
      
      ymax = d3.max([1, d3.min([ymax, 1.2])]);
      chart.x.domain([0 - buffer, 1 + buffer]).nice();
      chart.y.domain([0 - buffer, ymax + buffer]).nice();
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
  
      let bubbles = chart.svg.selectAll(".bubble").data(subdata);
      
      bubbles
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .style("opacity", "0.0")
        .attr("cx", d => chart.x(d[chart.xvar]))
        .attr("cy", d => chart.y(d[chart.yvar]))
        .attr("r", d => (typeof chart.zvar === "undefined") ? fixed_circle_size : chart.z(d[chart.zvar]))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .merge(bubbles)
        .transition()
        .attr("cx", d => chart.x(d[chart.xvar]))
        .attr("cy", d => chart.y(d[chart.yvar]))
        .attr("r", d => (typeof chart.zvar === "undefined") ? fixed_circle_size : chart.z(d[chart.zvar]))
        .style("opacity", "0.7")
        .style("fill", d => d[chart.hghlt_varname] ? chart.hghlt_color : chart.bblfill)
        .attr("stroke", d => d[chart.hghlt_varname] ? chart.hghlt_color : chart.bblstroke)
      ;
      
      bubbles
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
      ;
      
      bubbles.exit().remove();
      
      function mouseover(d) {
        let ztooltiptext = chart.ztooltip != "" ? "<br>" + chart.ztooltip + ": " + d3.format(".1%")(d[chart.zvar]) : "";
        
        chart.tooltip
          .html((d[chart.namevar] == "" ? "" : "<b>" + d[chart.namevar] + "</b><br><br>") +
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
