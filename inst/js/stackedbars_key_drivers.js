class stackedbars_key_drivers{

  constructor(container, data_down, labels, opts, data_up) {

    let container_div;

    if (typeof container === "string") {
      container_div = document.querySelector(container)
    } else {
      container_div = container;
    }

    d3.select(container_div).attr("chart_type", "stacked_bars_key_drivers");
    d3.select(container_div).attr("chart_type_data_download", "key_bars_portfolio"); //matching the names in the export/ folder
    
    container_div.classList.add("stacked_bars");
    container_div.classList.add("d3chart");
    container_div.classList.add("chart_container");
    
    let container_div_width = parseInt(window.getComputedStyle(container_div, null).width);
    
    let chart_div = document.createElement("div");
    chart_div.classList.add("chart_div");
    container_div.insertBefore(chart_div, container_div.firstChild);

    this.container = d3.select(chart_div);
    
    // set options
    opts = (typeof opts === 'undefined') ? {} : opts;
    let ytitle = (typeof opts.ytitle === 'undefined') ? "" : opts.ytitle;
    const default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
    const default_sector = (typeof opts.default_sector === 'undefined') ? "" : opts.default_sector;
    const default_color = (typeof opts.default_color === 'undefined') ? "#00c082" : opts.default_color; // color - Green from 2DII palette
    
    // set labels
    labels = (typeof labels === 'undefined') ? {} : labels;
    const title_what = (typeof labels.title_what === 'undefined') ? ": Future technology mix for the largest holdings (by portfolio weight)" : labels.title_what,
    title_how = (typeof labels.title_how === 'undefined') ? "as % of sector for " : labels.title_how,
    title_who = (typeof labels.title_who === 'undefined') ? " sector." : labels.title_who,
    weights_title = (typeof labels.weights === 'undefined') ? "Weights" : labels.weights,
    hover_over_sec = (typeof labels.hover_over_sec === 'undefined') ? {before_sec: " of ", after_sec: " sector"} : labels.hover_over_sec,
    footnote_lab = (typeof labels.footnote === 'undefined') ? {befor_scen: "* Aligned to ", after_scen: " scenario in year ", after_year: "."} : labels.footnote;

    /* 
    ////////////////////////////////////////
    //INITIAL SET UP OF ALL GRAPH ELEMENTS//
    ////////////////////////////////////////
    */

    // size settings
    const total_width = 700;
    const port_gap = 17;//15;
    const bar_gap = 2;

    // asset class selector
    let class_names = d3.map(data_down, d => d.asset_class_translation).keys().sort();
    let class_selector = document.createElement("select");
    class_selector.classList = "techexposure_class_selector inline_text_dropdown";
    class_selector.addEventListener("change", change_class);
    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';

    let data_down_filtered = data_down.filter(d => d.asset_class_translation == class_selector.value);
    
    // sector selector
    let sector_names = d3.map(data_down_filtered, d => d.ald_sector_translation).keys().sort();
    let sector_selector = document.createElement("select");
    sector_selector.classList = "portfoliobubble_group_selector inline_text_dropdown";
    sector_selector.addEventListener("change", update);
    sector_names.forEach(sector_name => sector_selector.add(new Option(sector_name, sector_name)));
    sector_selector.options[Math.max(sector_names.indexOf(default_sector), 0)].selected = 'selected';

    // create title with selectors
    let titlediv = document.createElement("div");
    titlediv.style.width = total_width + "px";
    titlediv.classList = "chart_title";
    titlediv.appendChild(class_selector);
    titlediv.appendChild(document.createTextNode(title_what));
    titlediv.appendChild(document.createElement("br"));
    titlediv.appendChild(document.createTextNode(title_how));
    titlediv.appendChild(sector_selector);
    titlediv.appendChild(document.createTextNode(title_who)); 
    chart_div.appendChild(titlediv);

    let margin = {top: 40, right: 50, bottom: 180, left: 90};
    let width = total_width - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    const tooltip = d3.select(chart_div)
        .append("div")
        .attr("class", "d3tooltip")
        .style("display", "none")
      ;

    let svg = this.container
    .append("svg")
    .attr("width", total_width)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class","svg_group");

    let y = d3.scaleBand();
    let x = d3.scaleLinear()
        .domain([0, 1]);

    let yWeights = d3.scaleBand();

    let y_labels_group_up = svg.append("g").attr("class", "y_axis_labels_up");
    let y_labels_group_down = svg.append("g").attr("class", "y_axis_labels_down");
    let yWeights_group = svg.append("g").attr("class", "y_axis_weights_labels");
    let xaxis_group = svg.append("g").attr("class", "xaxis_group");
    let bars_group = svg.append("g").attr("class", "bars_group");
    let weights_label_group = svg.append("g").attr("class", "weights_label");
    let legend = svg.append("g").attr("class", "legend");
    let footnote = svg.append("g").attr("class", "footnote");

    class_selector.dispatchEvent(new Event('change'));

  /*
  /////////////////////////////////
  // DATA MANIPULATION FUNCTIONS//
  ////////////////////////////////
  */

    function getSectorAssetSubsetData(data, asset_class,sector) {
      let subdata = data.filter(d => d.asset_class_translation == asset_class);
      subdata = subdata.filter(d => d.ald_sector_translation == sector);

      return subdata
    };

    function getPortfolioWeightsPerIdData(data) {
      let subdata_weights = [];

      $.each(data, function(index, item) {
        exist_id = false;
        for (var i=0; i<subdata_weights.length; i++) {
          var exist_id = exist_id || subdata_weights[i]["id"] == item.id_translation;
        }
        if (! exist_id) {
          subdata_weights.push({"id":item.id_translation,"port_weight":item.port_weight})
        }
      })
      return subdata_weights;
    };
    
    function getTechnologyDataForStacking(data,data_weights) {
       var subdata_tech = [];

      $.each(data_weights, function(index, item) {
        subdata_tech[index] = {};
        subdata_tech[index]["id"] = this.id;
        $.each(data.filter(d => d.id_translation == this.id), function() {
          subdata_tech[index][this.technology] = this.plan_tech_share;
        });
      });

      return subdata_tech;
    }

    function getDataBarsAndWeights(data, asset_class,sector) {
      let subdata = getSectorAssetSubsetData(data, asset_class,sector);
      var subdata_weights = getPortfolioWeightsPerIdData(subdata);
      let subdata_tech = getTechnologyDataForStacking(subdata,subdata_weights);

      return [subdata_tech, subdata_weights]
    }

    function getTechnologyTranslation(technology) {

      let idx = data_up.findIndex(d => d.technology === technology);

      if (idx > -1) {
        return data_up[idx].technology_translation;
      } else {
        idx = data_down.findIndex(d => d.technology === technology);
        if (idx > -1) {
          return data_down[idx].technology_translation;
        } else {
          return technology;
        }
      }
      
    }

    function getSectorTranslation(sector) {

      let idx = data_up.findIndex(d => d.ald_sector === sector);

      if (idx > -1) {
        return data_up[idx].ald_sector_translation;
      } else {
        idx = data_down.findIndex(d => d.ald_sector === sector);

        if (idx > -1) {
          return data_down[idx].ald_sector_translation;
        } else {
          return sector;
        }
      }

    }

    /*
    /////////////////////////////
    // GRAPH DRAWING FUNCTIONS //
    /////////////////////////////
    */

    function drawStackedBarGroup(bars_group, x,y,y_labels_group,transition, bars_class_up_down,data, subgroups,groups, graph_start_height, graph_width,bar_height, bar_gap,sector) {

      y.range([ 0, groups.length * bar_height]).domain(groups);

      y_labels_group.attr("transform", "translate( " + 0 + ", " + graph_start_height +" )")
        .call(d3.axisLeft(y).tickSize(0))
        .call(g => g.select(".domain").remove());

      var color = d3.scaleOrdinal(d3.schemeCategory10)

      var stackedData = d3.stack()
        .keys(subgroups)
        (data)

      // Show the bars
      let bars_rect = bars_group.selectAll("rect").selectAll("."+bars_class_up_down).data([]);
        // Enter in the stack data = loop key per key = group per group
      bars_rect.exit().transition(transition).attr("width",0).remove();

      let bars_tech_groups = bars_group.selectAll("g").selectAll("."+bars_class_up_down).data([]);
      bars_tech_groups.exit().remove();

     bars_group.append("g")
      .selectAll("g")
      .data(stackedData)
      .enter().append("g")
        .attr("class", d => sector + " " + d.key + " " + bars_class_up_down)
        .attr("fill", function(d) { return color(d.key); })
        .attr("technology", function(d) {return getTechnologyTranslation(d.key) })
        .attr("sector", function(d) {return getSectorTranslation(sector) })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function(d) { return d; })
            .enter().append("rect")
              .attr("class", bars_class_up_down)
              .attr("x", function(d) { return x(d[0]); })
              .attr("y", function(d) { return graph_start_height + y(d.data.id); })
              .attr("width", function(d) { return x(d[1]) - x(d[0]); })
              .attr("height",bar_height-bar_gap)
              .on("mouseover", mouseover)
              .on("mouseout", mouseout)
              .on("mousemove", mousemove)
    }

    // determine left margin based on company name
    function findLongestName(data,label) {
      let longest_name_length = d3.max(data, d=>d[label].length);
      let long_test_label = new Array(longest_name_length).join("a")
      return long_test_label; 
    };

    function change_class() {
      let selected_class = class_selector.value;
      let selected_sector = sector_selector.value;
        
      data_down_filtered = data_down.filter(d => d.asset_class_translation == selected_class);
       
      // reset selectors based on current asset class selection
      let sector_names = d3.map(data_down_filtered, d => d.ald_sector_translation).keys().sort();
      sector_selector.length = 0;
      sector_names.forEach(sector_name => sector_selector.add(new Option(sector_name, sector_name)));
      sector_selector.options[Math.max(sector_names.indexOf(default_sector), 0)].selected = 'selected';
        
      sector_selector.dispatchEvent(new Event('change'));
    };

    function update() {

      let selected_class = class_selector.value;
      let selected_sector = sector_selector.value;
      let selected_sector_org = data_down.filter(d=>d.ald_sector_translation==selected_sector)[0]["ald_sector"]

      let [subdata_up, undefined] = getDataBarsAndWeights(data_up, selected_class,selected_sector);

      // artificially add company name translations
      $.each(data_down, function(index, item) {
        data_down[index]["id_translation"] = item.id;
      })
      let [subdata_down, subdata_weights] = getDataBarsAndWeights(data_down, selected_class,selected_sector);
      
      //const company_name = port_label;
      let label_width = 0;
      let long_label_down = findLongestName(subdata_down,"id");
      let long_label_up = findLongestName(subdata_up,"id");
      let long_label = long_label_down >= long_label_up ? long_label_down : long_label_up;

      let test_svg = d3.select(chart_div).append("svg")
      test_svg.append("text")
        .attr("font-size","10")
        .text(long_label)
        .each(function() { label_width = this.getBBox().width; })
      ;
      test_svg.remove();

      if (margin.left < label_width) {
        let margin_left_new = label_width;
        width = total_width - margin_left_new - margin.right;
        margin.left = margin_left_new
      };

      svg.attr("transform","translate(" + margin.left + "," + margin.top + ")");

      x.range([ 0, width]);
      
      let subgroups = d3.keys(subdata_down[0]).slice(1);

      let groups_down = d3.map(subdata_down, function(d){return(d.id)}).keys()
      let groups_up = d3.map(subdata_up, function(d){return(d.id)}).keys()

      let nr_bars = groups_up.length + groups_down.length;
      let bar_height_space = (height - port_gap)/nr_bars; 

      let t = d3.transition().duration(500);

      drawStackedBarGroup(bars_group, x, y, y_labels_group_up, t, "bars_up",subdata_up, subgroups, groups_up, 0, width, bar_height_space, bar_gap,selected_sector_org)
      drawStackedBarGroup(bars_group, x, y, y_labels_group_down, t, "bars_down",subdata_down, subgroups, groups_down, groups_up.length * bar_height_space + port_gap, width, bar_height_space, bar_gap,selected_sector_org)

      var formatter = d3.format(".0%");

      xaxis_group.attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(formatter))
      .selectAll("text")
      .style("text-anchor", "middle");

      var weights_strings = subdata_weights.map(
        function(d) { 
          let weight_perc = d.port_weight * 100;
          return weight_perc.toFixed(2) + '%'
        });

      yWeights.range([ 0, groups_down.length * bar_height_space ])
      .domain(groups_down);
       
      yWeights_group.attr("transform", "translate( " + width + ", " + (groups_up.length * bar_height_space + port_gap) +" )")
      .call(d3.axisRight(yWeights).tickSize(0).tickValues(groups_down).tickFormat(function (d,i) {return weights_strings[i]}))
      .call(g => g.select(".domain").remove());

      weights_label_group.selectAll("text").remove();
      weights_label_group.append("text")
      .attr("x", width + 1)
      .attr("y", groups_up.length * bar_height_space + port_gap - 5)
      .attr("font-size","10")
      .text(weights_title)

      let legend_data = [];

      $.each(subgroups, function(index, item) {
        legend_data[index] = {};
        legend_data[index].technology = item;
        legend_data[index].technology_translation = data_down.filter(d=> d.technology == item)[0]["technology_translation"];
        legend_data[index].class = selected_sector_org + " " + item
      });

       //const company_name = port_label;
      let label_width_leg = 0;
      let long_label_leg = findLongestName(legend_data,"technology_translation");

      test_svg = d3.select(chart_div).append("svg")
      test_svg.append("text")
        .attr("font-size","10")
        .text(long_label_leg)
        .each(function() { label_width_leg = this.getBBox().width; })
      ;
      test_svg.remove();

      let nr_labels_in_row = Math.round(width/(label_width_leg+15+10));

      if (Math.ceil(legend_data.length/nr_labels_in_row) == 1) {
        label_width_leg = Math.max(100,label_width_leg);
      }

      let legend_rects = legend.selectAll("rect").data([]);
      legend_rects.exit().remove();

      let legend_text = legend.selectAll("text").data([]);
      legend_text.exit().remove();

      legend.attr("transform","translate(0," + (height + margin.top) + ")");

      legend.selectAll("rect")
          .data(legend_data)
          .enter()
          .append("rect")
          .attr("class", d => d.class)
          .attr("width", 15)
          .attr("height", 15)
          .attr("x", (d,i) => (i%nr_labels_in_row) * (label_width_leg+15+10))
          .attr("y", (d,i) => Math.floor(i/nr_labels_in_row) * 30);
        
      legend.selectAll("text")
          .data(legend_data)
          .enter()
          .append("text")
          .text(d => d.technology_translation)
          .style("alignment-baseline", "central")
          .style("text-anchor", "start")
          .attr("font-size", "0.7em")
          .attr("x", (d,i) => ((i%nr_labels_in_row) * (label_width_leg+15+10) + 20))
          .attr("y", (d,i) => (Math.floor(i/nr_labels_in_row) * 30) + 7);

      footnote.attr("transform","translate(" + width + "," + (height + margin.top + (Math.floor(legend_data.length / nr_labels_in_row) + 1) * 30) + ")");

      let footnote_text = footnote.selectAll("text").data([]);
      footnote_text.exit().remove();

      let footnote_label = footnote_lab.befor_scen + data_up.filter(d => d.scenario != "production").map(d => d.scenario)[0] + footnote_lab.after_scen + data_up.map(d => d.year)[0] + footnote_lab.after_year;

      footnote.selectAll("text")
        .data([footnote_label])
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "end")
        .style("alignment-baseline", "central")
        .style("font-size", "0.7em")
        .text(d => d);
    };

    function num_format(num) {
        num = Math.round( ( num + Number.EPSILON ) * 1000 ) / 10;
        if (num < 0.1) {
          return "< 0.1%"
        }
        return num + "%"      
      }

      function mouseover(d) {

        var selfParent = d3.select(this.parentElement),
          tech      = selfParent.attr('technology'),
          sector = selfParent.attr('sector');

          tooltip
          .html(tech + "<br>" + 
                num_format(d[1] - d[0]) + hover_over_sec.before_sec + sector + hover_over_sec.after_sec
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