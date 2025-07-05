import { useState } from 'react';

export type ProblemBlockType = 'TEXT' | 'IMAGE';

export interface ProblemBlock {
  id: number;
  type: ProblemBlockType;
  data: string;
  style: string;
  rank: number;
}

const useEditor = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedBlocks, setSavedBlocks] = useState<ProblemBlock[]>([]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (blocks: ProblemBlock[]) => {
    setSavedBlocks(blocks);
  };

  return { isModalOpen, savedBlocks, handleOpenModal, handleCloseModal, handleSave };
};

export default useEditor;
