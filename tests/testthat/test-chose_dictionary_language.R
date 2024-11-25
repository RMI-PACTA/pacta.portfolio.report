test_that("choose_dictionary_language emits expected translations for en", {
  translation_data <- read.csv(
    file = system.file(
      "extdata", "translation", "dataframe_labels.csv",
      package = "pacta.portfolio.report"
    )
  )
  results <- choose_dictionary_language(translation_data, "en")
  expected <- translation_data |>
    dplyr::select(
      id_data,
      id_column,
      translate_key = key,
      translate_value = en
    )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("choose_dictionary_language is case insensitive to language", {
  translation_data <- read.csv(
    file = system.file(
      "extdata", "translation", "dataframe_labels.csv",
      package = "pacta.portfolio.report"
    )
  )
  results <- choose_dictionary_language(translation_data, "EN")
  expected <- translation_data |>
    dplyr::select(
      id_data,
      id_column,
      translate_key = key,
      translate_value = en
    )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("choose_dictionary_language emits expected translations for fr", {
  translation_data <- read.csv(
    file = system.file(
      "extdata", "translation", "dataframe_labels.csv",
      package = "pacta.portfolio.report"
    )
  )
  results <- choose_dictionary_language(translation_data, "fr")
  expected <- translation_data |>
    dplyr::select(
      id_data,
      id_column,
      translate_key = key,
      translate_value = fr
    )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("choose_dictionary_language emits expected translations for es", {
  translation_data <- read.csv(
    file = system.file(
      "extdata", "translation", "dataframe_labels.csv",
      package = "pacta.portfolio.report"
    )
  )
  results <- choose_dictionary_language(translation_data, "es")
  expected <- translation_data |>
    dplyr::select(
      id_data,
      id_column,
      translate_key = key,
      translate_value = es
    )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("choose_dictionary_language emits expected translations for de", {
  translation_data <- read.csv(
    file = system.file(
      "extdata", "translation", "dataframe_labels.csv",
      package = "pacta.portfolio.report"
    )
  )
  results <- choose_dictionary_language(translation_data, "de")
  expected <- translation_data |>
    dplyr::select(
      id_data,
      id_column,
      translate_key = key,
      translate_value = de
    )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that(
  "choose_dictionary_language emits error without required meta columns",
  {
  translation_data <- mtcars
  expect_error(
    choose_dictionary_language(translation_data, "xx"),
    regexp = "^Translation data must contain columns 'id_data', 'id_column', 'key'.$"
  )
})

test_that("choose_dictionary_language emits error for invalid language", {
  translation_data <- readr::read_csv(
    system.file(
      "extdata/translation/dataframe_labels.csv",
      package = "pacta.portfolio.report"
    ),
    col_types = readr::cols()
  )
  expect_error(
    choose_dictionary_language(translation_data, "xx"),
    regexp = "Language 'xx' not found in translation data."
  )
})
