# This script reads the translation files, and exports them to a table,
# so that a translator can add new translations, and allows for those
# translations to be added back into these files.

new_language <- "es"

library("jsonlite")

json_text <- jsonlite::read_json(
  "js_labels.json",
  simplifyDataFrame = TRUE
)

replace_count <- 1
replace_strings <- function(x, replacement = "CHANGEME") {
  if (length(x) > 1) {
    for (ind in seq_along(x)) {
      x[[ind]] <- replace_strings(x[[ind]])
    }
  } else if (is.character(x)) {
    x <- paste(replacement, "JSLABELS", replace_count, sep = "-")
    replace_count <<- replace_count + 1
  } else {
    if (interactive()) {
      browser()
    }
    stop("unknown object type")
  }
  return(x)
}

translated_json <- json_text
translated_json[[new_language]] <- replace_strings(translated_json[["en"]])

write_json(translated_json, "js_labels.json", pretty = TRUE, auto_unbox = TRUE)
