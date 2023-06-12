translate_column_contents <-
  function(data, dictionary, column, inplace = FALSE) {
    dictionary_column <-
      dictionary %>%
      filter(.data$id_column == .env$column) %>%
      select(-"id_column")

    if (inplace) {
      new_column <- column
    } else {
      new_column <- glue::glue(column, "_translation")
    }

    data %>%
      left_join(
        dictionary_column,
        by = rlang::set_names("translate_key", column)
      ) %>%
      mutate(
        !!new_column := if_else(
          is.na(.data$translate_value),
          .data[[!!column]],
          .data$translate_value
        )
      ) %>%
      select(-"translate_value")
  }
