function tabulateIntoIncludedTable(data, id, opts) {

  // set options
  opts = (typeof opts === 'undefined') ? {} : opts;
  var columnsText = (typeof opts.columnsText === 'undefined') ? [1, 6] : opts.columnsText,
  columnsNumeric = (typeof opts.columnsNumeric === 'undefined') ? [2, 5] : opts.columnsNumeric,
  columnsPercent = (typeof opts.columnsPercent === 'undefined') ? [3] : opts.columnsPercent,
  columnsShortText = (typeof opts.columnsShortText === 'undefined') ? [4] : opts.columnsShortText,
  columnValueBreakdown = (typeof opts.columnValueBreakdown === 'undefined') ? 5 : opts.columnValueBreakdown,
  columnToMergeHeaderWithContent = (typeof opts.columnToMergeHeaderWithContent === 'undefined') ? 5 : opts.columnToMergeHeaderWithContent,
  columnToMergeHeaderNoContent = (typeof opts.columnToMergeHeaderNoContent === 'undefined') ? 6 : opts.columnToMergeHeaderNoContent;    

	var columns = Object.keys(data[0]);
  d3.select(id).selectAll("table").remove();

  var idDiv = d3.select(id)
    .attr("class","d3chart included_table")
    .style("width","700px");
    
  var table = idDiv.append("table"),
  thead = table.append("thead"),
  tbody = table.append("tbody");

  thead.append("tr")
    .selectAll("th")
    .data(columns)
    .enter()
    .append("th")
    .text(function(column) { return column; })
    .style("text-align", "center")
  ;

  if (!(columnToMergeHeaderWithContent == null) && !(columnToMergeHeaderNoContent == null)) {
    table.selectAll("thead th:nth-child(" + columnToMergeHeaderWithContent + ")").attr("colspan", 2);
    table.selectAll("thead th:nth-child(" + columnToMergeHeaderNoContent + ")").remove();
  }

  var rows = tbody.selectAll("tr")
    .data(data)
    .enter()
    .append("tr");

  var cells = rows.selectAll("td")
    .data(row => {
      return columns.map(column => {
        return { value: row[column] };
      });
    })
    .enter()
    .append("td")
    .html(d => d.value)
    .attr("border","none")
    .style("text-align", "left")
  ;

  columnsText.forEach(col => leftAlignBody(col));
  columnsNumeric.forEach(col => {formatMillionsBody(col); rightAlignBody(col)});
  columnsPercent.forEach(col => {formatFractionIntoPercentage(col); rightAlignBody(col)});
  columnsShortText.forEach(col => centerAlignBody(col));



  function formatMillionsBody(column) {
    table.selectAll("tbody td:nth-child(" + column + ")").html(d => formatMillions(d.value));
  }

  function formatMillions(num) {
    if (num == null) {
      return num;
    } else if (num < 0.01e6 && num > -0.01e6) {
      return num >= 0 ? "<0.01" : ">-0.01";
    } else {
      return d3.format(",.2f")(num / 1e6);
    }
  }

  function formatFractionIntoPercentage(column) {
    table.selectAll("tbody td:nth-child(" + column + ")").html(d => (d.value == null) ? d.value : d3.format(".0%")(d.value));
  }

  function leftAlignBody(column) {
    table.selectAll("tbody td:nth-child(" + column + ")").style("text-align", "left");
  }

  function rightAlignBody(column) {
    table.selectAll("tbody td:nth-child(" + column + ")").style("text-align", "right");
  }

  function centerAlignBody(column) {
    table.selectAll("tbody td:nth-child(" + column + ")").style("text-align", "center");
  }

  // Add grids in chosen places
  table.selectAll("tbody tr:nth-child(" + data.length + ")").attr("class", "summary_row");

  if (!(columnValueBreakdown == null)) {
    table.selectAll("thead th:nth-child(" + columnValueBreakdown + ")").attr("class", "column_left_border");
    table.selectAll("tbody td:nth-child(" + columnValueBreakdown + ")").attr("class", "column_left_border");
  }
    
  return table;
}