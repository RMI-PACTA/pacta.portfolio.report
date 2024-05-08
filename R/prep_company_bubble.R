prep_company_bubble <-
  function(equity_results_company,
           bonds_results_company,
           portfolio_name,
           select_scenario_other,
           select_scenario,
           start_year,
           green_techs) {

    equity_data <-
      equity_results_company %>%
      filter(.data$portfolio_name == .env$portfolio_name,
             .data$allocation == "portfolio_weight") %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market == "GlobalMarket") %>%
      filter(.data$year %in% c(.env$start_year, .env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Power", "Automotive")) %>%
      filter(.data$scenario_geography == "Global") %>%
      group_by(.data$id, .data$company_name,
               .data$technology, .data$year) %>%  # HACK to get rid of duplicated
      filter(row_number() == 1) %>%               # rows for company/tech/year
      group_by(.data$company_name, .data$technology) %>%
      arrange(.data$year) %>%
      mutate(plan_buildout = .data$plan_tech_prod[2] - .data$plan_tech_prod[1],
             scen_buildout = .data$scen_tech_prod[2] - .data$scen_tech_prod[1]) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(green = .data$technology %in% .env$green_techs) %>%
      group_by(.data$company_name, .data$scenario, .data$ald_sector,
               .data$green, .data$year) %>%
      reframe(
        plan_tech_share = sum(.data$plan_tech_share, na.rm = TRUE),
        plan_buildout = sum(.data$plan_buildout, na.rm = TRUE),
        scen_buildout = sum(.data$scen_buildout, na.rm = TRUE),
        plan_carsten = sum(.data$plan_carsten, na.rm = TRUE),
        port_weight = unique(.data$port_weight)
      ) %>%
      ungroup() %>%
      mutate(y = .data$plan_buildout / .data$scen_buildout) %>%
      filter(.data$green) %>%
      select(-"plan_buildout", -"scen_buildout", -"green") %>%
      filter(!is.na(.data$plan_tech_share)) %>%
      rowwise() %>%
      mutate(y = max(.data$y, 0, na.rm = TRUE)) %>%
      ungroup() %>%
      mutate(asset_class = "Listed Equity")

    bonds_data <-
      bonds_results_company %>%
      filter(.data$portfolio_name == .env$portfolio_name,
             .data$allocation == "portfolio_weight" ) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market == "GlobalMarket") %>%
      filter(.data$year %in% c(.env$start_year, .env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Power", "Automotive")) %>%
      filter(.data$scenario_geography == "Global") %>%
      group_by(.data$id, .data$company_name,
               .data$technology, .data$year) %>%  # HACK to get rid of duplicated
      filter(row_number() == 1) %>%               # rows for company/tech/year
      group_by(.data$company_name, .data$technology) %>%
      arrange(.data$year) %>%
      mutate(plan_buildout = .data$plan_tech_prod[2] - .data$plan_tech_prod[1],
             scen_buildout = .data$scen_tech_prod[2] - .data$scen_tech_prod[1]) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(green = .data$technology %in% .env$green_techs) %>%
      group_by(.data$company_name, .data$scenario,  .data$ald_sector,
               .data$green, .data$year) %>%
      reframe(
        plan_tech_share = sum(.data$plan_tech_share, na.rm = TRUE),
        plan_buildout = sum(.data$plan_buildout, na.rm = TRUE),
        scen_buildout = sum(.data$scen_buildout, na.rm = TRUE),
        plan_carsten = sum(.data$plan_carsten, na.rm = TRUE),
        port_weight = unique(.data$port_weight)
      ) %>%
      ungroup() %>%
      mutate(y = .data$plan_buildout / .data$scen_buildout) %>%
      filter(.data$green) %>%
      select(-"plan_buildout", -"scen_buildout", -"green") %>%
      filter(!is.na(.data$plan_tech_share)) %>%
      rowwise() %>%
      mutate(y = max(.data$y, 0, na.rm = TRUE)) %>%
      ungroup() %>%
      mutate(asset_class = "Corporate Bonds")

    bind_rows(equity_data, bonds_data)
  }
