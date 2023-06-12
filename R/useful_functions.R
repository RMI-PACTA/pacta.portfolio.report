# utility functions --------------------------------------------------------

# wrapper for the json data to make sure that it runs on all browsers

to_jsonp <-
  function(x, obj_name, pretty = FALSE, auto_unbox = TRUE, na = 'null', digits = NA, ...) {
    json <- jsonlite::toJSON(x, pretty = pretty, auto_unbox = auto_unbox,
                             na = na, digits = digits, ...)
    paste0('var ', obj_name, ' = ', json, ';')
  }

# exports data used in the report in different formats
export_data <-
  function(data, data_id, output_dir = NULL) {
    data %>%
      to_jsonp(data_id) %>%
      writeLines(path(output_dir, 'data', paste0(data_id, '.js')))

    data %>%
      write_csv(path(output_dir, 'export', paste0(data_id, '.csv')))

    data %>%
      write_xlsx(path(output_dir, 'export', paste0(data_id, '.xlsx')))
  }

export_data_utf8 <- function(data,
                             data_id,
                             output_dir = NULL) {

  json_data <- data %>%
    to_jsonp(data_id)

  utf8 <- enc2utf8(json_data)

  path <- path(output_dir, 'data', paste0(data_id, '.js'))

  con <- file(path, open = "w+", encoding = "native.enc")

  writeLines(utf8, con = con, useBytes = TRUE)

  close(con)

  data %>%
    write_csv(path(output_dir, 'export', paste0(data_id, '.csv')))

  data %>%
    write_xlsx(path(output_dir, 'export', paste0(data_id, '.xlsx')))

}


translate <-
  function(
    value_to_extract,
    language_select = "EN",
    translations = translation_list
  ){

    translations$value[translations$label == value_to_extract]


  }


write_utf8 <-
  function(text, file) {
    opts <- options(encoding = "native.enc")
    on.exit(options(opts), add = TRUE)

    con <- file(file, encoding = 'native.enc')
    writeLines(enc2utf8(text), con = con, useBytes = TRUE, sep = '\n')
    close(con)
  }
