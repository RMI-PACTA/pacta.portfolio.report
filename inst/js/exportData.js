var exportCSV = function(context) {
  var chart_div = context.parentElement.parentElement.parentElement.parentElement;
  var file_name = "data_" + chart_div.attributes.chart_type_data_download.textContent + ".csv";
  var file_url = "export/" + file_name;
  saveAs(file_url, file_name);
}

var exportXLSX = function(context) {
  var chart_div = context.parentElement.parentElement.parentElement.parentElement;
  var file_name = "data_" + chart_div.attributes.chart_type_data_download.textContent + ".xlsx";
  var file_url = "export/" + file_name;
  saveAs(file_url, file_name);
}
