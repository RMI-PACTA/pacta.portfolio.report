class exposure {

  constructor(container, data_both, opts) {
    const container_div = document.querySelector(container);

    container_div.classList.add("stacked_bars");
    container_div.classList.add("d3chart");
    container_div.classList.add("techexposure_chart");

    const container_div_width = parseInt(window.getComputedStyle(container_div, null).width);

    const chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);

    // set options
    opts = (typeof opts === 'undefined') ? {} : opts;
    const default_class = (typeof opts.default_class === 'undefined') ? "Listed Equity" : opts.default_class;
    const default_percent = (typeof opts.default_percent === 'undefined') ? "" : opts.default_percent;
    const default_benchmark = (typeof opts.default_benchmark === 'undefined') ? "" : opts.default_benchmark;
    
    // hack to choose bonds or equity
    let data = data_both.filter(d => d.asset_class == default_class)[0].data;

    // settings
    const ttl_width = 700;
    const margin = {top: 20, right: 20, bottom: 20, left: 20};

    const bar_width = 30;
    const bar_gap = 12;
    const sector_gap = 15;
    const portfolio_label_offset = 25;
    
    const port_label = "this portfolio";
    const comp_label = "comparison";
    
    // determine height based on number of sectors in portfolio
    let port_sectors = data.filter(d => d.this_portfolio == true)[0].data.map(d => d.ald_sector);
    let height = (port_sectors.length * (((bar_width + bar_gap) * 2) + sector_gap));
    
    // determine left margin based on portfolio name
    //const portfolio_name = data.filter(d => d.this_portfolio)[0].portfolio_name;
    const portfolio_name = port_label;
    let label_width = 0;
    let test_svg = d3.select(chart_div).append("svg")
    test_svg.append("text")
      .text(portfolio_name)
      .each(function() { label_width = this.getBBox().width; })
    ;
    test_svg.remove();
    margin.left += label_width + portfolio_label_offset;
    let width = ttl_width - margin.left - margin.right;

    // asset class selector
    let class_names = d3.map(data_both, d => d.asset_class).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "techexposure_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", update);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';
    
    // group selector
    let benchmark_names = data.filter(d => !d.this_portfolio).map(d => d.portfolio_name).sort();
    let benchmark_selector = document.createElement("select");
    benchmark_selector.classList = "techexposure_benchmark_selector inline_text_dropdown";
    benchmark_selector.addEventListener("change", update);
    benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
    benchmark_selector.options[Math.max(benchmark_names.indexOf(default_benchmark), 0)].selected = 'selected';

    // percent selector
    let percent_selector = document.createElement("select");
    percent_selector.classList = "techexposure_percent_selector inline_text_dropdown";
    percent_selector.addEventListener("change", update);
    percent_selector.add(new Option("as % of assets under management", 0));
    percent_selector.add(new Option("as % of sector", 1));
    percent_selector.options[0].selected = 'selected';

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = ttl_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(": Technology mix "));
    titlediv.appendChild(percent_selector);
    titlediv.appendChild(document.createElement("br"));
    titlediv.appendChild(document.createTextNode("compared to "));
    titlediv.appendChild(benchmark_selector);
    chart_div.appendChild(titlediv);

    let y = d3.scaleLinear().range([0, width]);
    
    function num_format(num) {
      num = Math.round( ( num + Number.EPSILON ) * 1000 ) / 10;
      if (num < 0.1) {
        return "< 0.1%"
      }
      return num + "%"      
    }

    const tooltip = d3.select(chart_div)
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;

    let svg = d3.select(chart_div)
      .append("svg")
      .attr("width", ttl_width)
      .attr("height", height + margin.top + margin.bottom)
    ;

    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;

    svg = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;

    let data_group = svg.append("g")
      .attr("class", "data")
    ;


    data = data_both.filter(d => d.asset_class == class_selector.value)[0].data;
    
    // reset selectors based on current asset class selection
    let selected_benchmark = benchmark_selector.value;
    benchmark_names = data.filter(d => !d.this_portfolio).map(d => d.portfolio_name).sort();
    benchmark_selector.length = 0;
    benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
    benchmark_selector.options[Math.max(benchmark_names.indexOf(selected_benchmark), 0)].selected = 'selected';
    
    
    let subdata = Array.from(data);
    // filter out unselected benchmarks
    subdata = subdata.filter(d => d.this_portfolio == true | d.portfolio_name == benchmark_selector.value);
    // filter out sectors from the benchmark that do not exist in the portfolio
    subdata.forEach(d => d.data = d.data.filter(f => port_sectors.includes(f.ald_sector)));

    let max_y = Math.max(...subdata.map(d => d.data.map(d => d.data.map(d => d.cumsum))).flat().flat());
    y.domain([0, (+percent_selector.value == 1 ? 1 : max_y)]).nice();

    let portfolios = data_group.selectAll(".portfolio")
      .data(subdata)
      .enter()
      .append("g")
      .attr("id", d => d.portfolio_name)
      .attr("class", "portfolio")
      .attr("transform", (d,i) => "translate(0," + (i * (bar_width + bar_gap)) + ")")
    ;

    let sectors = portfolios.selectAll(".sector")
      .data(d => {
        d.data.forEach(f => f["portfolio_name"] = d.portfolio_name);
        d.data.forEach(f => f["this_portfolio"] = d.this_portfolio);
        return d.data;
      })
      .enter()
      .append("g")
      .attr("id", d => d.ald_sector)
      .attr("class", d => "sector " + d.ald_sector)
      .attr("transform", (d,i) => "translate(0," + (i * (((bar_width + bar_gap) * 2) + sector_gap)) + ")")
    ;

    let portfolio_labels = sectors.append("text")
      .text(d => d.this_portfolio ? port_label : comp_label)
      .attr("class", "portfolio_label")
      .attr("transform", "translate(-" + portfolio_label_offset + "," + (bar_width / 2) + ")")
      .style("alignment-baseline", "central")
      .style("text-anchor", "end")
      .attr("fill", "black")
      .attr("font-size", "0.7em")
    ;

    let sector_labels = sectors.append("text")
      .text(d => d.this_portfolio ? d.ald_sector : "")
      .attr("class", "sector_label")
      .attr("transform", "translate(-5," + (bar_width + (bar_gap / 2)) + ") rotate(-90)")
      .style("alignment-baseline", "bottom")
      .style("text-anchor", "middle")
      .attr("fill", "black")
    ;

    let tech_groups = sectors.selectAll(".technology")
      .data(d => {
        d.data.forEach(f => f["ald_sector"] = d.ald_sector);
        return d.data;
      })
      .enter()
      .append("g")
      .attr("id", d => d.technology)
      .attr("class", "technology")
    ;

    let bars = tech_groups
      .append("rect")
      .attr("rx", 0)
      .attr("height", bar_width)
      .attr("class", "bar")
      .attr("id", d => d.technology)
      .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
      .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
      .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("mousemove", mousemove)
    ;
    window.tech_groups = tech_groups
    console.log(tech_groups)
    console.log(bars)

    let green_indicator = tech_groups.append("rect")
      .attr("class", "green_bar")
      .attr("height", 5)
      .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
      .attr("y", bar_width + 2)
      .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
      .attr("fill", d => d.green ? "green" : "white")
    ;

    let yaxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + 0 + "," + (height - 20) + ")")
      .call(d3.axisBottom(y).ticks(5).tickFormat(d3.format("~%")))
    ;


    function update() {
      
      data = data_both.filter(d => d.asset_class == class_selector.value)[0].data;
    
      // reset selectors based on current asset class selection
      let selected_benchmark = benchmark_selector.value;
      benchmark_names = data.filter(d => !d.this_portfolio).map(d => d.portfolio_name).sort();
      benchmark_selector.length = 0;
      benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
      benchmark_selector.options[Math.max(benchmark_names.indexOf(selected_benchmark), 0)].selected = 'selected';
      
      let port_sectors = data.filter(d => d.this_portfolio == true)[0].data.map(d => d.ald_sector);
      let port_techs = data.filter(d => d.this_portfolio == true)[0].data.map(d => d.data.map(d => d.technology)).flat();

      let subdata = Array.from(data);
      // filter out unselected benchmarks
      subdata = subdata.filter(d => d.this_portfolio == true | d.portfolio_name == benchmark_selector.value);
      // filter out sectors from the benchmark that do not exist in the portfolio
      subdata.forEach(d => d.data = d.data.filter(f => port_sectors.includes(f.ald_sector)));

      let max_y = Math.max(...subdata.map(d => d.data.map(d => d.data.map(d => d.cumsum))).flat().flat());
      y.domain([0, (+percent_selector.value == 1 ? 1 : max_y)]).nice()

      portfolios.data(subdata)
        .attr("id", d => d.portfolio_name)
        .attr("class", "portfolio")
        .attr("transform", (d,i) => "translate(0," + (i * (bar_width + bar_gap)) + ")")
      ;

      sectors = portfolios.selectAll(".sector").data(d => {
          d.data.forEach(f => f["portfolio_name"] = d.portfolio_name);
          d.data.forEach(f => f["this_portfolio"] = d.this_portfolio);
          return d.data;
        });
      
      sectors.exit().remove();
      
      sectors = sectors.enter()
        .append("g")
        .merge(sectors)
        .attr("id", d => d.ald_sector)
        .attr("class", d => "sector " + d.ald_sector)
        .attr("transform", (d,i) => "translate(0," + (i * (((bar_width + bar_gap) * 2) + sector_gap)) + ")")
      ;
      
      sectors.selectAll(".portfolio_label").remove();
      portfolio_labels = sectors.append("text")
        .text(d => d.this_portfolio ? port_label : comp_label)
        .attr("class", "portfolio_label")
        .attr("transform", "translate(-" + portfolio_label_offset + "," + (bar_width / 2) + ")")
        .style("alignment-baseline", "central")
        .style("text-anchor", "end")
        .attr("fill", "black")
        .attr("font-size", "0.7em")
      ;

      sectors.selectAll(".sector_label").remove();
      sector_labels = sectors.append("text")
        .text(d => d.this_portfolio ? d.ald_sector : "")
        .attr("class", "sector_label")
        .attr("transform", "translate(-5," + (bar_width + (bar_gap / 2)) + ") rotate(-90)")
        .style("alignment-baseline", "bottom")
        .style("text-anchor", "middle")
        .attr("fill", "black")
      ;

      
      tech_groups = sectors.selectAll(".technology").data(d => {
        d.data.forEach(f => f["ald_sector"] = d.ald_sector);
        return d.data;
      });
      
      tech_groups.exit().remove();
      
      tech_groups.enter()
        .append("g")
        .attr("class", "technology")
        .merge(tech_groups)
        .attr("id", d => d.technology)
      ;

      
/*
      bars.remove();
      tech_groups.append("rect")
        .attr("rx", 0)
        .attr("height", bar_width)
        .attr("class", d => d.technology)
        .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
      ;
*/
/*
      bars = tech_groups.append("rect")
        .attr("rx", 0)
        .attr("height", bar_width)
        .attr("class", d => d.technology)
        .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
      ;
*/
/*
      bars = bars.data(d => d.data);
      bars.exit().remove();
      console.log(tech_groups)
      console.log(tech_groups.selectAll("rect:not(.green_bar)").data(d => d))
      console.log(bars.enter())
*/
      
/*
      tech_groups.selectAll(".technology").enter()
        .append("rect")
        .attr("rx", 0)
        .attr("height", bar_width)
        .attr("class", d => d.technology)
        .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
*/
      
      let bars = tech_groups.select(".bar");
      bars.exit().remove();
      bars.enter()
        .append("rect")
        .attr("rx", 0)
        .attr("height", bar_width)
        .attr("class", "bar")
        .attr("id", d => d.technology)
        .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
      ;
      bars
        .transition()
        .attr("class", d => d.technology)
        .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
      ;

/*
      bars.update()
        .transition() 
        .attr("class", d => d.technology)
        .attr("value", d => +percent_selector.value == 1 ? d.sector_prcnt : d.plan_carsten)
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
      ;
*/

      green_indicator = green_indicator.data(d => d.data);
      green_indicator.exit().remove();
      green_indicator.enter()
        .append("rect")
        .attr("class", "green_bar")
        .attr("height", 5)
        .attr("y", bar_width + 2)
        .attr("width", 0)
        .attr("fill", d => d.green ? "green" : "white")
        .merge(green_indicator)
        .transition()
        .attr("x", d => +percent_selector.value == 1 ? y(d.sector_cumprcnt) : y(d.cumsum))
        .attr("width", d => +percent_selector.value == 1 ? y(d.sector_prcnt) : y(d.plan_carsten))
        .attr("fill", d => d.green ? "green" : "white")
      ;
      
      // determine height based on number of sectors in portfolio
      port_sectors = data.filter(d => d.this_portfolio == true)[0].data.map(d => d.ald_sector);
      height = (port_sectors.length * (((bar_width + bar_gap) * 2) + sector_gap));
      d3.select(chart_div).select("svg").attr("height", height + margin.top + margin.bottom);
      
      yaxis.transition()
        .attr("transform", "translate(" + 0 + "," + (height - 20) + ")")
        .call(d3.axisBottom(y).ticks(5).tickFormat(d3.format("~%")))
      ;
    }
    
    function mouseover(d) {
      tooltip
        .html(tech_id2name(d.technology) + "<br>" + 
              num_format(d.plan_carsten) + " of assets under management<br>" + 
              num_format(d.sector_prcnt) + " of " + d.ald_sector + " sector"
             )
        .style("display", "inline-block")
    }
    
    function mousemove(d) {
      tooltip
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
    }
    
    function mouseout(d) {
      tooltip.style("display", "none")
    }
  }
}