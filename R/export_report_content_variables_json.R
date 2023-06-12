export_report_content_variables_json <-
  function(audit_file,
           results_port_eq,
           results_port_cb,
           results_company_eq,
           results_company_cb,
           investor_name = "Meta Investor",
           portfolio_name = "Meta Portfolio",
           scenario,
           scenario_geography,
           allocation,
           start_year,
           currency_exchange_value) {

    if (isFALSE(investor_name %in% audit_file$investor_name)) {
      stop("`investor_name` is not found in `audit_file$investor_name`")
    }

    audit_file <-
      audit_file  %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name)

    results_port_eq <-
      results_port_eq  %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name,
             .data$year == .env$start_year,
             .data$scenario == .env$scenario,
             .data$scenario_geography == .env$scenario_geography,
             .data$allocation == .env$allocation)

    results_port_cb <-
      results_port_cb  %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name,
             .data$year == .env$start_year,
             .data$scenario == .env$scenario,
             .data$scenario_geography == .env$scenario_geography,
             .data$allocation == .env$allocation)

    results_company_eq <-
      results_company_eq  %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name,
             .data$year == .env$start_year,
             .data$scenario == .env$scenario,
             .data$scenario_geography == .env$scenario_geography,
             .data$allocation == .env$allocation)

    results_company_cb <-
      results_company_cb  %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name,
             .data$year == .env$start_year,
             .data$scenario == .env$scenario,
             .data$scenario_geography == .env$scenario_geography,
             .data$allocation == .env$allocation)

    add_green_brown_ <- function(data) {
      stopifnot(utils::hasName(data, "technology"))

      restore_groups <- dplyr::group_vars(data)

      data %>%
        dplyr::group_by(.data$technology) %>%
        mutate(green_brown_ = green_brown(unique(.data$technology))) %>%
        dplyr::grouped_df(restore_groups)
    }

    results_port_eq <- results_port_eq %>% add_green_brown_()
    results_port_cb <- results_port_cb %>% add_green_brown_()

    unique_isins <-
      audit_file %>%
      filter(investor_name == .env$investor_name,
             portfolio_name == .env$portfolio_name) %>%
      dplyr::pull("isin") %>%
      unique() %>%
      length()

    total_portfolio_value_curr <-
      audit_file %>%
      dplyr::mutate(value_usd = dplyr::if_else(.data$value_usd < 0, 0, .data$value_usd)) %>%
      dplyr::mutate(value_curr = .data$value_usd / .env$currency_exchange_value) %>%
      dplyr::pull("value_curr") %>%
      sum(na.rm = TRUE)

    total_portfolio_percentage_equity <-
      (audit_file %>% filter(.data$asset_type == "Equity") %>% mutate(value_curr = .data$value_usd / .env$currency_exchange_value) %>% dplyr::pull("value_curr") %>% sum(na.rm = TRUE)) / total_portfolio_value_curr

    total_portfolio_percentage_bonds <-
      (audit_file %>% filter(.data$asset_type == "Bonds")  %>% mutate(value_curr = .data$value_usd / .env$currency_exchange_value) %>% dplyr::pull("value_curr") %>% sum(na.rm = TRUE)) / total_portfolio_value_curr

    total_portfolio_percentage_other_asset_classes <-
      (audit_file %>% filter(.data$asset_type == "Others") %>% mutate(value_curr = .data$value_usd / .env$currency_exchange_value) %>% dplyr::pull("value_curr") %>% sum(na.rm = TRUE)) / total_portfolio_value_curr

    total_portfolio_percentage_coverage <- (total_portfolio_percentage_equity + total_portfolio_percentage_bonds)

    results_absolute_value_equity <- audit_file %>% filter(.data$asset_type == "Equity", .data$valid_input == TRUE) %>% mutate(value_curr = .data$value_usd / .env$currency_exchange_value) %>% dplyr::pull("value_curr") %>% sum(na.rm = TRUE)
    results_absolute_value_bonds <- audit_file %>% filter(.data$asset_type == "Bonds", .data$valid_input == TRUE) %>% mutate(value_curr = .data$value_usd / .env$currency_exchange_value) %>% dplyr::pull("value_curr") %>% sum(na.rm = TRUE)
    results_absolute_value_valid_input <- results_absolute_value_equity + results_absolute_value_bonds

    results_percentage_climate_rel_value_equity <- results_port_eq %>% filter(.data$ald_sector != "Other") %>% dplyr::pull("plan_carsten") %>% sum( na.rm = TRUE)
    results_percentage_climate_rel_value_bonds <- results_port_cb %>% filter(.data$ald_sector != "Other") %>% dplyr::pull("plan_carsten") %>% sum( na.rm = TRUE)
    results_percentage_climate_rel <- results_percentage_climate_rel_value_equity + results_percentage_climate_rel_value_bonds

    results_percentage_climate_rel_value <-  ((results_percentage_climate_rel_value_bonds * results_absolute_value_bonds) +
                                                (results_percentage_climate_rel_value_equity * results_absolute_value_equity)) / results_absolute_value_valid_input

    results_percentage_lowcarb_value_equity <- results_port_eq %>% filter(.data$green_brown_ == "green") %>% dplyr::pull("plan_carsten") %>% sum( na.rm = TRUE)
    results_percentage_lowcarb_value_bonds  <- results_port_cb %>% filter(.data$green_brown_ == "green") %>% dplyr::pull("plan_carsten") %>% sum( na.rm = TRUE)

    results_percentage_highcarb_value_equity <- results_port_eq %>% filter(.data$green_brown_ == "brown") %>% dplyr::pull("plan_carsten") %>% sum( na.rm = TRUE)
    results_percentage_highcarb_value_bonds <-  results_port_cb %>% filter(.data$green_brown_ == "brown") %>% dplyr::pull("plan_carsten") %>% sum( na.rm = TRUE)

    results_absolute_lowcarb_value_equity <-  results_percentage_lowcarb_value_equity * results_absolute_value_equity
    results_absolute_lowcarb_value_bonds <- results_percentage_lowcarb_value_bonds * results_absolute_value_bonds

    results_absolute_highcarb_value_equity  <-  results_percentage_highcarb_value_equity * results_absolute_value_equity
    results_absolute_highcarb_value_bonds <- results_percentage_highcarb_value_bonds * results_absolute_value_bonds

    results_percentage_highcarb_value <- (results_absolute_highcarb_value_bonds + results_absolute_highcarb_value_equity) / (results_absolute_value_bonds + results_absolute_value_equity)
    results_percentage_lowcarb_value <- (results_absolute_lowcarb_value_bonds + results_absolute_lowcarb_value_equity) / (results_absolute_value_bonds + results_absolute_value_equity)

    results_company_nr_relevent_companies <- "5"

    list(InvestorName = investor_name,
         PortfolioName = portfolio_name,
         unique_isins = unique_isins,
         total_portfolio_value_curr = format(total_portfolio_value_curr, big.mark = ","),
         total_portfolio_percentage_equity = sprintf("%.0f", 100 * total_portfolio_percentage_equity),
         total_portfolio_percentage_bonds = sprintf("%.0f", 100 * total_portfolio_percentage_bonds),
         total_portfolio_percentage_other_asset_classes = sprintf("%.0f", 100 * total_portfolio_percentage_other_asset_classes),
         total_portfolio_percentage_coverage = sprintf("%.0f", 100 * total_portfolio_percentage_coverage),
         results_percentage_climate_rel_value = sprintf("%.0f", 100 * results_percentage_climate_rel_value),
         results_absolute_value_equity = format(results_absolute_value_equity, big.mark = ","),
         results_absolute_value_bonds = format(results_absolute_value_bonds, big.mark = ","),
         results_percentage_climate_rel_value_bonds = sprintf("%.0f", 100 * results_percentage_climate_rel_value_bonds),
         results_percentage_climate_rel_value_equity = sprintf("%.0f", 100 * results_percentage_climate_rel_value_equity),
         results_absolute_highcarb_value_bonds = results_absolute_highcarb_value_bonds,
         results_absolute_highcarb_value_equity = results_absolute_highcarb_value_equity,
         results_percentage_highcarb_value_bonds = sprintf("%.0f", 100 * results_percentage_highcarb_value_bonds),
         results_percentage_highcarb_value_equity = sprintf("%.0f", 100 * results_percentage_highcarb_value_equity),
         results_percentage_lowcarb_value_bonds = sprintf("%.0f", 100 * results_percentage_lowcarb_value_bonds),
         results_percentage_lowcarb_value_equity = sprintf("%.0f", 100 * results_percentage_lowcarb_value_equity),
         results_percentage_lowcarb_value = sprintf("%.0f", 100 * results_percentage_lowcarb_value),
         results_percentage_highcarb_value = sprintf("%.0f", 100 * results_percentage_highcarb_value),
         results_company_nr_relevent_companies = results_company_nr_relevent_companies
    )
  }
