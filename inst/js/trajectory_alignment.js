class trajectory_alignment {

  constructor(container, data, labels, opts) {
    let container_div;
    if (typeof container === "string") {
      container_div = document.querySelector(container);
    } else {
      container_div = container;
    }

    d3.select(container_div).attr("chart_type", "trajectory_alignment");
    d3.select(container_div).attr("chart_type_data_download", "trajectory_alignment"); //matching the names in the export/ folder

    container_div.classList.add("d3chart");
    container_div.classList.add("trajectory_alignment_chart");
    d3.select(container_div).attr("constructor_name", "trajectory_alignment");

    const container_div_width = parseInt(window.getComputedStyle(container_div, null).width);

    const chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);

    // set options
    opts = (typeof opts === 'undefined') ? {} : opts;
    const default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    const default_tech = (typeof opts.default_tech === 'undefined') ? "" : opts.default_tech;
    const default_benchmark = (typeof opts.default_benchmark === 'undefined') ? "" : opts.default_benchmark;
    let value_var = (typeof opts.value_var === "undefined") ? "value" : opts.value_var; // "value" or "prcnt_chg"
    const scenarios_to_include = (typeof opts.scenarios_to_include === "undefined") ? ["B2DS", "SDS", "NPS", "SPS", "CPS","1.5c","2c","ref"] : opts.scenarios_to_include;
    const ttl_width = (typeof opts.ttl_width === "undefined") ? 700 : opts.ttl_width;
    const ttl_height = (typeof opts.ttl_height === "undefined") ? 400 : opts.ttl_height;
    const area_opacity = (typeof opts.area_opacity === "undefined") ? 1 : opts.area_opacity;
    let end_year = (typeof opts.end_year === "undefined") ? undefined : opts.end_year; // if undefined end_year is set later in the code

    //set labels
    labels = (typeof labels === 'undefined') ? {} : labels;
    const title_what = (typeof labels.title_what === 'undefined') ? ": Production trajectory of " : labels.title_what,
    title_how = (typeof labels.title_how === 'undefined') ? "compared to " : labels.title_how,
    caption_alloc = (typeof labels.caption_alloc === 'undefined') ? "Allocation method: " : labels.caption_alloc,
    caption_market = (typeof labels.caption_market === 'undefined') ? "Equity market: " : labels.caption_market,
    caption_geography = (typeof labels.caption_geography === 'undefined') ? "Scenario geography: " : labels.caption_geography,
    ytitle = (typeof labels.ytitle === 'undefined') ? " production in " : labels.ytitle,
    portfolio_label = (typeof labels.portfolio_label === 'undefined') ? "Portfolio" : labels.portfolio_label,
    benchmark_label = (typeof labels.benchmark_label === 'undefined') ? "Benchmark" : labels.benchmark_label,
    caption_source = (typeof labels.caption_source === 'undefined') ? "Scenario source: " : labels.caption_source,
    label_dots_legend = (typeof labels.label_dots_legend === 'undefined') ? {top: "Yearly production", bottom: "volume"} : labels.label_dots_legend,
    footnote = (typeof labels.footnote === 'undefined') ? "* start date of the analysis" : labels.footnote,
    hoverover_value_label = (typeof labels.hoverover_value_label === 'undefined') ? "(Planned) yearly production: " : labels.hoverover_value_label;

    // settings
    const margin = {top: 20, right: 180, bottom: 80, left: 70};
    let width = ttl_width - margin.left - margin.right;
    let height = ttl_height - margin.top - margin.bottom;

    // asset class selector
    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "techexposure_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", change_class.bind(null, data), false);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';

    // benchmark selector
    let benchmark_selector = document.createElement("select");
    benchmark_selector.classList = "trajectory_alignment_benchmark_selector inline_text_dropdown";
    benchmark_selector.addEventListener("change", update);

    // allocation selector
    let allocation_selector = document.createElement("select");
    allocation_selector.classList = "trajectory_alignment_allocation_selector inline_text_dropdown";
    allocation_selector.addEventListener("change", update);

    // market selector
    let market_selector = document.createElement("select");
    market_selector.classList = "trajectory_alignment_market_selector inline_text_dropdown";
    market_selector.addEventListener("change", update);

    // geography selector
    let geo_selector = document.createElement("select");
    geo_selector.classList = "trajectory_alignment_geo_selector inline_text_dropdown";
    geo_selector.addEventListener("change", update);

    // source selector
    let source_selector = document.createElement("select");
    source_selector.classList = "trajectory_alignment_source_selector inline_text_dropdown";
    source_selector.addEventListener("change", update);

    // tech selector
    let tech_selector = document.createElement("select");
    tech_selector.classList = "trajectory_alignment_tech_selector inline_text_dropdown";
    tech_selector.addEventListener("change", change_technology.bind(null, data), false);

    function appendOptionsToTechSelector(tech_selector,data,selected_option) {
      let data_not_benchmark = data.filter(d => !d.benchmark);
      let sector_tech_grps = d3.rollups(data_not_benchmark, v => d3.map(v, d => d.technology_translation).keys().sort(), d => d.ald_sector_translation);
      let grp, optgrp, opt, option;
      for (var i = 0; i < sector_tech_grps.length; ++i) {
        grp = sector_tech_grps[i];
        optgrp = document.createElement("optgroup");
        optgrp.label = grp[0];
        for (var j = 0; j < grp[1].length; ++j) {
          option = grp[1][j];
          opt = document.createElement("option");
          opt.textContent = option;
          opt.value = option;
          optgrp.appendChild(opt);
        }
        tech_selector.appendChild(optgrp);
      }
      tech_selector.options[Math.max(sector_tech_grps.map(d => d[1]).flat().indexOf(selected_option), 0)].selected = 'selected';

      return tech_selector;
    }

    tech_selector = appendOptionsToTechSelector(tech_selector,data,default_tech);

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = ttl_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(tech_selector);
    titlediv.appendChild(document.createElement("br"));
    titlediv.appendChild(document.createTextNode(title_how));
    titlediv.appendChild(benchmark_selector);
    chart_div.appendChild(titlediv);

    // create bottom filters
    let filtersdiv = document.createElement("div");
    filtersdiv.style.width = ttl_width + "px";
    filtersdiv.classList = "chart_filters";
    filtersdiv.appendChild(document.createTextNode(caption_alloc));
    filtersdiv.appendChild(allocation_selector);
    filtersdiv.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
    filtersdiv.appendChild(document.createTextNode(caption_market));
    filtersdiv.appendChild(market_selector);
    chart_div.appendChild(filtersdiv);

    // create source filters
    let scenfiltersdiv = document.createElement("div");
    scenfiltersdiv.style.width = ttl_width + "px";
    scenfiltersdiv.classList = "chart_filters";
    scenfiltersdiv.appendChild(document.createTextNode(caption_geography));
    scenfiltersdiv.appendChild(geo_selector);
    scenfiltersdiv.appendChild(document.createTextNode("\u00A0\u00A0\u00A0\u00A0"));
    scenfiltersdiv.appendChild(document.createTextNode(caption_source));
    scenfiltersdiv.appendChild(source_selector);
    chart_div.appendChild(scenfiltersdiv);

    // parse year to date
    data.forEach(d => d.date = d3.timeParse("%Y")(d.year));

    // start building
    let x = d3.scaleTime().range([0, width]).clamp(true);

    const tooltip = d3.select(chart_div)
      .append("div")
      .attr("class", "d3tooltip")
      .style("display", "none")
    ;

    let svg = d3.select(chart_div)
      .append("svg")
      .attr("width", ttl_width)
      .attr("height", ttl_height)
    ;

    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "white")
    ;

    svg.append("svg:defs")
      .append("svg:marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("svg:path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
    ;

    let chart_group = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let xaxis_grp = chart_group.append("g")
      .attr("class", "xaxis")
      .attr("transform", "translate(0," + height + ")")
    ;

    let yaxis_grp = chart_group.append("g").attr("class", "yaxis");

    let yaxislabel_grp = chart_group.append("g").attr("class", "yaxislabel");

    let area_paths_grp = chart_group.append("g").attr("class", "area_paths");

    let production_line_grp = chart_group.append("g").attr("class", "production_line_grp");

    let benchmark_line_grp = chart_group.append("g").attr("class", "benchmark_line_grp");

    let legend_grp = chart_group.append("g").attr("transform", "translate(" + (width + 10) + ",0)").attr("class", "legend_grp");

    let footnote_group = chart_group.append("g")
      .attr("class", "footnote")
      .attr("transform", "translate(" + (width + margin.left) + "," + (height + margin.bottom / 2)+ ")");

    // run it
    class_selector.dispatchEvent(new Event('change'));

    function reset_technology(data) {
      let selected_tech = tech_selector.value;
      tech_selector.querySelectorAll("optgroup").forEach(d => tech_selector.removeChild(d));
      tech_selector = appendOptionsToTechSelector(tech_selector, data, selected_tech);
      resize_inline_text_dropdown(null, tech_selector);

      let subdata = data.filter(d => d.technology_translation == tech_selector.value);

      return subdata
    }

    function reset_benchmark(data) {
      let selected_benchmark = benchmark_selector.value;
      benchmark_selector.length = 0;
      let benchmark_names = d3.map(data.filter(d => d.benchmark), d => d.portfolio_name_translation).keys();
      benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
      benchmark_selector.options[Math.max(0, benchmark_names.indexOf(selected_benchmark))].selected = 'selected';
      resize_inline_text_dropdown(null, benchmark_selector);
    }

    function reset_allocation(data) {
      let selected_allocation = allocation_selector.value;
      allocation_selector.length = 0;
      let allocation_names = d3.map(data, d => d.allocation_translation).keys();
      allocation_names.forEach(allocation_name => allocation_selector.add(new Option(allocation_name, allocation_name)));
      allocation_selector.options[Math.max(0, allocation_names.indexOf(selected_allocation))].selected = 'selected';
      resize_inline_text_dropdown(null, allocation_selector);
    }

    function reset_market(data) {
      let selected_market = market_selector.value;
      market_selector.length = 0;
      let market_names = d3.map(data, d => d.equity_market_translation).keys();
      market_names.forEach(market_name => market_selector.add(new Option(market_name, market_name)));
      market_selector.options[Math.max(0, market_names.indexOf(selected_market))].selected = 'selected';
      resize_inline_text_dropdown(null, market_selector);
    }

    function reset_geography(data) {
      let selected_geo = geo_selector.value;
      geo_selector.length = 0;
      let geo_names = d3.map(data, d => d.scenario_geography_translation).keys();
      geo_names.forEach(geo_name => geo_selector.add(new Option(geo_name, geo_name)));
      geo_selector.options[Math.max(0, geo_names.indexOf(selected_geo))].selected = 'selected';
      resize_inline_text_dropdown(null, geo_selector);
    }

    function reset_source(data) {
      let selected_source = source_selector.value;
      source_selector.length = 0;
      let source_names = d3.map(data, d => d.scenario_source).keys();
      source_names.forEach(source_name => source_selector.add(new Option(source_name, source_name)));
      source_selector.options[Math.max(0, source_names.indexOf(selected_source))].selected = 'selected';
      resize_inline_text_dropdown(null, source_selector);
    }

    function reset_secondary_filters(data) {
      reset_benchmark(data)
      reset_allocation(data)
      reset_market(data)
      reset_geography(data)
      reset_source(data)
    }

    function filter_data_class_tech(data) {
      let selected_class = class_selector.value;
      let selected_tech = tech_selector.value

      let subdata = data.filter(d => d.asset_class_translation == selected_class);
      subdata = subdata.filter(d => scenarios_to_include.concat("production").indexOf(d.scenario) >= 0);
      subdata = subdata.filter(d => d.technology_translation == selected_tech);

      return subdata
    }


    function change_class(data) {
      let selected_class = class_selector.value;

      let subdata = data.filter(d => d.asset_class_translation == selected_class);
      subdata = subdata.filter(d => scenarios_to_include.concat("production").indexOf(d.scenario) >= 0);

      subdata = reset_technology(subdata);
      reset_secondary_filters(subdata);

      update();
    }

    function change_technology(data) {
      let subdata = filter_data_class_tech(data);

      reset_secondary_filters(subdata);

      update();
    }

    function createNoDataNoticeNodeInt(no_data_message) {
      let nodata_notice = document.createElement("div");
      nodata_notice.classList.add("nodatanotice");
      let nodata_text = document.createTextNode(no_data_message);
      nodata_notice.appendChild(nodata_text);

      return nodata_notice;
    }

    function DisplayNoDataMessage(no_data_message) {
      let nodata_notice = createNoDataNoticeNodeInt(no_data_message);

      chart_div.insertBefore(nodata_notice,chart_div.lastChild);
    }

    function mouseover(d) {
      tooltip
        .html(portfolio_label + "<br>" + hoverover_value_label + d3.format(".2f")(d.value) + ' ' + d.unit_translation)
        .style("display", "inline-block")
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
    }

    function mousemove() {
      tooltip
        .style("left", d3.event.pageX + 10 + "px")
        .style("top", d3.event.pageY - 20 + "px")
    }

    function mouseout() {
      tooltip.style("display", "none")
    }

    function update() {

      svg.attr("display", "inline")
      if (chart_div.contains(chart_div.querySelector("div[class=nodatanotice]"))) {
        chart_div.querySelector("div[class=nodatanotice]").remove();
      }

      let selected_class = class_selector.value;
      let selected_tech = tech_selector.value;
      let selected_tech_org = data.filter(d => d.technology_translation == selected_tech)[0]["technology"];
      let selected_benchmark = benchmark_selector.value;
      let selected_allocation = allocation_selector.value;
      let selected_market = market_selector.value;
      let selected_geography = geo_selector.value;
      let selected_source = source_selector.value;

      let subdata = filter_data_class_tech(data);
        subdata = subdata.filter(d => d.allocation_translation == selected_allocation);
        subdata = subdata.filter(d => d.equity_market_translation == selected_market);
        subdata = subdata.filter(d => d.scenario_geography_translation == selected_geography);
        subdata = subdata.filter(d => d.scenario_source == selected_source);

      if (subdata.length == 0) {
        DisplayNoDataMessage("No data available for selected combination of filters. Try changing the allocation method, equity market, scenario geography or scenario source.")
        svg.attr("display", "none")
        return;
      }

      if (end_year != undefined) {
        subdata = subdata.filter(d => d.year <= end_year);
      } else {
        end_year = d3.max(d3.map(subdata.filter(d => d.scenario == "production"), d => d.year).keys()); // set the end_year to last year of production data
        subdata = subdata.filter(d => d.year <= end_year);
      }

      let color, legend_order;

      if (selected_source =="GECO2021") {
        color = d3.scaleOrdinal()
          .domain(["production",  "1.5C-Unif", "NDC-LTS", "CurPol", "worse"])
          .range(["black", "#709458", "#8db96e", "#FDF28D", "#e07b73"])
        ;
        legend_order = ["worse", "CurPol", "NDC-LTS", "1.5C-Unif"];
      } else if (selected_source == "WEO2021") {
        color = d3.scaleOrdinal()
          .domain(["production", "NZE_2050", "SDS", "APS", "STEPS", "worse"])
          .range(["black", "#9cab7c", "#c3d69b", "#FFFFCC", "#fde291", "#e07b73"])
          legend_order = ["worse", "STEPS", "APS", "SDS", "NZE_2050"];
        ;
      } else if (selected_source == "GECO2022") {
        color = d3.scaleOrdinal()
          .domain(["production", "1.5C", "NDC_LTS", "Reference", "worse"])
          .range(["black", "#9cab7c", "#c3d69b", "#FFFFCC", "#e07b73"])
          legend_order = ["worse", "Reference", "NDC_LTS", "1.5C"];
        ;
      } else if (selected_source == "ISF2021") {
        color = d3.scaleOrdinal()
          .domain(["production", "NZE", "worse"])
          .range(["black", "#9cab7c", "#e07b73"])
          legend_order = ["worse", "NZE"];
        ;
      } else if (selected_source == "WEO2022") {
        color = d3.scaleOrdinal()
          .domain(["production", "NZE_2050", "APS", "STEPS", "worse"])
          .range(["black", "#9cab7c", "#FFFFCC", "#fde291", "#e07b73"])
          legend_order = ["worse", "STEPS", "APS", "NZE_2050"];
        ;
      } else if (selected_source == "GECO2023") {
        color = d3.scaleOrdinal()
          .domain(["production", "1.5C", "NDC-LTS", "Reference", "worse"])
          .range(["black", "#9cab7c", "#c3d69b", "#FFFFCC", "#e07b73"])
          legend_order = ["worse", "Reference", "NDC-LTS", "1.5C"];
        ;
      } else if (selected_source == "ISF2023") {
        color = d3.scaleOrdinal()
          .domain(["production", "1.5\xb0C", "worse"])
          .range(["black", "#9cab7c", "#e07b73"])
          legend_order = ["worse", "1.5\xb0C"];
        ;
      } else if (selected_source == "WEO2023") {
        color = d3.scaleOrdinal()
          .domain(["production", "NZE_2050", "APS", "STEPS", "worse"])
          .range(["black", "#9cab7c", "#FFFFCC", "#fde291", "#e07b73"])
          legend_order = ["worse", "STEPS", "APS", "NZE_2050"];
        ;
      } else {
        color = d3.scaleOrdinal()
          .domain(["production", "ETP_SDS", "NZE", "IPR FPS 2021", "worse"])
          .range(["black", "#9cab7c", "#9cab7c", "#9cab7c", "#e07b73"])
          legend_order = ["worse", "IPR FPS 2021", "NZE", "ETP_SDS"];
        ;
      }

      let production_data = subdata.filter(d => !d.benchmark && d.scenario == "production");
      if (production_data.length == 0) {
        DisplayNoDataMessage("No data available for selected combination of filters. Try changing the allocation method, equity market, scenario geography or scenario source.")
        svg.attr("display", "none")
        return;
      }

      let benchmark_data = subdata.filter(d => d.portfolio_name_translation == selected_benchmark);
      if (benchmark_data.length == 0) {
        console.log("No benchmark data available for selected combination of benchmark, allocation method, equity market, scenario geography and scenario source. Try changing the selection.")
      }

      let areadata = subdata.filter(d => !d.benchmark);
      subdata = subdata.filter(d => !d.benchmark || d.portfolio_name_translation == selected_benchmark);
      if (subdata.length == 0) {
        DisplayNoDataMessage("No data available for selected combination of filters. Try changing the allocation method, equity market, scenario geography or scenario source.")
        svg.attr("display", "none")
        return;
      }

      let unit = d3.map(production_data, d => d.unit_translation).keys()[0];

      var sumstat = d3.nest()
        .key(d => d.scenario)
        .entries(areadata)
        .sort(d => d.key == "production")
      ;

      function direction(tech) {
        switch(tech) {
          case "Oil": return true; break;
          case "Coal": return true; break;
          case "Gas": return true; break;
          case "Electric": return false; break;
          case "Hybrid": return false; break;
          case "ICE": return true; break;
          case "CoalCap": return true; break;
          case "GasCap": return true; break;
          case "HydroCap": return false; break;
          case "NuclearCap": return false; break;
          case "OilCap": return true; break;
          case "RenewablesCap": return false; break;
          case "FuelCell": return false; break;
          default: console.log("undefined tech:", tech)
        }
      }
      let descending = direction(selected_tech_org);

      function format_axis(value_var) {
        if (value_var == "ratio") {
          return d3.format(".0%");
        } else if (value_var == "prcnt_chg") {
          return d3.format(".0%");
        } else {
          return d3.format(".2s");
        }
      }

      let y;
      if (value_var == "ratio") {
        y = d3.scaleLog().range([height, 0]).clamp(true);
      } else if (value_var == "prcnt_chg") {
        y = d3.scaleLinear().range([height, 0]).clamp(true);
      } else {
        y = d3.scaleLinear().range([height, 0]).clamp(true);
      }

      x.domain(d3.extent(subdata, d => d.date));

      let benchmark_extent;
      let scale_factor;
      if (benchmark_data.length > 0) {
        scale_factor = production_data[0].value / benchmark_data[0].value;
        benchmark_extent = d3.extent(benchmark_data, d => d[value_var] * scale_factor);
      } else {
        benchmark_extent = null;
      }
      let production_extent = d3.extent(production_data, d => d[value_var]);
      let areadata_extent = d3.extent(areadata, d => d[value_var]);
      y.domain(d3.extent([benchmark_extent, production_extent, areadata_extent].flat())).nice();

      const num_of_years = 1 + Math.abs(x.domain().reduce((a,b) => a.getFullYear() - b.getFullYear()));

      // areas
      let area_paths = chart_group.select("g.area_paths");
      area_paths.selectAll("*").remove();

      if (descending) {
        sumstat.sort((a,b) => b.values.filter(d => d.year == end_year)[0].value > a.values.filter(d => d.year == end_year)[0].value ? 1 : -1);
      } else {
        sumstat.sort((a,b) => b.values.filter(d => d.year == end_year)[0].value > a.values.filter(d => d.year == end_year)[0].value ? -1 : 1);
      }

      var area = d3.area()
        .x(d => x(d.date))
        .y0(descending ? height : 0)
        .y1(d => y(d[value_var]))
      ;

      area_paths_grp
        .append("rect")
        .attr("class", "worse")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .style("fill", color("worse"))
      ;

      area_paths = area_paths_grp.selectAll(".area")
        .data(sumstat.filter(d => d.key != "production"))
      ;

      area_paths.enter()
        .append("path")
        .attr("class", d => "area " + d.key)
        .attr("d", d => area(d.values))
        .style("fill", d => color(d.key))
      ;


      // axes
      let tick_labels = d3.map(subdata, d => d.year).keys().slice(0, Math.min(num_of_years, 5) + 1)
      tick_labels[0] = "31-Dec-" + tick_labels[0] + "*"
      xaxis_grp
        .call(
          d3.axisBottom(x)
          .ticks(Math.min(num_of_years, 5))
          .tickFormat((d,i) => tick_labels[i])
          );
      yaxis_grp.call(d3.axisLeft(y).ticks(8).tickFormat(format_axis(value_var)));


      // y-axis label
      yaxislabel_grp.selectAll("text").remove();

      yaxislabel_grp.append("text")
        .attr("class", "yaxislabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "bottom")
        .text(selected_tech + ytitle + unit)
      ;


      // production line
      let production_line = d3.line()
        .x(d => x(d.date))
        .y(d => y(+d[value_var]))
      ;

      production_line_grp.selectAll("path").remove();
      production_line_grp.selectAll(".dot").remove();

      production_line_grp
        .append("path")
        .attr("class", "production_line")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("d", d => production_line(production_data))
      ;

      let dots_production = production_line_grp
        .selectAll(".dot")
        .data(production_data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 2.5)
        .style("stroke", "#000")
        .style("fill", "#000")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(+d[value_var]))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        ;


      // legend
      let box_height = 30;
      let box_width = 75;

      let legend_data = sumstat.filter(d => d.key != "production");
      legend_data = [{key: "worse"}].concat(legend_data);

      legend_data.sort((a,b) => legend_order.indexOf(a.key) - legend_order.indexOf(b.key));


      legend_grp.selectAll("*").remove();

      let legend_box = legend_grp.selectAll(null)
        .data(legend_data)
      ;

      legend_box.enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d,i) => i * box_height)
        .attr("width", box_width)
        .attr("height", box_height)
        .style("fill", d => color(d.key))
      ;

      legend_box.enter()
        .append("text")
        .attr("x", box_width + 8)
        .attr("y", (d,i) => i * box_height)
        .style("display", (d,i) => i == 0 ? "none" : "inline")
        .style("text-anchor", "start")
        .style("alignment-baseline", "central")
        .style("font-size", "0.8em")
        .text(d => d.key)
      ;

      legend_box.enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", (d,i) => i * box_height)
        .attr("x2", box_width + 3)
        .attr("y2", (d,i) => i * box_height)
        .attr("marker-end", "url(#arrow)")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("display", (d,i) => i == 0 ? "none" : "inline")
      ;

      legend_box.data([portfolio_label, benchmark_label])
        .enter()
        .append("text")
        .attr("transform", "translate(0," + (legend_data.length * box_height) + ")")
        .attr("x", 31)
        .attr("y", (d,i) => (i * box_height) + (box_height / 2))
        .style("text-anchor", "start")
        .style("alignment-baseline", "central")
        .style("font-size", "0.8em")
        .text(d => d)
      ;

      legend_box.data([portfolio_label, benchmark_label])
        .enter()
        .append("line")
        .attr("transform", "translate(0," + (legend_data.length * box_height) + ")")
        .attr("x1", 0)
        .attr("y1", (d,i) => (i * box_height) + (box_height / 2))
        .attr("x2", 26)
        .attr("y2", (d,i) => (i * box_height) + (box_height / 2))
        .style("stroke", "black")
        .style("stroke-width", 1.5)
        .style("stroke-dasharray", (d,i) => i == 0 ? "none" : "2,2")
      ;

      legend_box.data([portfolio_label, benchmark_label])
        .enter()
        .append("circle")
        .attr("transform", "translate(0," + (legend_data.length * box_height) + ")")
        .attr("r", 2.5)
        .style("stroke", "#000")
        .style("fill", "#000")
        .attr("cx", 13)
        .attr("cy", (d,i) => (i * box_height) + (box_height / 2))

      legend_box.data([1])
        .enter()
        .append("circle")
        .attr("transform", "translate(0," + ((legend_data.length + 1) * box_height) + ")")
        .attr("r", 2.5)
        .style("stroke", "#000")
        .style("fill", "#000")
        .attr("cx", 13)
        .attr("cy", (box_height + box_height / 2))

      let label_dots_legend_data = [label_dots_legend.top, label_dots_legend.bottom]

      legend_box.data(label_dots_legend_data)
        .enter()
        .append("text")
        .attr("transform", "translate(0," + ((legend_data.length + 1) * box_height) + ")")
        .attr("x", 31)
        .attr("y", (d,i) => (box_height + box_height / 2 + i * (box_height / 2)))
        .style("text-anchor", "start")
        .style("alignment-baseline", "central")
        .style("font-size", "0.8em")
        .text(d => d)

      // benchmark line
      benchmark_line_grp.selectAll("path").remove();
      benchmark_line_grp.selectAll(".dot").remove();

      if (benchmark_data.length > 0) {
        let benchmark_line = d3.line()
          .x(d => x(d.date))
          .y(d => y(+d[value_var] * scale_factor))
        ;

        benchmark_line_grp
          .append("path")
          .attr("class", "benchmark_line")
          .attr("stroke-width", 1.5)
          .attr("fill", "none")
          .attr("stroke", "black")
          .style("stroke-dasharray", "2,2")
          .attr("d", d => benchmark_line(benchmark_data))
        ;

        let dots_benchmark = benchmark_line_grp
        .selectAll(".dot")
        .data(benchmark_data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 2.5)
        .style("stroke", "#000")
        .style("fill", "#000")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(+d[value_var] * scale_factor))
        ;
      }

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
