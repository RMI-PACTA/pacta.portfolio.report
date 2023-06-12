prep_speedometer <-
  function(equity_tdm, bonds_tdm) {
    combined_tdm <-
      bind_rows("Listed Equity" = equity_tdm,
                "Corporate Bonds" = bonds_tdm,
                .id = "asset_class") %>%
      filter(.data$equity_market == "GlobalMarket") %>%
      filter(.data$scenario_geography == "Global")

    tech_tdm <-
      combined_tdm %>%
      select("asset_class", "technology", "ald_sector", "tdm_metric",
             "tdm_technology_value", "tdm_t0", "tdm_delta_t1", "tdm_delta_t2",
             "portfolio_name")

    portfolio_tdm <-
      combined_tdm %>%
      group_by(.data$asset_class, .data$tdm_metric, .data$tdm_t0,
               .data$tdm_delta_t1, .data$tdm_delta_t2, .data$portfolio_name) %>%
      summarise(
        tdm_technology_value = unique(.data$tdm_portfolio_value),
        technology = "Aggregate", ald_sector = "Aggregate",
        .groups = "drop"
      ) %>%
      ungroup()

    data_speedometer_dashboard <-
      bind_rows(tech_tdm, portfolio_tdm) %>%
      rename(tdm_value = "tdm_technology_value")
  }
