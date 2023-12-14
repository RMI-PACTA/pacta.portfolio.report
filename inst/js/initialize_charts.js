var imported;

//external libs optbar - installed using npm
imported = document.createElement("script"); imported.src = "js/popper.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/bootstrap-select.min.js"; document.head.appendChild(imported);
imported = document.createElement("link"); imported.rel = "stylesheet"; imported.href = "css/bootstrap-select.min.css"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/bootstrap.min.js"; document.head.appendChild(imported);
imported = document.createElement("link"); imported.rel = "stylesheet"; imported.href = "css/bootstrap.min.css"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/jquery-3.5.1.js"; document.head.appendChild(imported);

// external libs
imported = document.createElement("link"); imported.rel = "stylesheet"; imported.href = "css/fontawesome.all.min.css"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.type = "text/javascript"; imported.src = "js/mdb.min.js"; document.head.appendChild(imported);
imported = document.createElement("link"); imported.rel = "stylesheet"; imported.href = "css/mdb.min.css"; document.head.appendChild(imported);
imported = document.createElement("link"); imported.rel = "stylesheet"; imported.href = "css/tippy_light.css"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/tippy.js/index.all.min.js"; document.head.appendChild(imported);

imported = document.createElement("script"); imported.src = "js/d3.v4.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/d3-geo-projection.v2.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/d3-array.v2.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/d3-scale-chromatic.v1.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/d3-format.v1.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/d3-scale.v3.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/canvas-toBlob.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/FileSaver.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/canvg.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/html2canvas.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/countries-110m.js"; document.head.appendChild(imported);

// internal libs
imported = document.createElement("script"); imported.src = "js/exportData.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/data_table.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/PieExploded2.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/map.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/company_bubble.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/time_line.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/stackedbars.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/text_dropdown_jiggle.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/techexposure.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/topojson-client.min.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/trajectory_alignment.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/peer_bubbles.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/stackedbars_key_drivers.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/techexposure_future.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/get_graph_labels.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/saveCharts.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/included_table.js"; document.head.appendChild(imported);
imported = document.createElement("script"); imported.src = "js/speedometer_dashboard.js"; document.head.appendChild(imported);

let this_portfolio_color = '#1b324f';
let peers_color = '#8597a6';
let axis_color = "#A9A9A9";

function createNoDataNoticeNode(graph_id,text_dict) {
  nodata_notice = document.createElement("div");
  nodata_notice.classList.add("nodatanotice");
  nodata_notice.classList.add("has_optbar");
  nodata_notice.classList.add("donotremove");
  nodata_text = document.createTextNode(text_dict.no_data_message);
  example_chart_link = document.createElement('a');
  example_chart_link.href = "img/" + graph_id + ".png";
  example_chart_link.setAttribute("target", "_blank");
  example_chart_link.appendChild(document.createTextNode(text_dict.here));
  nodata_notice.appendChild(nodata_text);
  nodata_notice.appendChild(example_chart_link);

  return nodata_notice;
}

function replaceEquityBondDivsWithNoDataMessage(graph_id,text_dict) {
  let nodata_notice = createNoDataNoticeNode(graph_id,text_dict);

  first_chart_div = document.querySelector("div[id='" + graph_id + "_equity']");
  first_chart_div.parentNode.insertBefore(nodata_notice, first_chart_div);
  document.querySelector("div[id='" + graph_id + "_equity']").remove();
  document.querySelector("div[id='" + graph_id + "_bonds']").remove();
}

function replaceDivWithNoDataMessage(graph_id,text_dict) {
  let nodata_notice = createNoDataNoticeNode(graph_id,text_dict);

  chart_div = document.querySelector("div[id='" + graph_id + "']");
  chart_div.parentNode.insertBefore(nodata_notice, chart_div);
  document.querySelector("div[id='" + graph_id + "']").remove();
}

function plotGraphIfDataAndDiv(data_str,Graph,graph_id,labels,opts,on_error_message,nodata_text_dict) {
  try {
    eval("data = " + data_str);

    try {
      if (typeof data != "undefined" && data.length > 0 && document.querySelector("div[id='"+ graph_id +"']") != null) {
        window[graph_id] = new Graph("div[id='"+ graph_id +"']", data, labels,opts);
      } else if (document.querySelector("div[id='"+ graph_id +"']") != null) {
        replaceDivWithNoDataMessage(graph_id,nodata_text_dict);
      }
    }
    catch(err) {
      handleError(err,graph_id,on_error_message)
    }
  }
  catch(err) {
    replaceDivWithNoDataMessage(graph_id,nodata_text_dict);
  }
}

function plotGraphForAssetClassIfDataAndDiv(data,Graph,graph_id,labels,opts,on_error_message,assetClass,optional_data2,optional_table_specs) {
  try {
    if (data.length > 0 && document.querySelector("div[id='"+ graph_id +"']") != null && (d3.map(data, d => d.asset_class).keys().includes(assetClass))) {
      if ((typeof optional_data2 !== "undefined") && (typeof optional_table_specs !== "undefined")) {
        window[graph_id] = new Graph("div[id='"+ graph_id +"']", data, labels,opts,optional_table_specs["div"],optional_data2,optional_table_specs["labels"],optional_table_specs["opts"]);
      }
      else if (typeof optional_data2 !== "undefined") {
        window[graph_id] = new Graph("div[id='"+ graph_id +"']", data, labels,opts,optional_data2);
      } else {
        window[graph_id] = new Graph("div[id='"+ graph_id +"']", data, labels,opts);
      }
    } else if (document.querySelector("div[id='"+ graph_id +"']") != null) {
      document.querySelector("div[id='"+ graph_id +"']").remove();
    }
  }
  catch(err) {
    handleError(err,graph_id,on_error_message)
  }
}

function plotGraphsForBondsAndEquity(data_str,Graph,graph_id,labels,opts_equity,opts_bonds,on_error_message,nodata_text_dict,optional_data_str_2,
  optional_table_specs_eq,optional_table_specs_bond) {
  try {
    eval("data = " + data_str);

    if (typeof data != "undefined") {
      if (graph_id == "stackedbars_key_drivers") {
        eval("data2 = " + optional_data_str_2)
        plotGraphForAssetClassIfDataAndDiv(data,Graph,graph_id + "_equity",labels[graph_id],opts_equity,
            on_error_message,"Listed Equity",data2)
        plotGraphForAssetClassIfDataAndDiv(data,Graph,graph_id + "_bonds",labels[graph_id],opts_bonds,
            on_error_message,"Corporate Bonds",data2)
      } else {
        plotGraphForAssetClassIfDataAndDiv(data,Graph,graph_id + "_equity",labels[graph_id],opts_equity,
            on_error_message,"Listed Equity")
        plotGraphForAssetClassIfDataAndDiv(data,Graph,graph_id + "_bonds",labels[graph_id],opts_bonds,
            on_error_message,"Corporate Bonds")
      }
    } else if (document.querySelector("div[id='" + graph_id +"_equity']") != null) {
      replaceEquityBondDivsWithNoDataMessage(graph_id,nodata_text_dict);
    }
  }
  catch(err) {
    replaceEquityBondDivsWithNoDataMessage(graph_id,nodata_text_dict);
  }
}

function handleError(err,graph_id,on_error_message) {
    console.log(err.message)
    console.log(err.stack)

    let error_notice = document.createElement("div");
    error_notice.setAttribute("id","error_" + graph_id)
    error_notice.classList.add("nodatanotice");
    error_notice.classList.add("has_optbar");
    error_notice.classList.add("donotremove");
    let error_text = document.createTextNode(on_error_message);
    error_notice.appendChild(error_text);

    let first_chart_div = document.querySelector("div[id='" + graph_id + "']");
    first_chart_div.parentNode.insertBefore(error_notice, first_chart_div);

    document.querySelector("div[id='" + graph_id + "']").remove();
}

window.addEventListener('load', (event) => {

  if (typeof tippy != "undefined") {
    tippy.setDefaults({
      size: 'large',
      allowHTML: true,
      interactive: true,
      placement: 'top',
      theme: 'light',
      arrow: true,
      arrowType: 'round',
      animation: 'perspective',
      duration: 200
    })
  }

  let nodata_notice, nodata_text, example_chart_link, first_chart_div, graph_id, labels, opts;

  if (typeof js_labels !== "undefined") {
    labels = getGraphLabels(js_labels);
  } else {
    labels = getGraphLabels();
  }

  let nodata_text_dict = {no_data_message: labels["default_opts"]["no_data_message"], here: labels["default_opts"]["here"]};

  display_currency = (typeof display_currency === "undefined") ? "USD" : display_currency;

  let on_error_message = labels["default_opts"]["on_error_message"];

  let feedback_message = labels["default_opts"]["feedback_message"];
  window.feedback_message = feedback_message;

  if (typeof data_parameters != "undefined") {
    Object.keys(data_parameters).forEach(key => document.querySelectorAll("#" + key).forEach(el => el.innerHTML = data_parameters[key]));
  }

  // Exhibit 1 - asset classes included in analysis (table) --------
  if (typeof data_included_table != "undefined" && document.querySelector("div[id='included_table']") != null) {
    let opts_table = {
      columnsText: [1, 6],
      columnsNumeric: [2, 5],
      columnsPercent: [3],
      columnsShortText: [4],
      columnValueBreakdown: 5,
      columnToMergeHeaderWithContent: 5,
      columnToMergeHeaderNoContent: 6
    }
    tabulateIntoIncludedTable(data_included_table, "div[id='included_table']", opts_table);
  }

  // Exhibit 2 - exposure to key sectors by value (exploded pie) ----------------
  let opts_value_pie_eq = {
    unit: display_currency,
    default_class: labels["default_opts"]["listed_equity"]
  };
  let labels_value_pie_eq = {...labels["pie"], ...labels["value_pie"]};
  labels_value_pie_eq["asset_class"] = labels_value_pie_eq["asset_class"]["equity"];
  plotGraphIfDataAndDiv("data_value_pie_equity.reverse()",PieExploded,"value_pie_equity",labels_value_pie_eq,opts_value_pie_eq,on_error_message,nodata_text_dict);

  let opts_value_pie_bond = {
    unit: display_currency,
    default_class: labels["default_opts"]["corporate_bonds"]
  };
  let labels_value_pie_bond = {...labels["pie"], ...labels["value_pie"]};
  labels_value_pie_bond["asset_class"] = labels_value_pie_bond["asset_class"]["bonds"];
  plotGraphIfDataAndDiv("data_value_pie_bonds.reverse()",PieExploded,"value_pie_bonds",labels_value_pie_bond,opts_value_pie_bond,on_error_message,nodata_text_dict);
  // Exhibit 3 - exposure to key sectors by emissions (exploded pie) ------------

  let opts_emiss_pie_eq = {
    unit: labels["default_opts"]["sector_emissions"],
    default_class: labels["default_opts"]["listed_equity"]
  };
  let labels_emiss_pie_eq = {...labels["pie"], ...labels["emissions_pie"]};
  labels_emiss_pie_eq["asset_class"] = labels_emiss_pie_eq["asset_class"]["equity"];
  plotGraphIfDataAndDiv("data_emissions_pie_equity.reverse()",PieExploded,"emissions_pie_equity",labels_emiss_pie_eq,opts_emiss_pie_eq,on_error_message,nodata_text_dict);

  let opts_emiss_pie_bond = {
    unit: labels["default_opts"]["sector_emissions"],
    default_class: labels["default_opts"]["corporate_bonds"]
  };
  let labels_emiss_pie_bond = {...labels["pie"], ...labels["emissions_pie"]};
  labels_emiss_pie_bond["asset_class"] = labels_emiss_pie_bond["asset_class"]["bonds"];
  plotGraphIfDataAndDiv("data_emissions_pie_bonds.reverse()",PieExploded,"emissions_pie_bonds",labels_emiss_pie_bond,opts_emiss_pie_bond,on_error_message,nodata_text_dict);

  // Exhibit 5 - exposure to sectors and techs (bar charts) ---------------------

  let opts_tech_equity = { default_class: labels["default_opts"]["listed_equity"] ,legend_order: sector_order};
  let opts_tech_bonds = { default_class: labels["default_opts"]["corporate_bonds"] ,legend_order: sector_order};

  plotGraphsForBondsAndEquity("data_techexposure",techexposure,"techexposure",labels,opts_tech_equity,opts_tech_bonds,on_error_message,nodata_text_dict);

  // Exhibit 6 - exposure to sectors and techs by location (map) ----------------

  let opts_map_equity = { default_class: labels["default_opts"]["listed_equity"], default_tech: labels["default_opts"]["all_automotive"] };
  let opts_map_bonds = { default_class: labels["default_opts"]["corporate_bonds"],default_tech: labels["default_opts"]["all_automotive"] };

  plotGraphsForBondsAndEquity("data_map",choropleth,"map",labels,opts_map_equity,opts_map_bonds,on_error_message,nodata_text_dict);

  // Exhibit 9 - production/scenario alignment (line/area/timelines) ----------

  let opts_traject_equity = {
    default_class: labels["default_opts"]["listed_equity"],
    default_tech: labels["default_opts"]["ice"],
    scenarios_to_include: ["STEPS", "APS", "SDS", "NZE_2050", "CurPol", "NDC-LTS", "1.5C-Unif", "ETP_SDS", "NZE", "IPR FPS 2021"]
  };
  let opts_traject_bonds = {
    default_class: labels["default_opts"]["corporate_bonds"],
    default_tech: labels["default_opts"]["ice"],
    scenarios_to_include: ["STEPS", "APS", "SDS", "NZE_2050", "CurPol", "NDC-LTS", "1.5C-Unif", "ETP_SDS", "NZE", "IPR FPS 2021"]
  };

  plotGraphsForBondsAndEquity("data_trajectory_alignment",trajectory_alignment,"trajectory_alignment",labels,opts_traject_equity,opts_traject_bonds,on_error_message,nodata_text_dict);

  // Exhibit 5a - future exposure to sectors and techs (bar charts)

  let opts_tech_fut_equity = {
    default_class: labels["default_opts"]["listed_equity"],
    default_market: labels["default_opts"]["global_market"],
    legend_order: sector_order,
    default_scenario: "ETP2017_B2DS"
  };
  let opts_tech_fut_bonds = {
    default_class: labels["default_opts"]["corporate_bonds"],
    default_market: labels["default_opts"]["global_market"],
    legend_order: sector_order,
    default_scenario: "ETP2017_B2DS"
  };

  plotGraphsForBondsAndEquity("data_techexposure_future",techexposure_future,"techexposure_future",labels,opts_tech_fut_equity,opts_tech_fut_bonds,on_error_message,nodata_text_dict);

  // Exhibit 11 - emissions trajectory (line timeline) ------------------------

  let opts_em_time_equity = { default_class: labels["default_opts"]["listed_equity"]};
  let opts_em_time_bonds = { default_class: labels["default_opts"]["corporate_bonds"]};

  plotGraphsForBondsAndEquity("data_emissions",time_line,"emissions_time_line",labels,opts_em_time_equity,opts_em_time_bonds,on_error_message,nodata_text_dict);

  // Exhibit 13 - company comparisons (bubble scatter) --------------------------

  let opts_comp_bub_eq = {
    default_class: labels["default_opts"]["listed_equity"],
    hghlt_color: this_portfolio_color,
    bblfill: peers_color,
    bblfill: this_portfolio_color,
    bblstroke: this_portfolio_color,
    bkg_fill: false,
    xintcpt: true,
    yintcpt: true,
    zvar: "port_weight",
    axis_color: axis_color,
    year_span: 5
  };

  let opts_comp_bub_bond = {
    default_class: labels["default_opts"]["corporate_bonds"],
    hghlt_color: this_portfolio_color,
    bblfill: peers_color,
    bblfill: this_portfolio_color,
    bblstroke: this_portfolio_color,
    bkg_fill: false,
    xintcpt: true,
    yintcpt: true,
    zvar: "port_weight",
    axis_color: axis_color,
    year_span: 5
  };

  plotGraphsForBondsAndEquity("data_company_bubble",company_bubble,"company_bubble",labels,opts_comp_bub_eq,opts_comp_bub_bond,on_error_message,nodata_text_dict);

  // Exhibit 13b - company charts ------------------------------

  let opts_key_bars_equity = {default_class: labels["default_opts"]["listed_equity"], default_sector: labels["default_opts"]["automotive"]};
  let opts_key_bars_bonds = {default_class: labels["default_opts"]["corporate_bonds"], default_sector: labels["default_opts"]["automotive"]};

  plotGraphsForBondsAndEquity("data_key_bars_company",stackedbars_key_drivers,"stackedbars_key_drivers",labels,opts_key_bars_equity,opts_key_bars_bonds,on_error_message,nodata_text_dict,"data_key_bars_portfolio");

  // Exhibit 14 - peer portfolio comparison (stacked bar charts) ----------------

  let opts_peercomp_equity = { default_class: labels["default_opts"]["listed_equity"], default_group: labels["default_opts"]["total"]};
  let opts_peercomp_bond = { default_class: labels["default_opts"]["corporate_bonds"], default_group: labels["default_opts"]["total"]};

  plotGraphsForBondsAndEquity("data_peercomparison",stacked_bars,"peercomparison",labels,opts_peercomp_equity,opts_peercomp_bond,on_error_message,nodata_text_dict);

  // Exhibit 14b - peer current to future production alignment (bubble) -------

  let opts_peer_bubble_equity = {
    default_class: labels["default_opts"]["listed_equity"],
    hghlt_color: this_portfolio_color,
    bblfill: peers_color,
    bkg_fill: false,
    xintcpt: true,
    yintcpt: true,
    axis_color: axis_color,
    year_span: 5
  };

  let opts_peer_bubble_bond = {
    default_class: labels["default_opts"]["corporate_bonds"],
    hghlt_color: this_portfolio_color,
    bblfill: peers_color,
    bkg_fill: false,
    xintcpt: true,
    yintcpt: true,
    axis_color: axis_color,
    year_span: 5
  };

  plotGraphsForBondsAndEquity("data_peer_bubbles",peer_bubbles,"peer_bubbles",labels,opts_peer_bubble_equity,opts_peer_bubble_bond,on_error_message,nodata_text_dict);

  // Exhibit 14c - peer rank table (bubble) -----------------------------------
  try {
    if (typeof data_peer_table != "undefined" && document.querySelector("div[id='peer_table']") != null) {
      tabulate(data_peer_table, "div[id='peer_table']");
      let container_div = document.querySelector("div[id='peer_table']");
      d3.select(container_div).attr("chart_type_data_download", "peer_table");
    }
  }
  catch(err) {
    handleError(err,'peer_table',on_error_message)
  }
  // Exhibit 14c - end

  if (typeof tippy != "undefined") {
    tippy('[data-tippy-content]');
  }

});

// initialize options bars
window.addEventListener('load', (event) => {
    for (let el of document.getElementsByClassName("has_optbar")) {
      initialize_options_bar(el);
    }
});


function initialize_options_bar(el) {
  const optbar_template = document.querySelector('#optbar_template');
  const optionsbar_template = document.querySelector('#optionsbar_template');
  const feedback_template = document.querySelector('#feedback_template');

  const el_id = el.id;
  const optbar_node = optbar_template.cloneNode(true).content;

  // add object_id attribute/property to elements
  optbar_node.querySelector('div.optbar').setAttribute("object_id", el_id);
  $(optbar_node).find("i").attr("object_id", el_id);

  // optionsbar button
  optbar_node.querySelector('div.optbar i.fa-cog')
      .addEventListener('click', function(ev){
        var optionsbar = ev.target.parentNode.parentNode.querySelector("div.optionsbar");
        if (optionsbar.classList.contains("show")) {
          optionsbar.style.overflow = "hidden";
        } else {
          setTimeout(function(){ optionsbar.style.overflow = "visible"; }, 600)
        }
        optionsbar.classList.toggle("show");
      }, true);

  // feedback button
  optbar_node.querySelector('div.optbar i.feedback_btn')
      .addEventListener('click', function(ev){
        var feedback_form = ev.target.parentNode.parentNode.querySelector(".feedback_form");
        if (feedback_form.classList.contains("show")) {
          feedback_form.style.overflow = "hidden";
        } else {
          setTimeout(function(){ feedback_form.style.overflow = "visible"; }, 600)
        }
        feedback_form.classList.toggle("show");
      }, true);

  // add chart button
  if (el.classList.contains("donotduplicate")) { optbar_node.querySelector('div.optbar i.addchart_btn').style.display = "none"; }
  optbar_node.querySelector('div.optbar i.addchart_btn')
      .addEventListener('click', function(ev){
        let chart_container = ev.target.parentNode.parentNode;
        let chart_div = chart_container.querySelector(".chart_div");
        //let chart_caption = chart_container.querySelector(".chart_caption");
        //let chart_source = chart_container.querySelector(".chart_source");
        let chart_type = chart_container.attributes.chart_type.value;

        let new_chart_div = document.createElement("div");
        new_chart_div.className =  "has_optbar";
        //new_chart_div.append(chart_caption.cloneNode(true));
        //new_chart_div.append(chart_source.cloneNode(true));

        let new_table_div;

        new_table_div = document.createElement("div");
        new_table_div.classList.add('d3chart');
        new_table_div.classList.add('data_table');

        chart_container.insertAdjacentElement("beforebegin",new_table_div);
        new_table_div.insertAdjacentElement("afterend",document.createElement("br"));
        new_table_div.insertAdjacentElement("beforebegin",new_chart_div);

        let labels;

        if (typeof js_labels !== "undefined") {
          labels = getGraphLabels(js_labels)
        } else {
          labels = getGraphLabels();
        }

        switch(chart_type) {
          case "choropleth":
            new choropleth(new_chart_div, data_map, labels["map"],{ default_class: labels["default_opts"]["listed_equity"], default_tech:labels["default_opts"]["all_automotive"] });
            break;
          case "trajectory_alignment":
            new trajectory_alignment(new_chart_div, data_trajectory_alignment,labels["trajectory_alignment"], {default_tech: labels["default_opts"]["ice"], default_class: labels["default_opts"]["listed_equity"]});
            break;
          case "techexposure":
            new techexposure(new_chart_div, data_techexposure,labels["techexposure"],{ default_class: labels["default_opts"]["listed_equity"] });
            break;
          case "techexposure_future":
            var opts = {
              default_class: labels["default_opts"]["listed_equity"],
              default_market: labels["default_opts"]["global_market"],
              legend_order: sector_order,
              default_scenario: "ETP2017_B2DS"
            }
            new techexposure_future(new_chart_div, data_techexposure_future, labels["techexposure_future"], opts);
            break;
          case "PieExploded":
            //new PieExploded(new_chart_div, data_trajectory_alignment);
            break;
          case "portfolio_bubble":
            var opts = {
              default_class: labels["default_opts"]["listed_equity"],
              hghlt_color: this_portfolio_color,
              bblfill: peers_color,
              xintcpt: true,
              yintcpt: true,
              axis_color: axis_color
            };
            new portfolio_bubble(new_chart_div, data_portfolio_bubble,labels["portfolio_bubble"],opts);
            break;
          case "stacked_bars":
            new stacked_bars(new_chart_div, data_peercomparison, labels["peercomparison"],{ default_class: labels["default_opts"]["listed_equity"], default_group: labels["default_opts"]["Total"]});
            break;
          case "time_line":
            new time_line(new_chart_div, data_emissions,labels["emissions_time_line"], { default_class: labels["default_opts"]["listed_equity"] });
            break;
          case "company_bubble":
              var opts = {
              default_class: labels["default_opts"]["listed_equity"],
              hghlt_color: this_portfolio_color,
              bblfill: peers_color,
              bblfill: this_portfolio_color,
              bblstroke: this_portfolio_color,
              bkg_fill: false,
              xintcpt: true,
              yintcpt: true,
              zvar: "port_weight",
              axis_color: axis_color
            };
            new company_bubble(new_chart_div, data_company_bubble, labels["company_bubble"], opts);
            break;
          case "stacked_bars_key_drivers":
            new stackedbars_key_drivers(new_chart_div,data_key_bars_company,labels["key_bars"], {default_class: labels["default_opts"]["listed_equity"], default_sector: labels["default_opts"]["automotive"]},data_key_bars_portfolio);
            break;
          case "peer_bubbles":
            var opts = {
              default_class: labels["default_opts"]["listed_equity"],
              hghlt_color: this_portfolio_color,
              bblfill: peers_color,
              bkg_fill: false,
              xintcpt: true,
              yintcpt: true,
              axis_color: axis_color
            };
            new peer_bubbles(new_chart_div, data_peer_bubbles,labels["peer_bubbles"], opts);
            break;
          default:
            // code block
        }

        for (let selector of new_chart_div.querySelectorAll("select.inline_text_dropdown")) {
          initialize_inline_text_dropdown(selector);
        }
        initialize_options_bar(new_chart_div);

      }, true);

  // remove chart button
  if (el.classList.contains("donotremove")) { optbar_node.querySelector('div.optbar i.removechart_btn').style.display = "none"; }
  optbar_node.querySelector('div.optbar i.removechart_btn')
      .addEventListener('click', function(ev){ el.remove(); }, true);

  // append optbar
  el.appendChild(optbar_node);

  // add the options/settings bar
  var optionsbar_node = optionsbar_template.cloneNode(true).content;
  el.prepend(optionsbar_node);

  // add chart menu if one exists
  var chartmenu_template = document.querySelector("#chartmenu_template_" + el_id);
  if (chartmenu_template != null) {
    const chartmenu_node = chartmenu_template.cloneNode(true).content;
    el.querySelector("div.optionsbar").append(chartmenu_node);
  }

  // add the feedback form
  var feedback_node = feedback_template.cloneNode(true).content;
  feedback_node.getElementById("id_frm_elem").value = el_id;
  el.prepend(feedback_node);

  // hide all elements on mouseleave of object
  el.addEventListener('mouseleave', function(ev){
    var el = ev.target;
    var optionsbar = el.querySelector("div.optionsbar");
    var feedbackform = el.querySelector(".feedback_form");
    var circle_nav = el.querySelector("div.cn-wrapper");

    var timer_id = setTimeout(function(){
      optionsbar.style.overflow = "hidden";
      optionsbar.classList.remove("show");
      feedbackform.style.overflow = "hidden";
      feedbackform.classList.remove("show");
      //circle_nav.classList.remove("opened-nav");
      }, 2000);

    el.setAttribute("timer_id", timer_id);
  }, false);

  el.addEventListener('mouseenter', function(ev){
    var el = ev.target;
    clearTimeout(el.getAttribute("timer_id"));
  }, false);

  tippy('.optbar_btn', { theme: 'optbar_btn', placement: 'right', arrow: false });
}


function submit_chart_feedback(submitButton) {
  var form = submitButton.parentNode.parentNode.parentNode;
  var id = form.querySelector("#id_frm_elem").value;
  var like = form.satisfaction.value;
  var text = form.querySelector("#text_frm_elem").value;
  var book_class = document.getElementById("book_class").value;
  var userstring = navigator.userAgent;
  var url = window.location.href;

  var baseurl = "https://docs.google.com/forms/d/1jmhjhMIvOgRBVdLFjXr7XXeMrJU9WgQRBdFYMfLL3cY/formResponse?";

  var submiturl = encodeURI(baseurl + 'entry.1007359718=' + book_class + '&' + 'entry.1298091861=' + id + '&' + 'entry.272034624=' + like + '&' + 'entry.183296547=' + text + '&' + 'entry.704535812=' + encodeURIComponent(userstring) + '&' + 'entry.1802209886=' + encodeURIComponent(url));

  document.getElementById('hidden_iframe').src = submiturl;

  let thankyoudiv = document.createElement("div");
  thankyoudiv.style.width = "700px";
  thankyoudiv.style["text-align"] = "center";
  thankyoudiv.appendChild(document.createTextNode(window.feedback_message));
  form.insertAdjacentElement("beforeend",thankyoudiv);

}



// gloabl utility functions
function tech_id2name(tech_id) {
  switch(tech_id) {
    case "Electric":
      return "Electric";
    case "Hybrid":
      return "Hybrid";
    case "ICE":
      return "ICE";
    case "FuelCell":
      return "Fuel Cell";
    case "Freight":
      return "Freight";
    case "Mix":
      return "Mix";
    case "Passenger":
      return "Passenger";
    case "Grinding":
      return "Grinding";
    case "Integrated facility":
      return "Integrated facility";
    case "Coal":
      return "Coal";
    case "Gas":
      return "Gas";
    case "Oil":
      return "Oil";
    case "CoalCap":
      return "Coal Power";
    case "GasCap":
      return "Gas Power";
    case "HydroCap":
      return "Hydro Power";
    case "NuclearCap":
      return "Nuclear Power";
    case "OilCap":
      return "Oil Power";
    case "RenewablesCap":
      return "Renewables Power";
    case "Ac-Electric Arc Furnace":
      return "Ac-Electric Arc Furnace";
    case "Bof Shop":
      return "Bof Shop";
    case "Dc-Electric Arc Furnace":
      return "Dc-Electric Arc Furnace";
    case "Open Hearth Meltshop":
      return "Open Hearth Meltshop";
    default:
      return tech_id;
  }
}
