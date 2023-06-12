translate_df_headers <-
  function(data, id_data, language_select, dictionary) {
    language <- tolower(language_select)

    if (!(id_data %in% dictionary$id_data)) {
      rlang::abort(
        class = "dataset not in dictionary",
        glue::glue("the dataset {id_data} is not defined in translation dictionary.")
      )
    }

    column_tibble <- tibble(column_name = names(data))

    dictionary_subset <-
      dictionary %>%
      filter(.data$id_data == .env$id_data) %>%
      transmute(.data$id_column, .data[[!!language]])

    translated_headers <-
      dictionary_subset %>%
      left_join(column_tibble, by = c(id_column = "column_name"))

    names(data) <- translated_headers[[language]]

    data
  }
