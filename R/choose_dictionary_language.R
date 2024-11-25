choose_dictionary_language <- function(
  data,
  language
) {
  language <- tolower(language)

  if (!all(c("id_data", "id_column", "key") %in% colnames(data))) {
    stop(
      "Translation data must contain columns 'id_data', 'id_column', 'key'."
    )
  }

  language_columns <- setdiff(
    colnames(data),
    c("id_data", "id_column", "key")
  )
  if (!(language %in% language_columns)) {
    stop(
      "Language '", language, "' not found in translation data. ",
      "Please choose one of: ", toString(language_columns)
    )
  }

  output <- data.frame(
    id_data = data[["id_data"]],
    id_column = data[["id_column"]],
    translate_key = data[["key"]],
    translate_value = data[[language]],
    stringsAsFactors = FALSE,
    row.names = NULL
  )
  return(output)
}
