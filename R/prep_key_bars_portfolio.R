prep_key_bars_portfolio <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           portfolio_name,
           select_scenario,
           select_scenario_other,
           start_year,
           pacta_sectors_not_analysed,
           all_tech_levels) {

    equity_data_portfolio <-
      equity_results_portfolio %>%
      filter(.data$portfolio_name == .env$portfolio_name,
             .data$allocation == "portfolio_weight") %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global", "GlobalMarket")) %>%
      filter(.data$year %in% c(.env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Power", "Automotive")) %>%
      filter(.data$scenario_geography == "Global") %>%
      mutate(port_weight = 1) %>%
      select("ald_sector", "technology", "plan_tech_share", "scen_tech_share",
             "port_weight", "scenario", "year") %>%
      pivot_longer(c("plan_tech_share", "scen_tech_share"), names_to = "plan") %>%
      mutate(id = if_else(.data$plan == "plan_tech_share", "Portfolio", "Aligned* Portfolio")) %>%
      rename(plan_tech_share = "value") %>%
      select("id", "ald_sector", "technology", "plan_tech_share", "port_weight",
             "scenario", "year") %>%
      filter(!.data$ald_sector %in% .env$pacta_sectors_not_analysed | !grepl("Aligned", .data$id)) %>%
      mutate(asset_class = "Listed Equity") %>%
      mutate_at("id", as.character) # convert the col type to character to prevent errors in case empty df is bound by rows

    bonds_data_portfolio <-
      bonds_results_portfolio %>%
      filter(.data$portfolio_name == .env$portfolio_name,
             .data$allocation == "portfolio_weight") %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global", "GlobalMarket")) %>%
      filter(.data$year %in% c(.env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Power", "Automotive")) %>%
      filter(.data$scenario_geography == "Global") %>%
      mutate(port_weight = 1) %>%
      select("ald_sector", "technology", "plan_tech_share", "scen_tech_share",
             "port_weight", "scenario", "year") %>%
      pivot_longer(c("plan_tech_share", "scen_tech_share"), names_to = "plan") %>%
      mutate(id = if_else(.data$plan == "plan_tech_share", "Portfolio", "Aligned* Portfolio")) %>%
      rename(plan_tech_share = "value") %>%
      select("id", "ald_sector", "technology", "plan_tech_share", "port_weight",
             "scenario", "year") %>%
      mutate(asset_class = "Corporate Bonds") %>%
      mutate_at("id", as.character) %>%
      arrange(factor(.data$technology, levels = .env$all_tech_levels))

    bind_rows(equity_data_portfolio, bonds_data_portfolio) %>%
      mutate(scenario = str_replace(.data$scenario, "_", " "))
  }
