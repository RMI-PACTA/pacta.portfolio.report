fake_audit <- data.frame(
  asset_type_analysis = c("Bonds", "Equity", "Unclassified", "Total"),
  total_value_invested = rep(1.5, 4L),
  percentage_value_invested = rep(0.25, 4L),
  included = c("Yes", "Yes", "No", NA),
  value_invested = rep(1.5, 4L),
  investment_means = c("Direct", "Direct", "Direct", NA),
  stringsAsFactors = FALSE,
  row.names = NULL
)

dataframe_translations <- read.csv(
  system.file(
    "extdata", "translation", "dataframe_labels.csv",
    package = "pacta.portfolio.report"
  ),
  stringsAsFactors = FALSE
)

dictionary_de <- choose_dictionary_language(
  data = dataframe_translations,
  language = "DE"
)
dictionary_fr <- choose_dictionary_language(
  data = dataframe_translations,
  language = "FR"
)

test_that("translate_df_contents translates contents of dataframe", {
  expected <- data.frame(
    asset_type_analysis = c(
      "Unternehmensanleihen",
      "Aktien",
      "Nicht klassifiziert",
      "Gesamt"
    ),
    total_value_invested = rep(1.5, 4L),
    percentage_value_invested = rep(0.25, 4L),
    included = c("Ja", "Ja", "Nein", NA),
    value_invested = rep(1.5, 4L),
    investment_means = c("Direkt", "Direkt", "Direkt", NA),
    stringsAsFactors = FALSE,
    row.names = NULL
  )
  results <- translate_df_contents(
    data = fake_audit,
    id_data = "data_included_table",
    dictionary = dictionary_de,
    inplace = TRUE
  )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("translate_df_contents inplace = FALSE adds translation columns", {
  expected <- fake_audit |>
    dplyr::mutate(
      asset_type_analysis_translation = c(
        "Unternehmensanleihen",
        "Aktien",
        "Nicht klassifiziert",
        "Gesamt"
      ),
      included_translation = c("Ja", "Ja", "Nein", NA),
      investment_means_translation = c("Direkt", "Direkt", "Direkt", NA)
    )
  results <- translate_df_contents(
    data = fake_audit,
    id_data = "data_included_table",
    dictionary = dictionary_de,
    inplace = FALSE
  )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("translate_df_contents accepts alternate dictionaries", {
  expected <- data.frame(
    asset_type_analysis = c(
      "Obligations d'entreprises",
      "Actions",
      "Non classifié",
      "Total"
    ),
    total_value_invested = rep(1.5, 4L),
    percentage_value_invested = rep(0.25, 4L),
    included = c("Oui", "Oui", "Non", NA),
    value_invested = rep(1.5, 4L),
    investment_means = c("Direct", "Direct", "Direct", NA),
    stringsAsFactors = FALSE,
    row.names = NULL
  )
  results <- translate_df_contents(
    data = fake_audit,
    id_data = "data_included_table",
    dictionary = dictionary_fr,
    inplace = TRUE
  )
  expect_identical(
    object = results,
    expected = expected
  )
})

# --------Headers--------

header_dictionary <- read.csv(
  system.file(
    "extdata", "translation", "dataframe_headers.csv",
    package = "pacta.portfolio.report"
  ),
  stringsAsFactors = FALSE
)

header_de <- pacta.portfolio.report:::replace_contents(
    header_dictionary,
    "EUR"
  )

header_fr <- pacta.portfolio.report:::replace_contents(
    header_dictionary,
    "CAD"
  )

test_that("translate_df_headers translates headers of dataframe", {
  expected <- fake_audit |>
    dplyr::rename(
      Anlageklasse = asset_type_analysis,
      `Investierter Portfoliowert (M EUR)` = total_value_invested,
      `Investierter Portfoliowert (%)` = percentage_value_invested,
      `In der Analyse enthalten` = included,
      `Wertaufteilung pro Investitionsmittel` = value_invested,
      `_` = investment_means
    )
  results <- translate_df_headers(
    data = fake_audit,
    id_data = "data_included_table",
    language_select = "DE",
    dictionary = header_de
  )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("translate_df_headers accepts alternate translation frames", {
  expected <- fake_audit |>
    dplyr::rename(
      `Catégorie d'actifs` = asset_type_analysis,
      `Valeur du portefeuille investi (M CAD)` = total_value_invested,
      `Valeur du portefeuille investi (%)` = percentage_value_invested,
      `Inclus dans l'analyse` = included,
      `Répartition de la valeur par moyen d'investissement` = value_invested,
      `_` = investment_means
    )
  results <- translate_df_headers(
    data = fake_audit,
    id_data = "data_included_table",
    language_select = "FR",
    dictionary = header_fr
  )
  expect_identical(
    object = results,
    expected = expected
  )
})

## ----Piping----
test_that("translate_df_contents can be piped to translate_df_headers", {
  expected <- data.frame(
    asset_type_analysis = c(
      "Unternehmensanleihen",
      "Aktien",
      "Nicht klassifiziert",
      "Gesamt"
    ),
    total_value_invested = rep(1.5, 4L),
    percentage_value_invested = rep(0.25, 4L),
    included = c("Ja", "Ja", "Nein", NA),
    value_invested = rep(1.5, 4L),
    investment_means = c("Direkt", "Direkt", "Direkt", NA),
    stringsAsFactors = FALSE,
    row.names = NULL
  ) |>
    dplyr::rename(
      Anlageklasse = asset_type_analysis,
      `Investierter Portfoliowert (M EUR)` = total_value_invested,
      `Investierter Portfoliowert (%)` = percentage_value_invested,
      `In der Analyse enthalten` = included,
      `Wertaufteilung pro Investitionsmittel` = value_invested,
      `_` = investment_means
    )
  results <- fake_audit |>
    translate_df_contents(
      data = _,
      id_data = "data_included_table",
      dictionary = dictionary_de,
      inplace = TRUE
    ) |>
    translate_df_headers(
      data = _,
      id_data = "data_included_table",
      language_select = "DE",
      dictionary = header_de
    )
  expect_identical(
    object = results,
    expected = expected
  )
})

test_that("translate_df_headers cannot be piped to translate_df_contents", {
  expect_error(
    object = {
      fake_audit |>
        translate_df_headers(
          data = _,
          id_data = "data_included_table",
          language_select = "DE",
          dictionary = header_de
        ) |>
        translate_df_contents(
          data = _,
          id_data = "data_included_table",
          dictionary = dictionary_de,
          inplace = TRUE
        )
    }
  )
})
