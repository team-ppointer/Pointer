// Base types for better type safety
export interface ScrapFolder {
  id: string;
  type: 'FOLDER';
  title: string;
  timestamp: number;
  contents: ScrapItem[];
}

export interface ScrapContent {
  id: string;
  type: 'SCRAP';
  title: string;
  timestamp: number;
  parentFolderId?: string;
}

export interface ReviewFolder extends Omit<ScrapFolder, 'id'> {
  id: 'REVIEW';
}

// Union type for all scrap items
export type ScrapItem = ScrapFolder | ScrapContent | ReviewFolder;

// Trash item extends scrap item with deletion timestamp
export type TrashItem = ScrapItem & {
  deletedAt: number;
};
