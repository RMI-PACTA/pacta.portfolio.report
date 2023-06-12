prep_exposure_pie <-
  function(data,
           asset_type,
           investor_name,
           portfolio_name,
           twodi_sectors,
           currency_exchange_value) {
    data %>%
      filter(.data$investor_name == .env$investor_name &
        .data$portfolio_name == .env$portfolio_name) %>%
      filter(.data$asset_type %in% c("Bonds", "Equity")) %>%
      filter(.data$valid_input == TRUE) %>%
      mutate(across(c("bics_sector", "financial_sector"), as.character)) %>%
      mutate(
        sector =
          if_else(!.data$financial_sector %in% .env$twodi_sectors,
            "Other",
            .data$financial_sector
          )
      ) %>%
      group_by(.data$asset_type, .data$sector) %>%
      summarise(
        value = sum(.data$value_usd, na.rm = TRUE) / .env$currency_exchange_value,
        .groups = "drop"
      ) %>%
      mutate(exploded = .data$sector %in% .env$twodi_sectors) %>%
      arrange(.data$asset_type, desc(.data$exploded), .data$sector) %>%
      rename(key = .data$sector) %>%
      filter(!is.na(.data$key)) %>%
      ungroup() %>%
      filter(.data$asset_type == .env$asset_type) %>%
      select(-"asset_type")
  }
