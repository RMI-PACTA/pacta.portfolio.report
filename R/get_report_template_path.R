#' Get the path to the template based on report name and language
#'
#' This function returns the path to the template based on the report name and
#' the language code. The templates are installed with the package. If a
#' template is not found that corresponds to the specified report name and
#' language code, a default template is used instead.
#'
#' @param project_report_name a single string specifying the name of the report, e.g. "GENERAL"
#' @param language_select a single string specifying the name of the language code, e.g. "EN"
#'
#' @return A string containing the path to the template directory
#'
#' @export

get_report_template_path <- function(
    project_report_name = "general",
    language_select = "EN") {
  # validate arguments
  if (!is.character(project_report_name)) {
    cli::cli_abort("{.arg project_report_name} must be a {.cls character}")
  }
  if (!identical(length(project_report_name), 1L)) {
    cli::cli_abort("{.arg project_report_name} must be of length 1L")
  }
  if (!is.character(language_select)) {
    cli::cli_abort("{.arg language_select} must be a {.cls character}")
  }
  if (!identical(length(language_select), 1L)) {
    cli::cli_abort("{.arg language_select} must be of length 1L")
  }
  if (!identical(nchar(language_select), 2L)) {
    cli::cli_abort("{.arg language_select} must be a 2 letter string, not {.val {language_select}}")
  }

  # format arguments
  project_report_name <- tolower(project_report_name)
  language_select <- tolower(language_select)

  # determine path to template directory
  template_dir_name <- paste(project_report_name, language_select, "template", sep = "_")
  template_dir_path <- system.file("templates", template_dir_name, package = "pacta.portfolio.report")

  # use default template if template directory is not found
  # TODO: consider defaulting to a default language if the report name matches
  #   but the language does not
  if (!dir.exists(template_dir_path)) {
    cli::cli_warn("template {.val {template_dir_name}} was not found; using default template")
    template_dir_path <- system.file("templates", "general_en_template", package = "pacta.portfolio.report")
  }

  # return the path to the "_book" directory in the template directory
  template_dir_path
}
