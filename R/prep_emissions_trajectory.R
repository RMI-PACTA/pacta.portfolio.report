prep_emissions_trajectory <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           investor_name,
           portfolio_name,
           select_scenario_other,
           select_scenario,
           pacta_sectors,
           year_span,
           start_year
         ) {
    emissions_units <-
      c(
        Automotive = "tons of CO\U00002082 per km per cars produced",
        Aviation = "tons of CO\U00002082 per passenger km per active planes",
        Cement = "tons of CO\U00002082 per tons of cement",
        Coal = "tons of CO\U00002082 per tons of coal",
        `Oil&Gas` = "tons of CO\U00002082 per GJ",
        Power = "tons of CO\U00002082 per MWh",
        Steel = "tons of CO\U00002082 per tons of steel"
      )

    list(`Listed Equity` = equity_results_portfolio,
           `Corporate Bonds` = bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$scenario_geography == "Global") %>%
      select("asset_class", "allocation", "equity_market", sector = "ald_sector", "year",
             plan = "plan_sec_emissions_factor", scen = "scen_sec_emissions_factor", "scenario") %>%
      distinct() %>%
      filter(!is.nan(.data$plan)) %>%
      pivot_longer(c("plan", "scen"), names_to = "plan") %>%
      unite("name", "sector", "plan", remove = FALSE) %>%
      mutate(disabled = !.data$sector %in% .env$pacta_sectors) %>%
      mutate(unit = .env$emissions_units[.data$sector]) %>%
      group_by(.data$asset_class) %>%
      filter(!all(.data$disabled)) %>%
      mutate(equity_market =  case_when(
        .data$equity_market == "GlobalMarket" ~ "Global Market",
        .data$equity_market == "DevelopedMarket" ~ "Developed Market",
        .data$equity_market == "EmergingMarket" ~ "Emerging Market",
        TRUE ~ .data$equity_market)
      ) %>%
      filter(.data$year <= .env$start_year + .env$year_span) %>%
      arrange(.data$asset_class, factor(.data$equity_market, levels = c("Global Market", "Developed Market", "Emerging Market"))) %>%
      ungroup()
  }
