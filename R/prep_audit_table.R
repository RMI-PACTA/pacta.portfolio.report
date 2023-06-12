prep_audit_table <-
  function(audit_file, investor_name, portfolio_name, currency_exchange_value) {
    sort_order <- c(
      "Bonds",
      "Equity",
      "Other",
      "Unclassified"
    )

    audit_table_init <-
      audit_file %>%
      filter(
        .data$investor_name == .env$investor_name,
        .data$portfolio_name == .env$portfolio_name
      ) %>%
      mutate(asset_type = if_else(
        .data$valid_input, .data$asset_type, "Unknown"
      )) %>%
      mutate(is_included = if_else(
        .data$asset_type %in% c("Others", "Funds"), FALSE, .data$valid_input
      )) %>%
      mutate(included = if_else(.data$is_included, "Yes", "No")) %>%
      mutate(asset_type_analysis = case_when(
        .data$asset_type %in% c("Bonds", "Equity") ~ .data$asset_type,
        .data$asset_type == "Others" ~ "Other",
        (.data$asset_type == "Funds") & (.data$direct_holding) ~ "Other",
        TRUE ~ "Unclassified"
      )) %>%
      mutate(
        asset_type_analysis =
          factor(.data$asset_type_analysis, levels = .env$sort_order)
      ) %>%
      mutate(value_usd = if_else(.data$value_usd < 0, 0, .data$value_usd)) %>%
      mutate(value_usd = .data$value_usd / .env$currency_exchange_value)

    included_table_totals <-
      audit_table_init %>%
      group_by(.data$asset_type_analysis, .data$included) %>%
      summarise(
        total_value_invested = sum(.data$value_usd, na.rm = TRUE),
        .groups = "drop"
      ) %>%
      mutate(
        percentage_value_invested =
          .data$total_value_invested / sum(.data$total_value_invested)
      )

    included_table_value_breakdown <-
      audit_table_init %>%
      mutate(investment_means = case_when(
        (.data$asset_type == "Funds") & (.data$direct_holding) ~ "Unidentified Funds",
        .data$direct_holding ~ "Direct",
        !.data$direct_holding ~ "Via a Fund"
      )) %>%
      group_by(.data$asset_type_analysis, .data$investment_means) %>%
      summarise(
        value_invested = sum(.data$value_usd, na.rm = TRUE),
        .groups = "drop"
      )

    fields_totals <-
      c(
        "asset_type_analysis",
        "included",
        "total_value_invested",
        "percentage_value_invested"
      )

    included_table_per_asset <-
      included_table_totals %>%
      left_join(included_table_value_breakdown, by = "asset_type_analysis") %>%
      remove_duplicate_entries_totals(fields_totals) %>%
      select(
        "asset_type_analysis",
        "total_value_invested",
        "percentage_value_invested",
        "included",
        "value_invested",
        "investment_means"
      )

    sum_table <-
      included_table_per_asset %>%
      summarise(
        asset_type_analysis = "Total",
        total_value_invested = sum(.data$total_value_invested, na.rm = TRUE),
        percentage_value_invested = sum(.data$percentage_value_invested, na.rm = TRUE),
        included = NA,
        value_invested = sum(.data$value_invested, na.rm = TRUE),
        investment_means = NA
      )

    bind_rows(included_table_per_asset, sum_table)
  }


equal_adjacent_fields_totals <-
  function(table, fields_totals, idx) {
    are_equal <- TRUE
    for (field in fields_totals) {
      are_equal <- are_equal &&
        (pull(slice(table, idx - 1), field) == pull(slice(table, idx), field))
    }
    are_equal
  }


remove_duplicate_entries_totals <-
  function(table, fields_totals) {
    for (asset in unique(table$asset_type_analysis)) {
      idx_asset <-
        table %>%
        mutate(is_chosen_asset = .data$asset_type_analysis == .env$asset) %>%
        pull(.data$is_chosen_asset) %>%
        which()

      if (length(idx_asset) >= 2) {
        for (i in length(idx_asset):2) {
          idx <- idx_asset[i]
          if (equal_adjacent_fields_totals(table, fields_totals, idx)) {
            table[idx, fields_totals] <- NA
          }
        }
      }
    }
    table
  }
