export interface getProblemsSearchParamsType {
  problemId?: string;
  comment?: string;
  conceptTagIds?: number[];
}

export interface getProblemSetSearchParamsType {
  problemSetTitle?: string;
  problemTitle?: string;
  conceptTagIds?: number[];
}
