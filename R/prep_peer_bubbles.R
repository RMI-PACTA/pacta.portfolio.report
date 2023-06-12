prep_peer_bubbles <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           peers_equity_results_user,
           peers_bonds_results_user,
           investor_name,
           portfolio_name,
           peer_group,
           select_scenario,
           select_scenario_other,
           start_year,
           green_techs,
           portfolio_allocation_method) {

    peer_group_text <- peer_group

    equity <-
      equity_results_portfolio %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name,
             .data$allocation == .env$portfolio_allocation_method) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global", "GlobalMarket")) %>%
      filter(.data$year %in% c(.env$start_year, .env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Automotive", "Power")) %>%
      filter(.data$scenario_geography == "Global") %>%
      group_by(.data$portfolio_name, .data$technology) %>%
      arrange(.data$year) %>%
      mutate(plan_buildout = .data$plan_tech_prod[2] - .data$plan_tech_prod[1],
             scen_buildout = .data$scen_tech_prod[2] - .data$scen_tech_prod[1]) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(green = .data$technology %in% .env$green_techs) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$ald_sector,
               .data$green, .data$scenario, .data$year) %>%
      summarise(plan_tech_share = sum(.data$plan_tech_share, na.rm = TRUE),
                plan_buildout = sum(.data$plan_buildout, na.rm = TRUE),
                scen_buildout = sum(.data$scen_buildout, na.rm = TRUE),
                .groups = "drop") %>%
      mutate(y = .data$plan_buildout / .data$scen_buildout) %>%
      filter(.data$green) %>%
      select(-"plan_buildout", -"scen_buildout", -"green") %>%
      filter(.data$plan_tech_share != 0) %>%
      mutate(asset_class = "Listed Equity") %>%
      mutate(this_portfolio = TRUE) %>%
      mutate(peer_group = .env$peer_group_text)

    equity_peers <-
      peers_equity_results_user %>%
      filter(.data$allocation == .env$portfolio_allocation_method) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global", "GlobalMarket")) %>%
      filter(.data$year %in% c(.env$start_year, .env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Automotive", "Power")) %>%
      filter(.data$scenario_geography == "Global") %>%
      group_by(.data$portfolio_name, .data$technology) %>%
      arrange(.data$year) %>%
      mutate(plan_buildout = .data$plan_tech_prod[2] - .data$plan_tech_prod[1],
             scen_buildout = .data$scen_tech_prod[2] - .data$scen_tech_prod[1]) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(green = .data$technology %in% .env$green_techs) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$ald_sector,
               .data$green, .data$scenario, .data$year) %>%
      summarise(plan_tech_share = sum(.data$plan_tech_share, na.rm = TRUE),
                plan_buildout = sum(.data$plan_buildout, na.rm = TRUE),
                scen_buildout = sum(.data$scen_buildout, na.rm = TRUE),
                .groups = "drop") %>%
      mutate(y = .data$plan_buildout / .data$scen_buildout) %>%
      filter(.data$green) %>%
      select(-"plan_buildout", -"scen_buildout", -"green") %>%
      filter(.data$plan_tech_share != 0) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$ald_sector) %>%
      mutate(y = max(.data$y, 0, na.rm = TRUE)) %>%
      ungroup() %>%
      mutate(asset_class = "Listed Equity") %>%
      mutate(this_portfolio = .data$portfolio_name == .env$investor_name) %>%
      filter(.data$this_portfolio == FALSE) %>%
      mutate(portfolio_name = "") %>%
      rename(peer_group = "investor_name")

    bonds <-
      bonds_results_portfolio %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name,
             .data$allocation == .env$portfolio_allocation_method) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global", "GlobalMarket")) %>%
      filter(.data$year %in% c(.env$start_year, .env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Automotive", "Power")) %>%
      filter(.data$scenario_geography == "Global") %>%
      group_by(.data$portfolio_name, .data$technology) %>%
      arrange(.data$year) %>%
      mutate(plan_buildout = .data$plan_tech_prod[2] - .data$plan_tech_prod[1],
             scen_buildout = .data$scen_tech_prod[2] - .data$scen_tech_prod[1]) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(green = .data$technology %in% green_techs) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$ald_sector,
               .data$green, .data$scenario, .data$year) %>%
      summarise(plan_tech_share = sum(.data$plan_tech_share, na.rm = TRUE),
                plan_buildout = sum(.data$plan_buildout, na.rm = TRUE),
                scen_buildout = sum(.data$scen_buildout, na.rm = TRUE),
                .groups = "drop") %>%
      mutate(y = .data$plan_buildout / .data$scen_buildout) %>%
      filter(.data$green) %>%
      select(-"plan_buildout", -"scen_buildout", -"green") %>%
      filter(.data$plan_tech_share != 0) %>%
      mutate(asset_class = "Corporate Bonds") %>%
      mutate(this_portfolio = TRUE) %>%
      mutate(peer_group = .env$peer_group_text)

    bonds_peers <-
      peers_bonds_results_user %>%
      filter(.data$allocation == .env$portfolio_allocation_method) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global", "GlobalMarket")) %>%
      filter(.data$year %in% c(.env$start_year, .env$start_year + 5)) %>%
      filter(.data$ald_sector %in% c("Automotive", "Power")) %>%
      filter(.data$scenario_geography == "Global") %>%
      group_by(.data$portfolio_name, .data$technology) %>%
      arrange(.data$year) %>%
      mutate(plan_buildout = .data$plan_tech_prod[2] - .data$plan_tech_prod[1],
             scen_buildout = .data$scen_tech_prod[2] - .data$scen_tech_prod[1]) %>%
      filter(.data$year == .env$start_year) %>%
      mutate(green = .data$technology %in% .env$green_techs) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$ald_sector,
               .data$green, .data$scenario, .data$year) %>%
      summarise(plan_tech_share = sum(.data$plan_tech_share, na.rm = TRUE),
                plan_buildout = sum(.data$plan_buildout, na.rm = TRUE),
                scen_buildout = sum(.data$scen_buildout, na.rm = TRUE),
                .groups = "drop") %>%
      mutate(y = .data$plan_buildout / .data$scen_buildout) %>%
      filter(.data$green) %>%
      select(-"plan_buildout", -"scen_buildout", -"green") %>%
      filter(.data$plan_tech_share != 0) %>%
      group_by(.data$investor_name, .data$portfolio_name, .data$ald_sector) %>%
      mutate(y = max(.data$y, 0, na.rm = TRUE)) %>%
      ungroup() %>%
      mutate(asset_class = "Corporate Bonds") %>%
      mutate(this_portfolio = .data$portfolio_name == .env$investor_name) %>%
      filter(.data$this_portfolio == FALSE) %>%
      mutate(portfolio_name = "") %>%
      rename(peer_group = "investor_name")


    if (nrow(equity) > 0) {
      equity <- bind_rows(equity, equity_peers)
    } else {
      equity <- equity %>% slice(0)
    }

    if (nrow(bonds) > 0) {
      bonds <- bind_rows(bonds, bonds_peers)
    } else {
      bonds <- bonds %>% slice(0)
    }

    bind_rows(equity, bonds)
  }
