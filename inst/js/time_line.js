class time_line {

  constructor(container, data, labels, opts) {
    let container_div;
    if (typeof container === "string") {
      container_div = document.querySelector(container);
    } else {
      container_div = container;
    }
    
    d3.select(container_div).attr("chart_type", "time_line");
    d3.select(container_div).attr("chart_type_data_download", "emissions"); //matching the names in the export/ folder
    
    container_div.classList.add("time_lineChart");
    container_div.classList.add("d3chart");
    container_div.classList.add("emissionstrajectory_chart");
    container_div.classList.add("chart_container");
    
    let container_div_width = parseInt(window.getComputedStyle(container_div, null).width);
    
    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);
    
    this.container = d3.select(chart_div);
    
    opts = (typeof opts === 'undefined') ? {} : opts;
    this.asset_class = (typeof opts.asset_class === "undefined") ? "" : opts.asset_class;
      
    this.xtitle = (typeof opts.xtitle === 'undefined') ? "" : opts.xtitle;
    //this.ytitle = (typeof opts.ytitle === 'undefined') ? "CO2 intensity" : opts.ytitle;
    let line_color = (typeof opts.line_color === 'undefined') ? "#1b324f" : opts.line_color;
    this.dot_color = (typeof opts.dot_color === 'undefined') ? this.line_color : opts.dot_color;
    let scen_line_color = (typeof opts.scen_line_color === 'undefined') ? "#00c082" : opts.scen_line_color;
    //this.scenario = (typeof opts.scenario === 'undefined') ? "B2DS" : opts.scenario;
    let default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    let default_sector = (typeof opts.default_sector === 'undefined') ? "Aviation" : opts.default_sector;

    //set labels
    labels = (typeof labels === 'undefined') ? {} : labels;

    const title_what = (typeof labels.title_what === 'undefined') ? " : 5-year emission intensity trend of " : labels.title_what,
    caption_alloc = (typeof labels.caption_alloc === 'undefined') ? "Allocation method: " : labels.caption_alloc,
    caption_market = (typeof labels.caption_market === 'undefined') ? "Equity market: " : labels.caption_market,
    scen_label = (typeof labels.scen_label === 'undefined') ? "Scenario" : labels.scen_label,
    port_label = (typeof labels.port_label === 'undefined') ? "Portfolio" : labels.port_label,
    hoverover_value = (typeof labels.hoverover_value === 'undefined') ? "Value: " : labels.hoverover_value,
    footnote = (typeof labels.footnote === 'undefined') ? "* start date of the analysis" : labels.footnote;

    
    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "peercomparison_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", change_class);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';
    
    // sector selector
    let sector_names = d3.map(data, d => d.sector_translation).keys().sort();
    let sector_selector = document.createElement("select");
    sector_selector.classList = "peercomparison_group_selector inline_text_dropdown";
    sector_selector.addEventListener("change", change_class);
    sector_names.forEach(sector_name => sector_selector.add(new Option(sector_name, sector_name)));
    
    let disabled = sector_names.map(sector => data.filter(d => d.sector_translation == sector).map(d => d.disabled)[0]);
    disabled.map((d,i) => sector_selector.options[i].disabled = d);
    sector_selector.options[Math.max(sector_names.indexOf(default_sector), 0)].selected = 'selected';
    
    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = container_div_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(sector_selector);
    chart_div.appendChild(titlediv);

    // allocation selector
    let allocation_selector = document.createElement("select");
    allocation_selector.classList = "time_line_allocation_selector inline_text_dropdown";
    allocation_selector.addEventListener("change", change_class);

    // market selector
    let market_selector = document.createElement("select");
    market_selector.classList = "time_line_market_selector inline_text_dropdown";
    market_selector.addEventListener("change", change_class);
    
    // create bottom filters
    let filtersdiv = document.createElement("div");
    filtersdiv.style.width = this.ttl_width + "px";
    filtersdiv.classList = "chart_filters";
    filtersdiv.appendChild(document.createTextNode(caption_alloc));
    filtersdiv.appendChild(allocation_selector);
    filtersdiv.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
    filtersdiv.appendChild(document.createTextNode(caption_market));
    filtersdiv.appendChild(market_selector);
    chart_div.appendChild(filtersdiv);
    
    
    this.ttl_width = 750;
    this.ttl_height = 450;
    this.margin = {top: 70, right: 190, bottom: 70, left: 80};
    this.width = this.ttl_width - this.margin.left - this.margin.right;
    this.height = this.ttl_height - this.margin.top - this.margin.bottom;
    
    const parseYear = d3.timeParse("%Y");
    
    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    
    const line = d3.line()
      .x(d => this.x(parseYear(d.year)))
      .y(d => this.y(d.value))
    ;
    
    let entries = d3.nest().key(d => d.name);
    
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

    this.tooltip = this.container
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;
    
    this.svg.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + this.height + ")")
    ;
    
    this.svg.append("g").attr("class", "yaxis");
    
    this.svg.append("text")
      .attr("class", "xtitle")
      .attr("transform", "translate(" + (this.width/2) + " ," +
                          (this.height + this.margin.top + 70) + ")")
      .style("text-anchor", "middle")
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

    let footnote_group = this.svg.append("g")
      .attr("class", "footnote")
      .attr("transform", "translate(" + (this.width + this.margin.left) + "," + (this.height + this.margin.bottom / 2)+ ")");

    let legend_group = this.svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (this.width + 10) + "," + (50 + this.margin.top) + ")");

    let chart = this;
    sector_selector.dispatchEvent(new Event('change'));
    
    
    function mouseover(d) {
      chart.tooltip
        .html((d.plan == "plan" ? port_label : scen_label) + "<br>" + hoverover_value + d3.format(".5f")(d.value) + ' ' +d.unit_translation)
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
      chart.tooltip.style("display", "none")
    }
    
    function change_class() {
      let selected_class = class_selector.value;
      let selected_sector = sector_selector.value;
      
      let selected_allocation = (typeof allocation_selector.value === "undefined") ? 'portfolio_weight' : allocation_selector.value;
      let selected_market = (typeof market_selector.value === "undefined") ? 'Global' : market_selector.value;
      
      let subdata = data.filter(d => d.asset_class_translation == selected_class);
         
      // reset the allocation selector for the selected asset class
      allocation_selector.length = 0;

      let allocation_names = d3.map(subdata, d => d.allocation_translation).keys();
      allocation_names.forEach(allocation_name => allocation_selector.add(new Option(allocation_name, allocation_name)));
      allocation_selector.options[Math.max(0, allocation_names.indexOf(selected_allocation))].selected = 'selected';
      resize_inline_text_dropdown(null, allocation_selector);
      
      subdata = subdata.filter(d => d.allocation_translation == allocation_selector.value);
      
      // reset the sector selector
      sector_selector.length = 0;
      
      let sector_names = d3.map(subdata, d => d.sector_translation).keys().sort();
      sector_names.forEach(sector_name => sector_selector.add(new Option(sector_name, sector_name)));
      let disabled = sector_names.map(sector => data.filter(d => d.sector_translation == sector).map(d => d.disabled)[0]);
      disabled.map((d,i) => sector_selector.options[i].disabled = d);
      sector_selector.options[Math.max(sector_names.indexOf(selected_sector), disabled.indexOf(false))].selected = 'selected';
      resize_inline_text_dropdown(null, sector_selector);
      
      subdata = subdata.filter(d => d.sector_translation == sector_selector.value);
      
      // reset the market selector for the selected asset class
      market_selector.length = 0;

      let market_names = d3.map(subdata, d => d.equity_market_translation).keys();
      market_names.forEach(market_name => market_selector.add(new Option(market_name, market_name)));
      market_selector.options[Math.max(0, market_names.indexOf(selected_market))].selected = 'selected';
      resize_inline_text_dropdown(null, market_selector);
      
      update();
    }
    
    function update() {
      let subset = data.filter(d => d.asset_class_translation == class_selector.value);
      subset = subset.filter(d => d.sector_translation == sector_selector.value);
      subset = subset.filter(d => d.allocation_translation == allocation_selector.value);
      subset = subset.filter(d => d.equity_market_translation == market_selector.value);
      
      let linedata = entries.entries(subset);
      chart.x.domain(d3.extent(subset, d => parseYear(d.year)));
      chart.y.domain(d3.extent(subset, d => d.value)).nice();
      
      let lines_select = chart.svg.selectAll(".line").data(linedata);
      lines_select.exit().remove();
      lines_select.enter()
        .append("path")
        .attr("class", "line")
        .style("fill", "none")
        .style("stroke", d => d.values[0].plan == "plan" ? line_color : scen_line_color)
        .style("stroke-width", "2px")
        .attr("id", d => d.key)
        .attr("d", d => line(d.values))
      ;
      lines_select.transition()
        .attr("id", d => d.key)
        .attr("d", d => line(d.values))
      ;
      
      let dots_select = chart.svg.selectAll(".dot").data(subset);
      dots_select.exit().remove();
      dots_select.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .style("stroke", "#fff")
        .style("fill", d => d.plan == "plan" ? line_color : scen_line_color)
        .attr("name", d => d.key)
        .attr("x_value", d => d.year)
        .attr("y_value", d => d.value)
        .attr("cx", d => chart.x(parseYear(d.year)))
        .attr("cy", d => chart.y(d.value))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
      ;
      dots_select.transition()
        .attr("name", d => d.key)
        .attr("x_value", d => d.year)
        .attr("y_value", d => d.value)
        .attr("cx", d => chart.x(parseYear(d.year)))
        .attr("cy", d => chart.y(d.value))
      ;
      
      //axes
      const num_of_years = 1 + Math.abs(chart.x.domain().reduce((a,b) => a.getFullYear() - b.getFullYear()));
      let tick_labels = d3.map(subset, d => d.year).keys().slice(0, Math.min(num_of_years, 5) + 1)
      tick_labels[0] = "31-Dec-" + tick_labels[0] + "*"

      chart.svg.select(".xaxis").transition().call(d3.axisBottom(chart.x)
        .ticks(Math.min(num_of_years, 5))
        .tickFormat((d,i) => tick_labels[i])
        );
      chart.svg.select(".yaxis").transition().call(d3.axisLeft(chart.y).ticks(6).tickFormat(d3.format(".3s")));
      
      chart.svg.select(".xtitle").text(chart.xtitle);
      chart.svg.select(".ytitle").text(sector_selector.value);
      chart.svg.select(".ysubtitle").text(subset.map(d => d.unit_translation)[0]);

      let legend_data = [port_label, (subset.map(d => d.scenario)[0] + " " + scen_label)]

      legend_group.selectAll("*").remove();

      let legend = legend_group.selectAll(null)
      .data(legend_data)

      legend.enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", 30)
      .attr("y1", d => (d == port_label) ? 0 : 20)
      .attr("y2", d => (d == port_label) ? 0 : 20)
      .style("stroke-width", 2)
      .style("stroke", d => (d == port_label) ? line_color : scen_line_color)

      legend.enter()
      .append("circle")
      .attr("r", 5)
      .attr("cx", 15)
      .attr("cy", d => (d == port_label) ? 0 : 20)
      .style("stroke", "#fff")
      .style("fill", d => (d == port_label) ? line_color : scen_line_color)

      legend.enter()
      .append("text")
      .attr("x", 35)
      .attr("y", d => (d == port_label) ? 0 : 20)
      .text(d => d)
      .style("font-size", "15px")
      .attr("alignment-baseline","middle")
      .style("fill", d => (d == port_label) ?  line_color : scen_line_color)

      footnote_group
        .selectAll(null)
        .data([footnote])
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "end")
        .style("alignment-baseline", "central")
        .style("font-size", "0.7em")
        .text(d => d);
    }
  }
}
