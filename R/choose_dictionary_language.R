#' Extract translation strings from translation data.frame
#'
#' Extract the translation strings from a translation data.frame for a given
#' language.
#'
#' @param data data.frame containing translation data, with columns `id_data`,
#' `id_column`, `key`, and one column for each language (lowercase ISO-639-1
#' code). See examples for more detail.
#' @param language ISO-639-1 code of the language to extract from the
#' translation data.
#' @return data.frame with tranlsated strings for the given language in the
#' `translate_value` column.
#' @examples
# nolint start
#' translation_data <- read.csv(
#'   file = system.file(
#'     "extdata", "translation", "dataframe_labels.csv",
#'     package = "pacta.portfolio.report"
#'   )
#' )
#' de_dictionary <- choose_dictionary_language(translation_data, "de")
# nolint end
#' @export
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
