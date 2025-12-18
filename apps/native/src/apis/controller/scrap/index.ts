// GET APIs
export * from './useGetScrapDetail';
export * from './useGetFolders';
export * from './useGetTrash';
export * from './useSearchScraps';
export * from './useGetHandwriting';

// POST APIs
export * from './postCreateScrap';
export * from './postCreateFolder';
export * from './postCreateScrapFromProblem';
export * from './postCreateScrapFromPointing';
export * from './postCreateScrapFromImage';
export * from './postToggleScrapFromProblem';
export * from './postToggleScrapFromPointing';

// PUT APIs
export * from './putUpdateScrapName';
export * from './putUpdateScrapText';
export * from './putUpdateFolder';
export * from './putMoveScraps';
export * from './putRestoreTrash';
export * from './putUpdateHandwriting';

// DELETE APIs
export * from './deleteScrap';
export * from './deleteFolders';
export * from './deletePermanentTrash';
export * from './deleteEmptyTrash';
export * from './deleteHandwriting';
export * from './deleteUnscrapFromProblem';
export * from './deleteUnscrapFromPointing';
