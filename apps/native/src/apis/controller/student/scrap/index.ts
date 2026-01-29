// GET APIs
export * from './useGetScrapDetail';
export * from './useGetFoldersDetail';
export * from './useGetFolders';
export * from './useGetTrash';
export * from './useSearchScraps';
export * from './useGetScrapsByFolder';
export * from './handwriting/useGetHandwriting';
export * from './useGetScrapStatusById';

// POST APIs
export * from './postCreateScrap';
export * from './postCreateFolder';
export * from './postCreateScrapFromProblem';
export * from './postCreateScrapFromPointing';
export * from './postCreateScrapFromImage';
export * from './postToggleScrapFromProblem';
export * from './postToggleScrapFromPointing';
export * from './postToggleScrapFromReadingTip';
export * from './postToggleScrapFromOneStepMore';

// PUT APIs
export * from './putUpdateScrapName';
export * from './putUpdateScrapText';
export * from './putUpdateFolder';
export * from './putUpdateFolderName';
export * from './putUpdateFolderThumbnail';
export * from './putMoveScraps';
export * from './putRestoreTrash';
export * from './handwriting/putUpdateHandwriting';

// DELETE APIs
export * from './deleteScrap';
export * from './deleteFolders';
export * from './deletePermanentTrash';
export * from './deleteEmptyTrash';
export * from './handwriting/deleteHandwriting';
export * from './deleteUnscrapFromProblem';
export * from './deleteUnscrapFromPointing';
