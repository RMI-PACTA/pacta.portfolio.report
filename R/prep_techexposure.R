prep_techexposure <-
  function(
    equity_results_portfolio,
    bonds_results_portfolio,
    investor_name,
    portfolio_name,
    indices_equity_results_portfolio,
    indices_bonds_results_portfolio,
    peers_equity_results_portfolio,
    peers_bonds_results_portfolio,
    peer_group,
    select_scenario_other,
    select_scenario,
    start_year,
    green_techs,
    equity_market_levels,
    all_tech_levels
    ) {
    portfolio <-
      list(`Listed Equity` = equity_results_portfolio,
           `Corporate Bonds` = bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name) %>%
      filter(!is.na(.data$ald_sector))

    asset_classes <-
      portfolio %>%
      pull("asset_class") %>%
      unique()

    equity_sectors <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      pull("ald_sector") %>%
      unique()

    bonds_sectors <-
      portfolio %>%
      filter(.data$asset_class == "Corporate Bonds") %>%
      pull("ald_sector") %>%
      unique()

    indices <-
      list(`Listed Equity` = indices_equity_results_portfolio,
           `Corporate Bonds` = indices_bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$asset_class %in% .env$asset_classes) %>%
      filter(.data$asset_class == "Listed Equity" & .data$ald_sector %in% .env$equity_sectors |
               .data$asset_class == "Corporate Bonds" & .data$ald_sector %in% .env$bonds_sectors)

    peers <-
      list(`Listed Equity` = peers_equity_results_portfolio,
           `Corporate Bonds` = peers_bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$asset_class %in% .env$asset_classes) %>%
      filter(.data$asset_class == "Listed Equity" & .data$ald_sector %in% .env$equity_sectors |
               .data$asset_class == "Corporate Bonds" & .data$ald_sector %in% .env$bonds_sectors) %>%
      filter(.data$investor_name == .env$peer_group)

    bind_rows(portfolio, peers, indices) %>%
      filter(.data$allocation == "portfolio_weight") %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$scenario_geography == "Global") %>%
      filter(.data$year == .env$start_year) %>%
      filter(.data$equity_market == "GlobalMarket") %>%
      mutate(green = .data$technology %in% .env$green_techs) %>%
      group_by(.data$asset_class, .data$equity_market, .data$portfolio_name, .data$ald_sector) %>%
      arrange(.data$asset_class,  .data$portfolio_name,
              factor(.data$technology, levels = all_tech_levels), desc(.data$green)) %>%
      mutate(sector_sum = sum(.data$plan_carsten)) %>%
      mutate(sector_prcnt = .data$plan_carsten / sum(.data$plan_carsten)) %>%
      mutate(sector_cumprcnt = cumsum(.data$sector_prcnt)) %>%
      mutate(sector_cumprcnt = lag(.data$sector_cumprcnt, default = 0)) %>%
      mutate(cumsum = cumsum(.data$plan_carsten)) %>%
      mutate(cumsum = lag(.data$cumsum, default = 0)) %>%
      ungroup() %>%
      group_by(.data$asset_class, .data$equity_market, .data$portfolio_name, .data$ald_sector, .data$green) %>%
      mutate(green_sum = sum(.data$plan_carsten)) %>%
      mutate(green_prcnt = sum(.data$plan_carsten) / .data$sector_sum) %>%
      ungroup() %>%
      mutate(this_portfolio = .data$portfolio_name == .env$portfolio_name) %>%
      mutate(equity_market =  case_when(
        .data$equity_market == "GlobalMarket" ~ "Global Market",
        .data$equity_market == "DevelopedMarket" ~ "Developed Market",
        .data$equity_market == "EmergingMarket" ~ "Emerging Market",
        TRUE ~ .data$equity_market)
      ) %>%
      arrange(.data$asset_class, factor(.data$equity_market, levels = equity_market_levels), desc(.data$this_portfolio), .data$portfolio_name,
              factor(.data$technology, levels = all_tech_levels), desc(.data$green)) %>%
      select("asset_class", "equity_market", "portfolio_name", "this_portfolio", "ald_sector", "technology",
             "plan_carsten", "sector_sum", "sector_prcnt", "cumsum", "sector_cumprcnt",
             "green", "green_sum", "green_prcnt")
  }
