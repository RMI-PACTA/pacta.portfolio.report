#' select correct report template
#'
#' This function returns the name of the template
#'
#' @param project_report_name a parameter
#' @param language_select a parameter
#'
#' @return A string containing the name of the template
#'
#' @export

select_report_template <-
  function(
    project_report_name = NULL,
    language_select = "EN"){

    report_template <- paste0(tolower(project_report_name), "_",tolower(language_select), "_template")

    return(report_template)

  }
