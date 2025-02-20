export interface getProblemsSearchParamsType {
  problemCustomId?: string;
  problemTitle?: string;
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
