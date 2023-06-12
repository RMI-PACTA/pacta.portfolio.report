function tabulate(data, id) {
	var columns = Object.keys(data[0]);
    d3.select(id).selectAll("table").remove();
    
    var table = d3.select(id).append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    thead.append("tr")
      .selectAll("th")
      .data(columns)
      .enter()
      .append("th")
      .text(function(column) { return column; })
      .style("text-align", "left")
    ;

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
      .html(d => { 
        var output;
        switch(d.value) {
          case "✓":
            output = '<span style="color: #00c082; font-size: 1.5em">' + d.value + '<span>'
            break;
          case "✗":
            output = '<span style="color: red; font-size: 1.5em">' + d.value + '<span>'
            break;
          default:
            output = d.value
        }
        return output;
      })
      .style("text-align", "left")
    ;
    
    function num_format(num) {
      if (num < 0.01e6 && num > -0.01e6) {
        return num >= 0 ? "< 0.01" : "- < 0.01";
      } else {
        return d3.format(",.2f")(num / 1e6);
      }
     }
    
    table.selectAll("#included_table td:nth-child(2)").html(d => num_format(d.value));
    
    table.selectAll("#included_table th:nth-child(2)").style("text-align", "right");
    table.selectAll("#included_table td:nth-child(2)").style("text-align", "right");
    
    table.selectAll("#included_table th:nth-child(3)").style("text-align", "center");
    table.selectAll("#included_table td:nth-child(3)").style("text-align", "center");
    
    return table;
}