calculate_report_content_variables <-
  function(audit_file,
           investor_name = "Meta Investor",
           portfolio_name = "Meta Portfolio",
           currency_exchange_value) {

    if (isFALSE(investor_name %in% audit_file$investor_name)) {
      stop("`investor_name` is not found in `audit_file$investor_name`")
    }

    audit_file <-
      audit_file  %>%
      filter(.data$investor_name == .env$investor_name,
             .data$portfolio_name == .env$portfolio_name)

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

    list(InvestorName = investor_name,
         PortfolioName = portfolio_name,
         total_portfolio_value_curr = format(total_portfolio_value_curr, big.mark = ","),
         total_portfolio_percentage_equity = sprintf("%.0f", 100 * total_portfolio_percentage_equity),
         total_portfolio_percentage_bonds = sprintf("%.0f", 100 * total_portfolio_percentage_bonds),
         total_portfolio_percentage_other_asset_classes = sprintf("%.0f", 100 * total_portfolio_percentage_other_asset_classes),
         total_portfolio_percentage_coverage = sprintf("%.0f", 100 * total_portfolio_percentage_coverage),
         results_absolute_value_equity = format(results_absolute_value_equity, big.mark = ","),
         results_absolute_value_bonds = format(results_absolute_value_bonds, big.mark = ",")
    )
  }
