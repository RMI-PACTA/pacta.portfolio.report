class techexposure_future{

	constructor(container,data,labels,opts) {

		let container_div;

	    if (typeof container === "string") {
	      container_div = document.querySelector(container)
	    } else {
	      container_div = container;
	    }

	    d3.select(container_div).attr("chart_type", "techexposure_future");
	    d3.select(container_div).attr("chart_type_data_download", "techexposure_future"); //matching the names in the export/ folder

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
	    const default_class = (typeof opts.default_class === 'undefined') ? "" : opts.default_class;
	    const default_market = (typeof opts.default_market === 'undefined') ? "Global Market" : opts.default_market;
	    const default_scenario = (typeof opts.default_scenario === 'undefined') ? "ETP2017_B2DS" : opts.default_scenario;
	    var legend_order = opts.legend_order;

	    // set labels
	    labels = (typeof labels === 'undefined') ? {} : labels;
	    const title_up = (typeof labels.title_up === 'undefined') ? ": Future technology mix as % of sector based on " : labels.title_up,
	    title_scenario = (typeof labels.title_scenario === 'undefined') ? " scenario" : labels.title_scenario,
	    title_down = (typeof labels.title_down === 'undefined') ? "compared to " : labels.title_down,
	    title_market = (typeof labels.title_market === 'undefined') ? " as a subset of " : labels.title_market,
	    hover_over_sec = (typeof labels.hover_over_sec === 'undefined') ? {before_sec: " of ", after_sec: " sector"} : labels.hover_over_sec;

	    /*
	    ////////////////////////////////////////
	    //INITIAL SET UP OF ALL GRAPH ELEMENTS//
	    ////////////////////////////////////////
	    */

	    // size settings
	    const total_width = 700;
	    const sect_gap = 17;//15;
	    const scen_gap = 10;
	    const bar_gap = 5;
	    const nr_bars_sec = 4;
	    const portfolio_label_offset = 20;

	    let margin = {top: 40, right: 120, bottom: 40, left: 140};
	    let height = 500 - margin.top - margin.bottom;

	     // determine right margin based on label
	    function findLongestName(data,label) {
	      let longest_name_length = d3.max(data, d=>d[label].length);
	      let long_test_label = new Array(longest_name_length).join("a")
	      return long_test_label;
	    };

	    function findMarginWidth(data,chart_div,label) {
	    	let label_width = 0;
		    let long_label = findLongestName(data,label);

		    let test_svg = d3.select(chart_div).append("svg")
		    test_svg.append("text")
		        .attr("font-size","10")
		        .text(long_label)
		        .each(function() { label_width = this.getBBox().width; })
		    ;
		    test_svg.remove();
		return label_width;
	    }

	    function orderLegendDataIfPossible(legend_data_unordered, legend_order) {
	      if (typeof legend_order === 'undefined') {
	        return legend_data_unordered
	      } else {
	        let chart_sectors = d3.map(legend_data_unordered, d => d.sector).keys();
	        let chart_technologies = d3.map(legend_data_unordered, d => d.technology).keys();

	        let legend_data = []

	        legend_order.forEach( function(item) {
	          if ( chart_sectors.includes(item.ald_sector) && chart_technologies.includes(item.technology)) {
	            let idx = legend_data_unordered.findIndex(d => (d.sector == item.ald_sector && d.technology == item.technology))
	            legend_data.push(legend_data_unordered[idx])
	          }
	        })

	        if (legend_data_unordered.length > legend_data.length) {
	        	console.warn("Not all sector/technology pairs from the data were found in sector_order variable. The legend shown is incomplete. Please, amend the sector_order.csv file. ")
	        }

	        return legend_data
	      }
	    }

	    function replaceNaNWithNotNaNValueIfExists(pair) {
	    	if (isNaN(pair[0])) {
	    		pair[0] = pair[1]; // if both are NaN this will result in preserving this property (desirable feature)
	    	} else if (isNaN(pair[1])) {
	    		pair[1] = pair[0];
	    	}

	    	return pair;
	    }

	    function replaceNaNInData(stackedData) {
	    	for (var i = 0; i <  stackedData.length; i++) {
	    		for (var j = 0; j < stackedData[i].length; j ++) {
	    			stackedData[i][j] = replaceNaNWithNotNaNValueIfExists(stackedData[i][j]);
	    		}
	    	}

	    	return stackedData;
	    }

	    //increase margins if labels too long

	    let label_width_right = findMarginWidth(data,chart_div,"technology_translation");
	    let label_width_left = findMarginWidth(data,chart_div,"val_type_translation");

	    if (margin.right < label_width_right+60) {
	      margin.right_new = label_width_right+60;
	      margin.right = margin.right_new;
	    };

	    if (margin.left < label_width_left+portfolio_label_offset) {
	      margin.left_new = label_width_left+portfolio_label_offset;
	      margin.left = margin.left_new;
	    };

	    let width = total_width - margin.right - margin.left;

	    // asset class selector
	    let class_names = d3.map(data, d => d.asset_class_translation).keys().sort();
	    let class_selector = document.createElement("select");
	    class_selector.classList = "techexposure_class_selector inline_text_dropdown";
	    class_selector.addEventListener("change", change_class);
	    class_names.forEach(class_name => class_selector.add(new Option(class_name, class_name)));
	    class_selector.options[Math.max(class_names.indexOf(default_class), 0)].selected = 'selected';

	    let data_filtered = data.filter(d => d.asset_class_translation == class_selector.value);

	    // scenario selector
	    let scenario_names = d3.map(data_filtered, d => d.scenario).keys().sort();
	    let scenario_selector = document.createElement("select");
	    scenario_selector.classList = "techexposure_class_selector inline_text_dropdown";
	    scenario_selector.addEventListener("change", change_class);
	    scenario_names.forEach(scenario_name => scenario_selector.add(new Option(scenario_name, scenario_name)));
	    scenario_selector.options[Math.max(scenario_names.indexOf(default_scenario), 0)].selected = 'selected';

	    // benchmark selector
    	let benchmark_selector = document.createElement("select");
    	benchmark_selector.classList = "techexposure_benchmark_selector inline_text_dropdown";
    	benchmark_selector.addEventListener("change", change_class);

	    // market selector
	    let market_names = d3.map(data_filtered, d => d.equity_market_translation).keys().sort();
	    let market_selector = document.createElement("select");
	    market_selector.classList = "techexposure_group_selector inline_text_dropdown";
	    market_selector.addEventListener("change", update);
	    market_names.forEach(market_name => market_selector.add(new Option(market_name, market_name)));
	    market_selector.options[Math.max(market_names.indexOf(default_market), 0)].selected = 'selected';

	    // chart title
	    let titlediv = document.createElement("div");
	    titlediv.style.width = total_width + "px";
	    titlediv.classList = "chart_title";
	    titlediv.appendChild(class_selector);
	    titlediv.appendChild(document.createTextNode(title_up));
	    titlediv.appendChild(scenario_selector);
	    titlediv.appendChild(document.createTextNode(title_scenario));
	    titlediv.appendChild(document.createElement("br"));
	    titlediv.appendChild(document.createTextNode(title_down));
	    titlediv.appendChild(benchmark_selector);
	    titlediv.appendChild(document.createTextNode(title_market));
	    titlediv.appendChild(market_selector);
	    chart_div.appendChild(titlediv);

	    const tooltip = d3.select(chart_div)
      	.append("div")
      	.attr("class", "d3tooltip")
      	.style("display", "none")
    	;

	    let svg = this.container
		    .append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		    .attr("transform",
		          "translate(" + margin.left + "," + margin.top + ")");

		let x = d3.scaleLinear()
		    .domain([0, 1])
		    .range([ 0, width]);
		let y = d3.scaleBand();

		let sect_labels_group = svg.append("g").attr("class","sect_labels");
		let y_labels_group = svg.append("g").attr("class","y_labels");
		let xaxis_group = svg.append("g").attr("class", "xaxis_group");
    	let bars_group = svg.append("g").attr("class", "bars_group");
    	let legend = svg.append("g").attr("class", "legend");

    	class_selector.dispatchEvent(new Event('change'));

	  	/*
	  	/////////////////////////////////
	  	// DATA MANIPULATION FUNCTIONS//
	  	////////////////////////////////
	  	*/

	  	function getSectorSubsetData(data, sector) {
		    let subdata = data.filter(d => d.ald_sector == sector);

		    return subdata
		};

		function getTechnologyDataForStacking(data,un_value_types) {

		    var subdata_tech = [];

		    $.each(un_value_types, function(index, item) {
		        subdata_tech[index] = {};
		        subdata_tech[index]["val_type"] = item;
		        $.each(data.filter(d => d.val_type == item), function() {
		          subdata_tech[index]["val_type_translation"] = this.val_type_translation;
		          subdata_tech[index][this.technology] = this.value;
		    	});
			});

		    return subdata_tech;
	    };

	    function getSubsetData(data, asset_class,scenario,benchmark,market) {
	      let subdata = data.filter(d => d.asset_class_translation == asset_class);
	      subdata = subdata.filter(d => d.scenario == scenario);
	      subdata = subdata.filter(d => d.this_portfolio == true | d.portfolio_name_translation == benchmark);
	      subdata = subdata.filter(d => d.equity_market_translation == market);

	      return subdata;
	    };

	    function getTechnologyTranslation(technology) {
	    	let idx = data.findIndex(d => d.technology === technology);
	    	return data[idx].technology_translation;
	    }

	    function getSectorTranslation(sector) {
	    	let idx = data.findIndex(d => d.ald_sector === sector);
	    	return data[idx].ald_sector_translation;
	    }

	    /*
	    /////////////////////////////
	    // GRAPH DRAWING FUNCTIONS //
	    /////////////////////////////
	    */


		function drawStackedBarGroupOnEmptyChart(bars_group, x, y, y_labels_group, data, subgroups, groups, graph_start_height, graph_width,bar_height, bar_gap, sector) {

		    y.range([ 0, groups.length * bar_height])
		      .domain(groups)

		    y_labels_group.append("g").attr("transform", "translate( " + -20 + ", " + graph_start_height +" )")

		      .call(d3.axisLeft(y).tickSize(0))
		      .call(g => g.select(".domain").remove());

		    var color = d3.scaleOrdinal(d3.schemeCategory10);

		    var stackedData = d3.stack()
		      .keys(subgroups)
		      (data)

		    if (stackedData.length != 0) {
		    	stackedData = replaceNaNInData(stackedData);
		    } else {
		    	error("Error during stacking the data: empty array was returned.")
		    }

		    // Show the bars
		    bars_group.append("g")
		        .selectAll("g")
		        // Enter in the stack data = loop key per key = group per group
		        .data(stackedData)
		        .enter().append("g")
		          .attr("class", d => sector + " " + d.key)
		          .attr("fill", function(d) { return color(d.key); })
		          .attr("technology", function(d) {return getTechnologyTranslation(d.key) })
		          .attr("sector", function(d) {return getSectorTranslation(sector) })
		          .selectAll("rect")
		          // enter a second time = loop subgroup per subgroup to add all rectangles
		          .data(function(d) { return d; })
		          .enter().append("rect")
		            .attr("x", function(d) { return x(d[0]); })
		            .attr("y", function(d) { return graph_start_height + y(d.data.val_type_translation); })
		            .attr("width", function(d) { return x(d[1]) - x(d[0]); })
		            .attr("height",bar_height-bar_gap)
		            .on("mouseover", mouseover)
        			.on("mouseout", mouseout)
        			.on("mousemove", mousemove)
		}


	    function drawBarGroupPerSector(bars_group,x,y,y_labels_group,data,sector, graph_start_height, graph_width,bar_height, bar_gap, scen_gap,legend_data) {

	    	let subdata = getSectorSubsetData(data, sector);
	    	let sector_translation = subdata[0].ald_sector_translation;
		    let un_value_types = d3.map(subdata, d => d.val_type).keys();
		    let subdata_tech = getTechnologyDataForStacking(subdata,un_value_types);

		    var subgroups = d3.keys(subdata_tech[0]).slice(2);


		    let subdata_plan = subdata_tech.filter(d => !d.val_type.includes("Aligned"));
		    let subdata_scen = subdata_tech.filter(d => d.val_type.includes("Aligned"));

		    let groups_plan = d3.map(subdata_plan, function(d){return(d.val_type_translation)}).keys();
		    let groups_scen = d3.map(subdata_scen, function(d){return(d.val_type_translation)}).keys();

		    drawStackedBarGroupOnEmptyChart(bars_group, x, y, y_labels_group,subdata_plan, subgroups, groups_plan, graph_start_height, graph_width, bar_height, bar_gap,sector)
		    drawStackedBarGroupOnEmptyChart(bars_group, x, y, y_labels_group,subdata_scen, subgroups, groups_scen, graph_start_height + groups_plan.length * bar_height + scen_gap, graph_width, bar_height, bar_gap,sector)

        	$.each(subgroups, function(index, item) {
        		var technology_translation = subdata.filter(d=>d.technology==item)[0]["technology_translation"]
		    	let data_to_append = {'sector': sector,'technology':item,'class': sector + " " + item, 'sector_translation': sector_translation, 'technology_translation': technology_translation};
		      	legend_data.push(data_to_append)
		    });

		    return legend_data;
	    }

	    function change_class() {
	    	let selected_class = class_selector.value;
	    	let selected_benchmark = benchmark_selector.value;
	    	let selected_scenario = scenario_selector.value;

	      	let data_filtered = data.filter(d => d.asset_class_translation == selected_class);

	      	let scenario_names = d3.map(data_filtered, d => d.scenario).keys().sort();
	    	scenario_selector.length = 0;
	    	scenario_names.forEach(scenario_name => scenario_selector.add(new Option(scenario_name, scenario_name)));
	    	scenario_selector.options[Math.max(scenario_names.indexOf(selected_scenario), 0)].selected = 'selected';

	      	let benchmark_names = d3.map(data_filtered.filter(d => !d.this_portfolio), d => d.portfolio_name_translation).keys().sort();
      		benchmark_selector.length = 0;
      		benchmark_names.forEach(benchmark_name => benchmark_selector.add(new Option(benchmark_name, benchmark_name)));
      		benchmark_selector.options[Math.max(benchmark_names.indexOf(selected_benchmark), 0)].selected = 'selected';

	      	// reset selectors based on current asset class selection
	      	let market_names = d3.map(data_filtered, d => d.equity_market_translation).keys().sort();
		    market_selector.length = 0;
		    market_names.forEach(market_name => market_selector.add(new Option(market_name, market_name)));
		    market_selector.options[Math.max(market_names.indexOf(default_market), 0)].selected = 'selected';

	    	market_selector.dispatchEvent(new Event('change'));
	    };

	    function update() {
	    	let selected_class = class_selector.value;
	    	let selected_scenario = scenario_selector.value;
	    	let selected_benchmark = benchmark_selector.value;
	      	let selected_market = market_selector.value;

	    	let subdata = getSubsetData(data, selected_class,selected_scenario,selected_benchmark,selected_market);
		    let unique_sectors = d3.map(subdata, d => d.ald_sector).keys();
		    let unique_sectors_translation = d3.map(subdata, d => d.ald_sector_translation).keys();

		    var bar_height_space = (height - (unique_sectors.length -1)* sect_gap - (unique_sectors.length -1)* scen_gap)/(nr_bars_sec * unique_sectors.length);

			let t = d3.transition().duration(500);
		    // Show the bars
		    let bars_rect = bars_group.selectAll("rect").data([]);
		    // Enter in the stack data = loop key per key = group per group
		    bars_rect.exit().transition(t).attr("width",0).remove();

		    let bars_tech_groups = bars_group.selectAll("g").data([]);
		    bars_tech_groups.exit().remove();

		    sect_labels_group.selectAll("text").remove();
		    y_labels_group.selectAll("g").remove();

		    var legend_data_unordered = [];

		    for (var i=0;i<unique_sectors.length;i++) {

		    	legend_data_unordered = drawBarGroupPerSector(bars_group,x,y,y_labels_group,subdata,unique_sectors[i],
		    		i*(bar_height_space*nr_bars_sec+scen_gap+sect_gap),width,bar_height_space,bar_gap, scen_gap,legend_data_unordered);

		    	sect_labels_group.append("text")
			      	.attr("transform", "rotate(-90)")
			      	.attr("y",-20)
			      	.attr("x", 0 - (i+0.5)*(bar_height_space*nr_bars_sec+scen_gap+sect_gap))
			      	.attr("dy", "1em")
			      	.attr("font-size","10")
			      	.style("text-anchor", "middle")
			      	.text(unique_sectors_translation[i]);
		    }

		    let legend_data = orderLegendDataIfPossible(legend_data_unordered,legend_order);

		    var formatter = d3.format(".0%");

		    xaxis_group.attr("transform", "translate(0," + (height + 10) + ")")
		    .call(d3.axisBottom(x).tickFormat(formatter).ticks(5))
		    .selectAll("text")
		    .style("text-anchor", "end");

		    let legend_rects = legend.selectAll("rect").data([]);
		    legend_rects.exit().remove();

		    let legend_text = legend.selectAll("text").data([]);
		    legend_text.exit().remove();

		    let legend_sector_labels = legend.selectAll(".sector_labels_legend").data([]);
		    legend_sector_labels.exit().remove();

		    legend.attr("transform","translate(" + (width + 20) + ",-10)");

      		let sector_gap_legend = 25;

		    $.each(legend_data, function(index,item) {
		        legend_data[index]["sector_shift"] = unique_sectors.indexOf(item.sector);
		    });

		    let tech_in_prev_sectors = [];
		    tech_in_prev_sectors[0] = 0;
		    for (var i=1;i<unique_sectors.length;i++) {
		        tech_in_prev_sectors[i] = tech_in_prev_sectors[i-1] + legend_data.filter((obj) => obj.sector === unique_sectors[i-1]).length
		    }

		    legend.selectAll("rect")
		        .data(legend_data)
		        .enter()
		        .append("rect")
		        .attr("class",d=>d.class)
		        .attr("width", 15)
		        .attr("height", 15)
		        .attr("x", 0)
		        .attr("y", (d,i) => i * 25 + d.sector_shift * sector_gap_legend + 20)
		      ;

		      legend.selectAll("text")
		        .data(legend_data)
		        .enter()
		        .append("text")
		        .text(d => d.technology_translation)
		        .style("alignment-baseline", "central")
		        .style("text-anchor", "start")
		        .attr("font-size", "0.7em")
		        .attr("x", 25)
		        .attr("y", (d,i) => i * 25 + 8 + d.sector_shift * sector_gap_legend + 20)
		      ;

		    legend.append("g").attr("class", "sector_labels_legend")
	        .selectAll("text")
	          .data(unique_sectors_translation)
	          .enter()
	          .append("text")
	          .text(d => d)
	          .style("alignment-baseline", "central")
	          .style("text-anchor", "start")
	          .attr("font-size", "0.7em")
	          .attr("x", 0)
	          .attr("y", (d,i) => tech_in_prev_sectors[i] * 25 + 8 + i * sector_gap_legend)
	        ;
	    }

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
