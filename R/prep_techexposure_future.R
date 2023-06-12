prep_techexposure_future <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           indices_equity_results_portfolio,
           indices_bonds_results_portfolio,
           peers_equity_results_portfolio,
           peers_bonds_results_portfolio,
           investor_name,
           portfolio_name,
           tech_roadmap_sectors,
           peer_group,
           start_year,
           year_span,
           all_tech_levels) {

    portfolio <-
      list(`Listed Equity` = equity_results_portfolio,
           `Corporate Bonds` = bonds_results_portfolio) %>%
      bind_rows(.id = "asset_class") %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name) %>%
      filter(!is.na(.data$ald_sector)) %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors)

    asset_classes <-
      portfolio %>%
      pull("asset_class") %>%
      unique()

    equity_sectors <-
      portfolio %>%
      filter(.data$asset_class == "Listed Equity") %>%
      filter(.data$allocation == "portfolio_weight") %>%
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

    techexposure_future_data <-
      bind_rows(portfolio, peers, indices) %>%
      filter(.data$allocation == "portfolio_weight") %>%
      filter(.data$scenario_geography == "Global") %>%
      filter(.data$year == .env$start_year + .env$year_span)

    if (nrow(techexposure_future_data) > 0) {
      techexposure_future_data <-
        techexposure_future_data %>%
        group_by(.data$asset_class, .data$equity_market, .data$portfolio_name,
                 .data$ald_sector, .data$scenario) %>%
        arrange(.data$asset_class, .data$portfolio_name, .data$ald_sector) %>%
        mutate(plan_alloc_wt_tech_prod = if_else(.data$ald_sector == "Coal", .data$plan_alloc_wt_tech_prod * 29.31, .data$plan_alloc_wt_tech_prod), # convert tonnes/year -> GJ/year
               scen_alloc_wt_tech_prod = if_else(.data$ald_sector == "Coal", .data$scen_alloc_wt_tech_prod * 29.31, .data$scen_alloc_wt_tech_prod),
               ald_sector = if_else(.data$technology %in% c("Coal", "Oil", "Gas"), "Fossil Fuels", .data$ald_sector)) %>%
        group_by(.data$asset_class, .data$equity_market, .data$portfolio_name,
                 .data$ald_sector, .data$scenario) %>%
        mutate(plan_alloc_wt_sec_prod = sum(.data$plan_alloc_wt_tech_prod),
               scen_alloc_wt_sec_prod = sum(.data$scen_alloc_wt_tech_prod)) %>%
        mutate(plan = if_else(.data$plan_alloc_wt_tech_prod > 0, .data$plan_alloc_wt_tech_prod / .data$plan_alloc_wt_sec_prod, 0),
               scen = if_else(.data$scen_alloc_wt_tech_prod > 0, .data$scen_alloc_wt_tech_prod / .data$scen_alloc_wt_sec_prod, 0)) %>%
        select("asset_class", "investor_name", "portfolio_name", "scenario",
               "allocation", "equity_market", "scenario_geography", "year",
               "ald_sector", "technology", "plan", "scen") %>%
        pivot_longer(
          cols = -c("asset_class", "investor_name", "portfolio_name", "scenario",
                    "allocation", "equity_market", "scenario_geography", "year",
                    "ald_sector","technology"),
          names_to = "val_type", values_to = "value") %>%
        ungroup() %>%
        mutate(this_portfolio = .data$portfolio_name == .env$portfolio_name,
               val_type = if_else(.data$this_portfolio == TRUE, paste0(.data$val_type, "_portfolio"), paste0(.data$val_type, "_benchmark"))) %>%
        mutate(equity_market =  case_when(
          .data$equity_market == "GlobalMarket" ~ "Global Market",
          .data$equity_market == "DevelopedMarket" ~ "Developed Market",
          .data$equity_market == "EmergingMarket" ~ "Emerging Market",
          TRUE ~ .data$equity_market)
        ) %>%
        mutate(val_type =  case_when(
          .data$val_type == "plan_portfolio" ~ "Portfolio",
          .data$val_type == "scen_portfolio" ~ "Aligned Portfolio",
          .data$val_type == "plan_benchmark" ~ "Benchmark",
          .data$val_type == "scen_benchmark" ~ "Aligned Benchmark",
          TRUE ~ .data$val_type)
        ) %>%
        arrange(
          .data$asset_class,
          factor(.data$equity_market, levels = c("Global Market", "Developed Market", "Emerging Market")),
          desc(.data$this_portfolio),
          factor(.data$val_type, levels = c("Portfolio", "Aligned Portfolio", "Benchmark", "Aligned Benchmark")),
          .data$portfolio_name,
          factor(.data$technology, levels = .env$all_tech_levels)
        ) %>%
        mutate(scenario = str_replace(.data$scenario, "_", ": ")) %>%
        select("asset_class", "equity_market", "portfolio_name", "scenario",
               "this_portfolio", "val_type", "ald_sector", "technology", "value")
    }

    techexposure_future_data
  }
