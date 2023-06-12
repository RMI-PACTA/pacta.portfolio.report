translate_df_contents <-
  function(data, id_data, dictionary, inplace = FALSE) {
    if (!(id_data %in% dictionary$id_data)) {
      rlang::abort(
        class = "dataset not in dictionary",
        glue::glue("the dataset {id_data} is not defined in translation dictionary.")
      )
    }

    dictionary_subset <-
      dictionary %>%
      filter(.data$id_data == .env$id_data) %>%
      transmute(
        .data$id_column,
        .data$translate_key,
        .data$translate_value
      )

    for (column in unique(dictionary_subset$id_column)) {
      data <-
        translate_column_contents(
          data = data,
          dictionary = dictionary_subset,
          column = column,
          inplace = inplace
        )
    }

    data
  }
