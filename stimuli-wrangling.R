
library(dplyr)
library(knitr)
library(readr)
library(stringr)
library(purrr)

filenames <- as.data.frame(list.files("audio/", pattern = ".mp3", full.names = FALSE))

names(filenames)[1] <- "audio"

filenames[,c("subid", "trial")] <- NA

for (i in 1:length(filenames$audio)) {
  filenames$subid[i] = as.integer(str_split(filenames$audio[i], "_")[[1]] %>% tail(2) %>% head(1))
  filenames$trial[i] = as.integer(str_split(filenames$audio[i], "_|[.]")[[1]] %>% head(2) %>% tail(1))
  filenames$trial = as.numeric(filenames$trial)
}

tangramresults <- read_csv("tangramgameresults.csv") %>%
  mutate(type = if_else(nchar(leftpic) > 2, "practice", "test")) %>%
  mutate(trial = as.numeric(trial)+1) %>%
  filter(type == "test") %>%
  select(subid, trial, target, leftpic, rightpic, correct)

stimuli <- left_join(filenames, tangramresults, by = c("subid","trial"))
