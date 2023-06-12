prep_exposure_map <-
  function(equity_results_map, bonds_results_map, portfolio_name, start_year) {
    sector_prefix <- "All "

    filtered <-
      bind_rows(
        "Listed Equity" = ungroup(equity_results_map),
        "Corporate Bonds" = ungroup(bonds_results_map),
        .id = "asset_class"
      ) %>%
      filter(.data$portfolio_name == .env$portfolio_name) %>%
      filter(.data$allocation == case_when(
        .data$asset_class == "Listed Equity" ~ "ownership_weight",
        .data$asset_class == "Corporate Bonds" ~ "portfolio_weight"
      )
      ) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(code = countrycode(.data$ald_location, "iso2c", "iso3n")) %>%
      rename(unit = "ald_production_unit")

    by_sector <-
      filtered %>%
      group_by(.data$asset_class, .data$ald_sector) %>%
      filter(length(unique(.data$unit)) == 1L & length(unique(.data$technology)) > 1L) %>%
      mutate(option = paste0(.env$sector_prefix, .data$ald_sector)) %>%
      group_by(.data$asset_class, .data$code, .data$option, .data$unit, group = .data$ald_sector) %>%
      summarise(value = sum(.data$plan_alloc_wt_tech_prod, na.rm = TRUE), .groups = "drop") %>%
      ungroup() %>%
      mutate(order = 1L)

    data_map <-
      filtered %>%
      group_by(.data$asset_class, .data$code, option = .data$technology, .data$unit, group = .data$ald_sector) %>%
      summarise(value = sum(.data$plan_alloc_wt_tech_prod, na.rm = TRUE), .groups = "drop") %>%
      ungroup() %>%
      mutate(order = 2L) %>%
      bind_rows(by_sector) %>%
      arrange(.data$asset_class, .data$code, .data$group, .data$order, .data$option)
  }
