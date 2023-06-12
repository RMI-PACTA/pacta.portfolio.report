choose_dictionary_language <-
  function(data, language) {
    language <- tolower(language)

    data %>%
      transmute(
        .data$id_data,
        .data$id_column,
        translate_key = .data$key,
        translate_value = .data[[language]]
      )
  }
