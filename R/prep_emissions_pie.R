prep_emissions_pie <-
  function(data, asset_type, investor_name, portfolio_name, twodi_sectors) {
    data %>%
      ungroup() %>%
      filter(.data$investor_name == .env$investor_name &
               .data$portfolio_name == .env$portfolio_name) %>%
      filter(.data$asset_type %in% c("Bonds", "Equity")) %>%
      select("asset_type", "sector", "weighted_sector_emissions") %>%
      mutate(exploded = .data$sector %in% .env$twodi_sectors) %>%
      arrange(.data$asset_type, desc(.data$exploded), .data$sector) %>%
      rename(key = .data$sector, value = .data$weighted_sector_emissions) %>%
      filter(!is.na(.data$key)) %>%
      filter(.data$asset_type == .env$asset_type) %>%
      select(-"asset_type")
  }
