export_environment_info <- function(dir = output_dir, sub_dir = "export", filename = "environment_info.json") {
  environment_info <-
    list(
      local_git_tag = get_local_git_tag(),
      local_git_hash = get_local_git_hash(),
      docker_build_version = Sys.getenv("build_version"),
      repo_head_hashes = get_and_parse_head_hashes(),
      system_mem_available = get_system_memory_available(),
      docker_container_max_mem = get_docker_container_memory_limit(),
      global_analysis_inputs_path = get_global_analysis_inputs_path(),
      report_creation_time_date = format(Sys.time(), "%F %R", tz = "UTC", usetz = TRUE),
      configs = get_configs(),
      sessionInfo = get_sessionInfo()
    )

  environment_info_json <-
    jsonlite::toJSON(environment_info, pretty = TRUE, auto_unbox = TRUE)

  dir.create(file.path(dir, sub_dir), recursive = TRUE, showWarnings = FALSE)
  write(environment_info_json, file = file.path(dir, sub_dir, filename))
}


get_and_parse_head_hashes <- function(env_var = "head_hashes", delim = ",", sep = ":") {
  value <- Sys.getenv(env_var)
  split_values <- unlist(strsplit(value, ","))
  val_names <- sub(paste0(sep, ".*$"), "", split_values)
  val_values <- sub(paste0("^.*", sep), "", split_values)
  setNames(as.list(val_values), val_names)
}


get_configs <- function() {
  if (exists("configs") && !is.null(configs)) {
    return(configs)
  }
  "unknown"
}


get_docker_container_memory_limit <- function() {
  memory.max <- suppressWarnings(system2("cat", args = "/sys/fs/cgroup/memory.max", stdout = TRUE, stderr = FALSE))
  if (length(memory.max) == 0) {
    return("")
  }

  numeric_memory.max <- suppressWarnings(as.numeric(memory.max))
  if (is.na(numeric_memory.max)) {
    return(memory.max)
  }

  scales::label_bytes()(numeric_memory.max)
}


get_global_analysis_inputs_path <- function() {
  if (exists("analysis_inputs_path") && !is.null(analysis_inputs_path)) {
    return(analysis_inputs_path)
  }
  "unknown"
}


get_local_git_tag <- function(repo = ".") {
  if (is_git_repo(repo)) {
    msg <- suppressWarnings(system2("git", args = c(paste("-C", repo), "describe", "--tags", "--abbrev=0"), stdout = TRUE, stderr = FALSE))
    if (!is.null(attr(msg, "status")) && attr(msg, "status") == 128L) {
      msg <- "no tags found"
    }
  } else {
    msg <- "not a git repo"
  }

  msg
}


get_local_git_hash <- function(repo = ".") {
  if (is_git_repo(repo)) {
    return(system2("git", args = c(paste("-C", repo), "log", "-1", "--pretty=format:'%H'"), stdout = TRUE))
  }
  "not a git repo"
}


get_sessionInfo <- function() {
  session_info <- sessioninfo::session_info(pkgs = "installed")
  list(
    platform = unclass(session_info$platform),
    packages = as.data.frame(unclass(session_info$packages)),
    external = unclass(session_info$external)
  )
}


get_system_memory_available <- function(mem_typ = "MemAvailable") {
  meminfo <- suppressWarnings(system2("grep", args = c(mem_typ, "/proc/meminfo"), stdout = TRUE, stderr = FALSE))
  memsize <- sub("^.*:[[:space:]]*", "", meminfo)
  unit <- substring(meminfo, nchar(meminfo) - 1, nchar(meminfo))
  if (length(unit) > 0 && unit == "kB") {
    kBs <- sub("[ a-zA-z]*$", "", memsize)
    bytes <- as.numeric(kBs) * 1000
    return(scales::label_bytes()(bytes))
  }
  as.character(memsize)
}


is_git_repo <- function(dir = ".") {
  system2("git", args = c(paste("-C", dir), "status"), stderr = FALSE, stdout = FALSE) == 0
}
