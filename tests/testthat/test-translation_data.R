test_that("translation data does not contain duplicate key rows", {
  if (nzchar(Sys.getenv("R_CMD"))) {
    testthat::skip("Not run in R CMD check")
  }

  dataframe_headers <- readr::read_csv("../../inst/extdata/translation/dataframe_headers.csv", col_types = "c")
  dataframe_labels <- readr::read_csv("../../inst/extdata/translation/dataframe_labels.csv", col_types = "c")
  js_labels <- jsonlite::fromJSON("../../inst/extdata/translation/js_labels.json")

  expect_false(any(duplicated(dataframe_headers[, c("id_data", "id_column")])))
  expect_false(any(duplicated(dataframe_labels[, c("id_data", "id_column", "key")])))
  expect_false(any(duplicated(js_labels[, c("id", "label")])))
})
