#' Create interactive report
#'
#' This function creates an interactive report
#'
#' @param template_dir a parameter
#' @param output_dir a parameter
#' @param survey_dir a parameter
#' @param real_estate_dir a parameter
#' @param language_select a parameter
#' @param investor_name a parameter
#' @param portfolio_name a parameter
#' @param peer_group a parameter
#' @param start_year a parameter
#' @param select_scenario a parameter
#' @param select_scenario_other a parameter
#' @param portfolio_allocation_method a parameter
#' @param scenario_geography a parameter
#' @param twodi_sectors a parameter
#' @param green_techs a parameter
#' @param tech_roadmap_sectors a parameter
#' @param pacta_sectors_not_analysed a parameter
#' @param audit_file a parameter
#' @param emissions a parameter
#' @param portfolio_overview a parameter
#' @param equity_results_portfolio a parameter
#' @param bonds_results_portfolio a parameter
#' @param equity_results_company a parameter
#' @param bonds_results_company a parameter
#' @param equity_results_map a parameter
#' @param bonds_results_map a parameter
#' @param indices_equity_results_portfolio a parameter
#' @param indices_bonds_results_portfolio a parameter
#' @param peers_equity_results_portfolio a parameter
#' @param peers_bonds_results_portfolio a parameter
#' @param peers_equity_results_user a parameter
#' @param peers_bonds_results_user a parameter
#' @param display_currency a parameter
#' @param currency_exchange_value a parameter
#' @param dataframe_translations a parameter
#' @param js_translations a parameter
#' @param header_dictionary a parameter
#' @param sector_order a parameter
#' @param equity_tdm a parameter
#' @param bonds_tdm a parameter
#' @param configs a parameter
#'
#' @return only used for side-effect
#'
#' @export

create_interactive_report <-
  function(template_dir = NULL,
           output_dir = NULL,
           survey_dir = "",
           real_estate_dir = "",
           language_select = "EN",
           investor_name = NULL,
           portfolio_name = NULL,
           peer_group = NULL,
           start_year = NULL,
           select_scenario,
           select_scenario_other,
           portfolio_allocation_method = NULL,
           scenario_geography = NULL,
           twodi_sectors = c("Power", "Automotive", "Oil&Gas", "Coal", "Steel", "Cement", "Aviation"),
           green_techs = c("RenewablesCap", "HydroCap", "NuclearCap", "Hybrid", "Electric", "FuelCell", "Hybrid_HDV", "Electric_HDV", "FuelCell_HDV","Electric Arc Furnace"),
           tech_roadmap_sectors = c("Automotive", "Power", "Oil&Gas", "Coal"),
           pacta_sectors_not_analysed = c("Aviation","Cement", "Steel"),
           audit_file = NULL,
           emissions = NULL,
           portfolio_overview = NULL,
           equity_results_portfolio = NULL,
           bonds_results_portfolio = NULL,
           equity_results_company = NULL,
           bonds_results_company = NULL,
           equity_results_map = NULL,
           bonds_results_map = NULL,
           indices_equity_results_portfolio = NULL,
           indices_bonds_results_portfolio = NULL,
           peers_equity_results_portfolio = NULL,
           peers_bonds_results_portfolio = NULL,
           peers_equity_results_user = NULL,
           peers_bonds_results_user = NULL,
           display_currency = "USD",
           currency_exchange_value = 1,
           dataframe_translations = NULL,
           js_translations = NULL,
           header_dictionary = NULL,
           sector_order = NULL,
           equity_tdm = NULL,
           bonds_tdm = NULL,
           configs = NULL
  ) {

    # create directory structure -----------------------------------------------
    dir.create(output_dir, showWarnings = FALSE)
    output_dir <- paste0(output_dir, "/report")
    dir.create(output_dir, showWarnings = FALSE)

    dir.create(fs::path(output_dir, "data"), showWarnings = FALSE)
    dir.create(fs::path(output_dir, "export"), showWarnings = FALSE)


    # copy in latest JS and CSS ------------------------------------------------

    file.copy(inst_path("js"), to = output_dir, overwrite = TRUE, recursive = TRUE)
    file.copy(inst_path("css"), to = output_dir, overwrite = TRUE, recursive = TRUE)
    file.copy(inst_path("img"), to = output_dir, overwrite = TRUE, recursive = TRUE)
    file.copy(inst_path("webfonts"), to = output_dir, overwrite = TRUE, recursive = TRUE)
    file.copy(inst_path("font"), to = output_dir, overwrite = TRUE, recursive = TRUE)

    if (length(list.files(real_estate_dir)) > 0) {
      if (dir.exists(path(real_estate_dir, "img"))) {
        file.copy(path(real_estate_dir, "img"), to = fs::path(output_dir), overwrite = TRUE, recursive = TRUE)
        file.copy(path(real_estate_dir, "img"), to = fs::path(template_dir, "rmd"), overwrite = TRUE, recursive = TRUE)
      }
    }

    survey_dir <- fs::path(survey_dir, toupper(language_select))
    if (dir.exists(survey_dir)) {
      dir.create(fs::path(output_dir, "survey"), showWarnings = FALSE)
      survey_files <- list.files(survey_dir,full.names = TRUE)
      file.copy(survey_files, to = fs::path(output_dir, "survey"), overwrite = TRUE, recursive = TRUE)
    }

    # translations -------------------------------------------------------------

    dictionary <- choose_dictionary_language(
      dataframe_translations,
      language_select
    )

    header_dictionary <- replace_contents(header_dictionary, display_currency)

    # levels -------------------------------------------------------------
    equity_market_levels = c("Global Market", "Developed Market", "Emerging Market")
    sector_levels = c("Power", "Automotive", "Oil&Gas", "Coal", "FossilFuels", "Cement", "Steel", "Aviation")
    power_tech_levels = c("RenewablesCap", "HydroCap", "NuclearCap", "GasCap", "OilCap", "CoalCap")
    oil_gas_levels = c("Oil", "Gas")
    coal_levels = c("Coal")
    auto_levels = c("Electric", "Electric_HDV", "FuelCell","FuelCell_HDV", "Hybrid","Hybrid_HDV", "ICE", "ICE_HDV")
    cement_levels = c("Integrated facility", "Grinding")
    steel_levels = c("Electric Arc Furnace", "Open Hearth Furnace", "Basic Oxygen Furnace")
    aviation_levels = c("Freight", "Passenger", "Mix", "Other")
    scen_geo_levels = c("Global Aggregate", "Global", "OECD","NonOECD")
    all_tech_levels = c(power_tech_levels, auto_levels, oil_gas_levels, coal_levels, cement_levels, steel_levels, aviation_levels)

    # parameters json ----------------------------------------------------------
    portfolio_parameters <- calculate_report_content_variables(
      audit_file = audit_file,
      investor_name = investor_name,
      portfolio_name = portfolio_name,
      currency_exchange_value = currency_exchange_value
    )

    portfolio_parameters %>%
      to_jsonp("data_parameters") %>%
      writeLines(path(output_dir, "data", paste0("data_parameters", ".js")))


    # export environment info --------------------------------------------------
    if (exists("export_environment_info")) {
      export_environment_info(output_dir)
    }


    # Common data parameters
    year_span <- 5


    # Exhibit 1 - asset classes included in analysis (table) -------------------

    if (nrow(audit_file) > 0) {
      prep_audit_table(
        audit_file,
        investor_name,
        portfolio_name,
        currency_exchange_value
      ) %>%
        translate_df_contents("data_included_table", dictionary, inplace = TRUE) %>%
        translate_df_headers("data_included_table", language_select, header_dictionary) %>%
        export_data_utf8("data_included_table", output_dir = output_dir)
    }



    # Exhibit 2 - exposure to key sectors by value (exploded pie) --------------

    if (nrow(audit_file) > 0) {
      prep_exposure_pie(
        audit_file,
        "Equity",
        investor_name,
        portfolio_name,
        twodi_sectors,
        currency_exchange_value
      ) %>%
        translate_df_contents("data_value_pie_equity", dictionary) %>%
        export_data_utf8("data_value_pie_equity", output_dir = output_dir)

      prep_exposure_pie(
        audit_file,
        "Bonds",
        investor_name,
        portfolio_name,
        twodi_sectors,
        currency_exchange_value
      ) %>%
        translate_df_contents("data_value_pie_bonds", dictionary) %>%
        export_data_utf8("data_value_pie_bonds", output_dir = output_dir)
    }


    # Exhibit 3 - exposure to key sectors by emissions (exploded pie) ----------

    prep_emissions_pie(
      emissions,
      "Equity",
      investor_name,
      portfolio_name,
      twodi_sectors
    ) %>%
      translate_df_contents("data_emissions_pie_equity", dictionary) %>%
      export_data_utf8("data_emissions_pie_equity", output_dir = output_dir)

    prep_emissions_pie(
      emissions,
      "Bonds",
      investor_name,
      portfolio_name,
      twodi_sectors
    ) %>%
      translate_df_contents("data_emissions_pie_bonds", dictionary) %>%
      export_data_utf8("data_emissions_pie_bonds", output_dir = output_dir)


    # To know whether there are portfolio results to print
    portfolio_results_flag <-
      nrow(equity_results_portfolio) > 1 | nrow(bonds_results_portfolio) > 1


    # only prepare data for these plots if there are portfolio results
    if (portfolio_results_flag) {

      # Exhibit 5 - exposure to sectors and techs (bar charts) -----------------

      techexposure_data <-
        prep_techexposure(
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
        )

      if (nrow(techexposure_data) > 0) {
        techexposure_data %>%
          translate_df_contents("techexposure_data", dictionary) %>%
          export_data_utf8("data_techexposure", output_dir = output_dir)
      }


      # Exhibit 5a - future exposure to sectors and techs (bar charts) ---------

      # FIXME: div_id = techexposure_future TODO check

      techexposure_future_data <-
        prep_techexposure_future(
          equity_results_portfolio,
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
          all_tech_levels
        )

      if (nrow(techexposure_future_data) > 0) {
        techexposure_future_data %>%
          translate_df_contents("techexposure_future_data", dictionary) %>%
          export_data_utf8("data_techexposure_future", output_dir = output_dir)
      }

      # Exhibit 6 - exposure to sectors and techs by location (map) ------------

      prep_exposure_map(
        equity_results_map,
        bonds_results_map,
        portfolio_name,
        start_year
      ) %>%
        translate_df_contents("data_map", dictionary) %>%
        export_data_utf8("data_map", output_dir = output_dir)


      # Exhibit 9 - production/scenario alignment (line/area/timelines) --------

      data_trajectory_alignment <-
        prep_trajectory_alignment(
          equity_results_portfolio,
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
          all_tech_levels
        )

      if (nrow(data_trajectory_alignment) > 0) {
        data_trajectory_alignment %>%
          translate_df_contents("data_trajectory_alignment", dictionary) %>%
          export_data_utf8("data_trajectory_alignment", output_dir = output_dir)
      }


      # Exhibit 11 - emissions trajectory (line timeline) ----------------------

      data_emissions <-
        prep_emissions_trajectory(
          equity_results_portfolio,
          bonds_results_portfolio,
          investor_name,
          portfolio_name,
          select_scenario_other,
          select_scenario,
          twodi_sectors,
          year_span
        )

      if (nrow(data_emissions) > 1) {
        data_emissions %>%
          translate_df_contents("data_emissions", dictionary) %>%
          export_data_utf8("data_emissions", output_dir = output_dir)
      }


      # Exhibit 13 - company comparisons (bubble scatter) ----------------------

      prep_company_bubble(
        equity_results_company,
        bonds_results_company,
        portfolio_name,
        select_scenario_other,
        select_scenario,
        start_year,
        green_techs
      ) %>%
        translate_df_contents("data_company_bubble", dictionary) %>%
        export_data_utf8("data_company_bubble", output_dir = output_dir)


      # Exhibit 13b - company charts -------------------------------------------

      prep_key_bars_company(
        equity_results_company,
        bonds_results_company,
        portfolio_name,
        start_year,
        select_scenario,
        select_scenario_other,
        pacta_sectors_not_analysed,
        all_tech_levels
      ) %>%
        translate_df_contents("data_key_bars_company", dictionary) %>%
        export_data_utf8("data_key_bars_company", output_dir = output_dir)

      prep_key_bars_portfolio(
        equity_results_portfolio,
        bonds_results_portfolio,
        portfolio_name,
        select_scenario,
        select_scenario_other,
        start_year,
        pacta_sectors_not_analysed,
        all_tech_levels
      ) %>%
        translate_df_contents("data_key_bars_portfolio", dictionary) %>%
        export_data_utf8("data_key_bars_portfolio", output_dir = output_dir)


      # Exhibit 14 - peer portfolio comparison (stacked bar charts) ------------

      prep_peercomparison(
        equity_results_portfolio,
        bonds_results_portfolio,
        peers_equity_results_user,
        peers_bonds_results_user,
        investor_name,
        portfolio_name,
        start_year,
        select_scenario,
        select_scenario_other,
        peer_group
      ) %>%
        translate_df_contents("data_peercomparison", dictionary) %>%
        export_data_utf8("data_peercomparison", output_dir = output_dir)


      # Exhibit 14b - peer current to future production alignment (bubble) -----

      prep_peer_bubbles(
        equity_results_portfolio,
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
        portfolio_allocation_method
      ) %>%
        translate_df_contents("data_peer_bubbles", dictionary) %>%
        export_data_utf8("data_peer_bubbles", output_dir = output_dir)


      # Exhibit 14c - peer rank table ------------------------------------------

      prep_peer_table(
        equity_results_portfolio,
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
        select_scenario_other
      ) %>%
        translate_df_contents("data_peer_table", dictionary, inplace = TRUE) %>%
        translate_df_headers("data_peer_table", language_select, header_dictionary) %>%
        export_data_utf8("data_peer_table", output_dir = output_dir)


    }
    # real estate incorporation -----------------------------------------------

    real_estate_flag <- FALSE
    re_data_input <- NULL
    re_config_data <- NULL

    # confirm with Wim as to whether the dir won't exist if there are no results to print
    if (length(list.files(real_estate_dir)) > 0) {
      real_estate_flag <- TRUE
      re_data_input <- jsonlite::read_json(fs::path(real_estate_dir, "data/data.json"))
      re_config_data <- jsonlite::read_json(fs::path(real_estate_dir, "data/config.json"))
    }


    # survey incorporation -----------------------------------------------
    survey_flag <- FALSE
    survey_data <- NULL

    if ( length(list.files(survey_dir)) > 0) {
      survey_flag <- TRUE
      survey_data <- list(
        summary_table = readr::read_csv(path(output_dir, "survey","summary_table.csv"), col_types = cols_only(row_tag = "c", row_label = "c", value = "d"))
      )
    }

    # export translations for js labels ----------------------------------------
    js_labels <- js_translations %>%
      select(
        c("id", "label", tolower(language_select))
      ) %>%
      rename(
        value = tolower(language_select)
      )

    js_labels %>%
      to_jsonp("js_labels") %>%
      write_utf8(path(output_dir, 'data', paste0("js_labels", '.js')))

    # export currency ---------------------------------------------------------
    display_currency %>%
      to_jsonp("display_currency") %>%
      writeLines(path(output_dir, 'data', paste0("display_currency", '.js')))

    # export sector order -------------------------------------------------------------

    sector_order %>%
      to_jsonp("sector_order") %>%
      writeLines(path(output_dir, "data", paste0("sector_order", '.js')))


    # export TDM data ----------------------------------------------------------

    if ((!is.null(equity_tdm) && nrow(equity_tdm) > 0) ||
        (!is.null(bonds_tdm) && nrow(bonds_tdm) > 0)) {

      tdm_results_flag <- TRUE

      data_speedometer_dashboard <- prep_speedometer(equity_tdm, bonds_tdm)

      port_val_cnt <-
        bind_rows(
          "Listed Equity" = equity_tdm,
          "Corporate Bonds" = bonds_tdm,
          .id = "asset_class"
          ) %>%
        filter(.data$technology != "Aggregate") %>%
        group_by(.data$asset_class, .data$tdm_metric) %>%
        summarise(n = length(unique(.data$tdm_portfolio_value)), .groups = "drop")

      if (!is.null(data_speedometer_dashboard) && all(port_val_cnt$n <= 1)) {
        data_speedometer_dashboard %>%
          translate_df_contents(
            "data_speedometer_dashboard",
            dictionary,
            inplace = TRUE
          ) %>%
          export_data_utf8("data_speedometer_dashboard", output_dir = output_dir)
      }
    } else {
      tdm_results_flag <- FALSE
    }


    # build page --------------------------------------------------------------

    default_wd <- getwd()

    temporary_dir <- tempdir()
    fs::dir_copy(template_dir, temporary_dir)

    working_template_dir <- fs::path(temporary_dir, basename(template_dir))
    setwd(working_template_dir)
    on.exit(setwd(default_wd), add = TRUE)

    # This selects the language for the real estate chapter which is only available in DE and FR
    if (language_select %in% c("EN", "DE")) {
      re_language <- "de"
    } else {
        re_language <- "fr"
        }

    # FIXME: this errors out on our Docker image for some reason even though it works in
    # multiple linux and macos contexts, so commneting out for now, though ideally
    # we figure out how to make it work in our Docker and re-enable it
    # abort_if_bookdown_and_knitr_are_incompatible()

    bookdown::render_book("index.Rmd",
                          encoding = 'UTF-8',
                          clean = FALSE,
                          quiet = TRUE,
                          params = list(
                            portfolio_results_flag = portfolio_results_flag,
                            real_estate_flag = real_estate_flag,
                            survey_flag = survey_flag,
                            survey_data = survey_data,
                            re_config_data = re_config_data,
                            re_data_input = re_data_input,
                            portfolio_parameters = portfolio_parameters,
                            language = re_language,
                            tdm_results_flag = tdm_results_flag
                          ))

    setwd(default_wd)

    template_html <- readLines(fs::path(working_template_dir, "_book", "_main.html"))
    optbar_html <- readLines(inst_path("optbar.html"))

    template_html <- c(
      template_html,
      sapply(list.files(fs::path(output_dir, "data")), function(data_file) {
        paste0("<script src='data/", data_file, "'></script>")
      }, USE.NAMES = FALSE),
      "<script src='js/d3.v4.min.js'></script>",
      "<script src='js/initialize_charts.js'></script>",
      optbar_html
    )

    writeLines(unlist(template_html), fs::path(output_dir, "index.html"))


    # add Gitbook files ----------------------------------------------------------
    file.copy(fs::path(working_template_dir, "_book", "libs"), to = fs::path(output_dir), overwrite = TRUE, recursive = TRUE)
    if (dir.exists(fs::path(working_template_dir, "_book", "images"))) { file.copy(fs::path(working_template_dir, "_book", "images"), to = fs::path(output_dir), overwrite = TRUE, recursive = TRUE) }

    file.copy(fs::path(working_template_dir, "_book", "search_index.json"), to = fs::path(output_dir), overwrite = TRUE)
    file.copy(inst_path("2dii_gitbook_style.css"), to = fs::path(output_dir), overwrite = TRUE)

    # add zip archive of all required output files
    suppressMessages({
      zipfilename <- fs::path(output_dir, paste0(portfolio_name, "_interactive_report.zip"))
      orig_wd <- setwd(output_dir)
      on.exit(setwd(orig_wd), add = TRUE)
      utils::zip(zipfile = zipfilename, files = ".", extras = "-q")
      setwd(orig_wd)
    })

  }


select_exec_summary_template <-
  function(
    project_report_name = NULL,
    language_select = "EN") {
    paste0(tolower(project_report_name), "_", tolower(language_select), "_exec_summary")
  }


# dataframe language translation functions--------------------------------------

replace_contents <- function(data, display_currency) {
  mutate(data, across(.cols = everything(), .fns = ~ gsub("_CUR_", display_currency, .x)))
}

abort_if_bookdown_and_knitr_are_incompatible <- function() {
  if (packageVersion("bookdown") <= "0.21" && packageVersion("knitr") > "1.33") {
    stop(
      "Must install knitr 1.33 or older.\n",
      "* bookdown <= 0.21 needs `knitr:::is_abs_path()` from knitr <= 1.33.\n",
      paste0("* Using bookdown version: ", packageVersion("bookdown"), ".\n"),
      paste0("* Using knitr version: ", packageVersion("knitr"), "."),
      call. = FALSE
    )
  }

  invisible()
}


filter_scenarios_per_sector <-
  function(data, select_scenario_other, select_scenario) {
    special_sectors <- c("Aviation")
    rest_of_sectors <- setdiff(unique(data$ald_sector), special_sectors)

    data %>%
      filter(
        scenarios_found_in_sectors(.data, select_scenario_other, c("Aviation")) |
          scenarios_found_in_sectors(.data, select_scenario, rest_of_sectors)
      )
  }

scenarios_found_in_sectors <- function(data, select_scenario_param, sectors) {
  out <- (data$ald_sector %in% sectors) &
    (data$scenario == get_scenario(select_scenario_param)) &
    (data$scenario_source == get_scenario_source(select_scenario_param))
  out
}

get_scenario <- function(scenario_parameter) {
  scenario <- unlist(stringr::str_split(scenario_parameter,"_", n = 2))[2]
  scenario
}

get_scenario_source <- function(scenario_parameter) {
  source <- unlist(stringr::str_split(scenario_parameter,"_", n = 2))[1]
  source
}
