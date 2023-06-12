prep_peer_table <-
  function(equity_results_portfolio,
           bonds_results_portfolio,
           peers_equity_results_user,
           peers_bonds_results_user,
           investor_name,
           portfolio_name,
           portfolio_allocation_method,
           start_year,
           tech_roadmap_sectors,
           peer_group,
           select_scenario,
           select_scenario_other) {

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
      filter(.data$year == .env$start_year + 5) %>%
      filter(.data$scenario_geography == "Global") %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(!grepl("_HDV", .data$technology)) %>%
      select("portfolio_name", "ald_sector", "technology",
             "trajectory_alignment") %>%
      mutate(asset_class = "Listed Equity") %>%
      mutate(this_portfolio = TRUE) %>%
      mutate(peer_group = .env$peer_group)

    equity_techs <- equity$technology %>% unique()

    equity_peers <-
      peers_equity_results_user %>%
      filter(.data$allocation == .env$portfolio_allocation_method) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global","GlobalMarket")) %>%
      filter(.data$year == .env$start_year + 5) %>%
      filter(.data$scenario_geography == "Global") %>%
      filter(.data$technology %in% .env$equity_techs) %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(.data$portfolio_name != .env$investor_name) %>%
      select("investor_name", "portfolio_name", "ald_sector", "technology",
             "trajectory_alignment") %>%
      mutate(portfolio_name = "") %>%
      mutate(asset_class = "Listed Equity") %>%
      mutate(this_portfolio = FALSE) %>%
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
      filter(.data$equity_market %in% c("Global","GlobalMarket")) %>%
      filter(.data$year == .env$start_year + 5) %>%
      filter(.data$scenario_geography == "Global") %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(!grepl("_HDV", .data$technology)) %>%
      select("portfolio_name", "ald_sector", "technology",
             "trajectory_alignment") %>%
      mutate(asset_class = "Corporate Bonds") %>%
      mutate(this_portfolio = TRUE) %>%
      mutate(peer_group = .env$peer_group)

    bonds_techs <- bonds$technology %>% unique()

    bonds_peers <-
      peers_bonds_results_user %>%
      filter(.data$allocation == .env$portfolio_allocation_method) %>%
      filter_scenarios_per_sector(
        select_scenario_other,
        select_scenario
      ) %>%
      filter(.data$equity_market %in% c("Global","GlobalMarket")) %>%
      filter(.data$year == .env$start_year + 5) %>%
      filter(.data$scenario_geography == "Global") %>%
      filter(.data$technology %in% .env$bonds_techs) %>%
      filter(.data$ald_sector %in% .env$tech_roadmap_sectors) %>%
      filter(.data$portfolio_name != .env$investor_name) %>%
      select("investor_name", "portfolio_name", "ald_sector", "technology",
             "trajectory_alignment") %>%
      mutate(portfolio_name = "") %>%
      mutate(asset_class = "Corporate Bonds") %>%
      mutate(this_portfolio = FALSE) %>%
      rename(peer_group = "investor_name")

    if (nrow(equity) > 0) {
      equity <-
        bind_rows(equity, equity_peers) %>%
        group_by(.data$technology) %>%
        mutate(rank = min_rank(-.data$trajectory_alignment)) %>%
        mutate(rank_str = paste0("#", .data$rank, " of ", max(.data$rank))) %>%
        ungroup() %>%
        group_by(.data$peer_group, .data$technology) %>%
        mutate(rank_grp = min_rank(-.data$trajectory_alignment)) %>%
        mutate(rank_grp_str = paste0("#", .data$rank_grp, " of ", max(.data$rank_grp))) %>%
        ungroup()

    } else {
      equity <-
        equity %>%
        slice(0) %>%
        mutate(rank_str = NA_character_) %>%
        mutate(rank_grp_str = NA_character_)
    }

    if (nrow(bonds) > 0) {
      bonds <-
        bind_rows(bonds, bonds_peers) %>%
        group_by(.data$technology) %>%
        mutate(rank = min_rank(-.data$trajectory_alignment)) %>%
        mutate(rank_str = paste0("#", .data$rank, " of ", max(.data$rank))) %>%
        ungroup() %>%
        group_by(.data$peer_group, .data$technology) %>%
        mutate(rank_grp = min_rank(-.data$trajectory_alignment)) %>%
        mutate(rank_grp_str = paste0("#", .data$rank_grp, " of ", max(.data$rank_grp))) %>%
        ungroup()

    } else {
      bonds <-
        bonds %>%
        slice(0) %>%
        mutate(rank_str = NA_character_) %>%
        mutate(rank_grp_str = NA_character_)
    }

    bind_rows(equity, bonds) %>%
      filter(.data$this_portfolio) %>%
      ungroup() %>%
      mutate(Technology = gsub("Cap", " Power", .data$technology)) %>%
      select(`Asset Class` = "asset_class",
             Sector = "ald_sector",
             "Technology",
             `Rank among peer group` = "rank_grp_str",
             `Rank among all participants` = "rank_str"
      )
  }
