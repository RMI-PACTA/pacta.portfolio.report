prep_trajectory_alignment <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           peers_equity_results_portfolio,
           peers_bonds_results_portfolio,
           indices_equity_results_portfolio,
           indices_bonds_results_portfolio,
           investor_name,
           portfolio_name,
           tech_roadmap_sectors,
           peer_group,
           start_year,
           year_span,
           scen_geo_levels,
           all_tech_levels) {

    portfolio <-
      list(`Listed Equity` = equity_results_portfolio,
           `Corporate Bonds` = bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name) %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(.data$scenario_geography != "GlobalAggregate") %>%
      group_by(.data$asset_class,
               .data$allocation,
               .data$equity_market,
               .data$technology,
               .data$scenario) %>%
      filter(n() > 1) %>%
      ungroup()

    asset_classes <-
      portfolio %>%
      pull("asset_class") %>%
      unique()

    equity_markets <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull("equity_market") %>%
      unique()

    bonds_markets <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull("equity_market") %>%
      unique()

    equity_techs <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull("technology") %>%
      unique()

    equity_scenario_geography <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull("scenario_geography") %>%
      unique()

    bonds_scenario_geography <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull("scenario_geography") %>%
      unique()

    bonds_techs <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull("technology") %>%
      unique()

    peers <-
      list(`Listed Equity` = peers_equity_results_portfolio,
           `Corporate Bonds` = peers_bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(.data$scenario_geography != "GlobalAggregate") %>%
      filter(.data$asset_class %in% .env$asset_classes) %>%
      filter(.data$asset_class == "Listed Equity" & .data$equity_market %in% .env$equity_markets |
               .data$asset_class == "Corporate Bonds" & .data$equity_market %in% .env$bonds_markets) %>%
      filter(.data$asset_class == "Listed Equity" & .data$technology %in% .env$equity_techs |
               .data$asset_class == "Corporate Bonds" & .data$technology %in% .env$bonds_techs) %>%
      filter(.data$asset_class == "Listed Equity" & .data$scenario_geography %in% .env$equity_scenario_geography |
               .data$asset_class == "Corporate Bonds" & .data$scenario_geography %in% .env$bonds_scenario_geography) %>%
      filter(.data$investor_name == .env$peer_group)

    indices <-
      list(`Listed Equity` = indices_equity_results_portfolio,
           `Corporate Bonds` = indices_bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(.data$scenario_geography != "GlobalAggregate") %>%
      filter(.data$asset_class %in% .env$asset_classes) %>%
      filter(.data$asset_class == "Listed Equity" & .data$equity_market %in% .env$equity_markets |
               .data$asset_class == "Corporate Bonds" & .data$equity_market %in% .env$bonds_markets) %>%
      filter(.data$asset_class == "Listed Equity" & .data$technology %in% .env$equity_techs |
               .data$asset_class == "Corporate Bonds" & .data$technology %in% .env$bonds_techs) %>%
      filter(.data$asset_class == "Listed Equity" & .data$scenario_geography %in% .env$equity_scenario_geography |
               .data$asset_class == "Corporate Bonds" & .data$scenario_geography %in% .env$bonds_scenario_geography)

    benchmark_data <- bind_rows(peers, indices)

    cols_with_supporting_info <- c("benchmark", "portfolio_name", "asset_class", "equity_market",
             "scenario_source", "scenario_geography", "allocation",
             "ald_sector", "technology", "year", "unit")

    list(portfolio = portfolio,
         benchmark = benchmark_data) %>%
      bind_rows(.id = "benchmark") %>%
      mutate(benchmark = .data$benchmark == "benchmark") %>%
      mutate(unit = case_when(
        .data$ald_sector == "Power" ~ "MW",
        .data$ald_sector == "Oil&Gas" ~ "GJ/a",
        .data$ald_sector == "Coal" ~ "t/a",
        .data$ald_sector == "Automotive" ~ "number of cars",
        .data$ald_sector == "Aviation" ~ "number of planes",
        .data$ald_sector == "Cement" ~ "t/a",
        .data$ald_sector == "Steel" ~ "t/a"
      )) %>%
      select(all_of(cols_with_supporting_info), "scenario",
             production = "plan_alloc_wt_tech_prod", "scen_alloc_wt_tech_prod") %>%
      pivot_wider(names_from = "scenario", values_from = "scen_alloc_wt_tech_prod") %>%
      pivot_longer(cols = -cols_with_supporting_info, names_to = "scenario", values_to = "value",
                   values_drop_na = TRUE) %>%
      mutate(value = if_else(.data$year > min(.data$year + 5) & .data$value == 0, NA_real_, .data$value)) %>%
      filter(!is.na(.data$value)) %>%
      filter(.data$scenario == "production" | !.data$benchmark) %>%
      mutate(equity_market =  case_when(
        .data$equity_market == "GlobalMarket" ~ "Global Market",
        .data$equity_market == "DevelopedMarket" ~ "Developed Market",
        .data$equity_market == "EmergingMarket" ~ "Emerging Market",
        TRUE ~ .data$equity_market)
      ) %>%
      mutate(allocation = case_when(
        .data$allocation == "portfolio_weight" ~ "Portfolio Weight",
        .data$allocation == "ownership_weight" ~ "Ownership Weight",
      )) %>%
      filter(.data$year <= .env$start_year + .env$year_span) %>%
      arrange(.data$asset_class,
              factor(.data$equity_market, levels = c("Global Market", "Developed Market", "Emerging Market")),
              factor(.data$scenario_source, levels = c("WEO2021", "GECO2021", "ETP2020", "IPR2021", "ISF2021")),
              factor(.data$scenario_geography, levels = .env$scen_geo_levels),
              factor(.data$technology, levels = .env$all_tech_levels))
  }
