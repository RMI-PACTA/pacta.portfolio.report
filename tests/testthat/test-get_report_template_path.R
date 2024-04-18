test_that("with no args, passes expected template path", {
  expect_equal(
    get_report_template_path(),
    system.file(
      "templates",
      "general_en_template",
      package = "pacta.portfolio.report"
    )
  )
})

test_that("with args, passes expected template path", {
  expect_equal(
    get_report_template_path("GENERAL", "EN"),
    system.file(
      "templates",
      "general_en_template",
      package = "pacta.portfolio.report"
    )
  )
})
