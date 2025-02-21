export interface getProblemsSearchParamsType {
  problemCustomId?: string;
  title?: string;
  conceptTagIds?: number[];
}

export interface getProblemSetSearchParamsType {
  problemSetTitle?: string;
  problemTitle?: string;
  conceptTagIds?: number[];
}

export interface getSearchProblemSetParamsType {
  problemSetTitle?: string;
  problemTitle?: string;
}
