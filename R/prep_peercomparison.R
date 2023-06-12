prep_peercomparison <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           peers_equity_results_user,
           peers_bonds_results_user,
           investor_name,
           portfolio_name,
           start_year,
           select_scenario,
           select_scenario_other,
           peer_group) {

    # FIXME: Check whether this is distinct enough over different groups

    high_carbon_vars <-
      c("High-carbon Power Production", "High-carbon Transportion", "Fossil Fuels", "High-carbon Industry")

    equity_data <-
      equity_results_portfolio %>%
      filter(.data$allocation == "portfolio_weight",
             .data$scenario_geography == "Global",
             .data$equity_market %in% c("Global", "GlobalMarket"),
             .data$year == .env$start_year
      ) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      mutate(high_carbon_sector = case_when(
        .data$ald_sector %in% c("Oil&Gas", "Coal") ~ "Fossil Fuels",
        .data$technology %in% c("OilCap", "CoalCap", "GasCap") ~ "High-carbon Power Production",
        .data$technology %in% c("ICE") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Aviation") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Cement", "Steel") ~ "High-carbon Industry",
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE),
                .groups = "drop") %>%
      ungroup() %>%
      mutate(this_portfolio =
               .data$investor_name == .env$investor_name &
               .data$portfolio_name == .env$portfolio_name) %>%
      pivot_wider(names_from = "high_carbon_sector", values_from = "plan_carsten",
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-"investor_name", -"this_portfolio") %>%
      mutate(this_portfolio = .data$portfolio_name == .env$portfolio_name) %>%
      mutate(asset_class = "Listed Equity") %>%
      filter(.data$this_portfolio)

    if ("plan_carsten" %in% colnames(equity_data)) { equity_data <- select(equity_data, -"plan_carsten") }
    if (any(equity_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    peers_equity_data <-
      peers_equity_results_user %>%
      filter(.data$allocation == "portfolio_weight",
             .data$equity_market %in% c("Global", "GlobalMarket"),
             .data$scenario_geography == "Global",
             .data$year == .env$start_year,
             .data$investor_name == .env$peer_group
      ) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      mutate(high_carbon_sector = case_when(
        .data$ald_sector %in% c("Oil&Gas", "Coal") ~ "Fossil Fuels",
        .data$technology %in% c("OilCap", "CoalCap", "GasCap") ~ "High-carbon Power Production",
        .data$technology %in% c("ICE") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Aviation") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Cement", "Steel") ~ "High-carbon Industry",
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE),
                .groups = "drop") %>%
      ungroup() %>%
      mutate(this_portfolio = .data$portfolio_name == .env$investor_name) %>%
      filter(.data$this_portfolio == FALSE) %>%
      pivot_wider(names_from = "high_carbon_sector", values_from = "plan_carsten",
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-"investor_name") %>%
      mutate(asset_class = "Listed Equity") %>%
      group_by(.data$portfolio_name) %>%
      mutate(g = cur_group_id()) %>%
      ungroup() %>%
      mutate(portfolio_name = as.character(.data$g)) %>%
      select(-"g")

    if ("plan_carsten" %in% colnames(peers_equity_data)) { peers_equity_data <- select(peers_equity_data, -"plan_carsten") }
    if (any(peers_equity_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    bonds_data <-
      bonds_results_portfolio %>%
      filter(.data$allocation == "portfolio_weight",
             # FIXME: check if bonds input data should have multiple values of equity_market
             .data$equity_market %in% c("Global", "GlobalMarket"),
             .data$scenario_geography == "Global",
             .data$year == .env$start_year
      ) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      mutate(high_carbon_sector = case_when(
        .data$ald_sector %in% c("Oil&Gas", "Coal") ~ "Fossil Fuels",
        .data$technology %in% c("OilCap", "CoalCap", "GasCap") ~ "High-carbon Power Production",
        .data$technology %in% c("ICE") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Aviation") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Cement", "Steel") ~ "High-carbon Industry",
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE),
                .groups = "drop") %>%
      ungroup() %>%
      mutate(this_portfolio =
               .data$investor_name == .env$investor_name &
               .data$portfolio_name == .env$portfolio_name) %>%
      pivot_wider(names_from = "high_carbon_sector", values_from = "plan_carsten",
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-"investor_name", -"this_portfolio") %>%
      mutate(this_portfolio = .data$portfolio_name == .env$portfolio_name) %>%
      mutate(asset_class = "Corporate Bonds") %>%
      filter(.data$this_portfolio)

    if ("plan_carsten" %in% colnames(bonds_data)) { bonds_data <- select(bonds_data, -"plan_carsten") }
    if (any(bonds_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    peers_bonds_data <-
      peers_bonds_results_user %>%
      filter(.data$allocation == "portfolio_weight",
             # FIXME: check if bonds input data should have mulitiple values of equity_market
             .data$equity_market %in% c("Global","GlobalMarket"),
             .data$scenario_geography == "Global",
             .data$year == .env$start_year,
             .data$investor_name == .env$peer_group
      ) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      mutate(high_carbon_sector = case_when(
        .data$ald_sector %in% c("Oil&Gas", "Coal") ~ "Fossil Fuels",
        .data$technology %in% c("OilCap", "CoalCap", "GasCap") ~ "High-carbon Power Production",
        .data$technology %in% c("ICE") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Aviation") ~ "High-carbon Transportion",
        .data$ald_sector %in% c("Cement", "Steel") ~ "High-carbon Industry",
        TRUE ~ NA_character_
      )) %>%
      filter(!is.na(.data$high_carbon_sector)) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$high_carbon_sector) %>%
      summarise(plan_carsten = sum(.data$plan_carsten, na.rm = TRUE),
                .groups = "drop") %>%
      ungroup() %>%
      mutate(this_portfolio = .data$portfolio_name == .env$investor_name) %>%
      filter(.data$this_portfolio == FALSE) %>%
      pivot_wider(names_from = "high_carbon_sector", values_from = "plan_carsten",
                  values_fill = list(plan_carsten = 0)) %>%
      rowwise() %>%
      mutate(Total = sum(c_across(any_of(high_carbon_vars)), na.rm = TRUE)) %>%
      ungroup() %>%
      select(-"investor_name") %>%
      mutate(asset_class = "Corporate Bonds") %>%
      group_by(.data$portfolio_name) %>%
      mutate(g = cur_group_id()) %>%
      ungroup() %>%
      mutate(portfolio_name = as.character(.data$g)) %>%
      select(-"g")

    if ("plan_carsten" %in% colnames(peers_bonds_data)) { peers_bonds_data <- select(peers_bonds_data, -"plan_carsten") }
    if (any(peers_bonds_data$Total > 1)) { stop("Total Exceeds 1, check filters") }

    equity_data <- bind_rows(equity_data, peers_equity_data)
    bonds_data <- bind_rows(bonds_data, peers_bonds_data)

    if (filter(equity_data, .data$portfolio_name == .env$portfolio_name) %>% nrow() < 1) {
      equity_data <- equity_data %>% slice(0)
    }

    if (filter(bonds_data, .data$portfolio_name == .env$portfolio_name) %>% nrow() < 1) {
      bonds_data <- bonds_data %>% slice(0)
    }

    bind_rows(equity_data, bonds_data)
  }
