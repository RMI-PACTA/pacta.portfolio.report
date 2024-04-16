test_that("with no args, returns EN template string", {
  expect_equal(select_report_template(), "_en_template")
})

test_that("with fake args, returnsexpected string structure", {
  expect_equal(select_report_template("foo", "bar"), "foo_bar_template")
})
