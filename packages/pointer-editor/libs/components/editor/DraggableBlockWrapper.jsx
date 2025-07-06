import { useState, useCallback, useMemo, memo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, CardContent, IconButton, Typography, Menu, MenuItem, Fab } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
  TextFields,
  Image as ImageIcon,
} from '@mui/icons-material';

import { useProblemEdit } from '../../contexts/ProblemEditContext';

import TextBlockEditor from './text-block/TextBlockEditor';
import ImageBlockEditor from './image-block/ImageBlockEditor';

// 개별 드래그 가능한 블록 컴포넌트 - React.memo로 최적화
const SortableBlock = memo(
  ({ id, block }) => {
    const { updateBlockLocal, deleteBlock, problemId } = useProblemEdit();

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    // 블록 업데이트 핸들러를 useCallback으로 안정화 (block.id 사용)
    const handleUpdate = useCallback(
      (updatedBlock) => {
        updateBlockLocal(block.id || id, updatedBlock);
      },
      [block.id, id, updateBlockLocal]
    );

    // 블록 삭제 핸들러
    const handleDelete = useCallback(() => {
      deleteBlock(block.id || id);
    }, [block.id, id, deleteBlock]);

    const renderEditor = useMemo(() => {
      const blockIdToUse = block.id || id; // 일관성 있는 ID 사용

      switch (block.type) {
        case 'TEXT':
          return (
            <TextBlockEditor
              key={`text-${blockIdToUse}`}
              initialData={block}
              onChange={handleUpdate}
              problemId={problemId}
              blockId={blockIdToUse} // 동일한 ID 사용
              isInsertableImage={true}
            />
          );
        case 'IMAGE':
          return (
            <ImageBlockEditor
              key={`image-${blockIdToUse}`}
              initialData={block}
              onChange={handleUpdate}
              problemId={problemId}
              blockId={blockIdToUse} // 동일한 ID 사용
            />
          );
        default:
          return <Typography>알 수 없는 블록 타입</Typography>;
      }
    }, [
      block.type,
      block.content,
      block.style,
      block.id,
      block.serverBlockId,
      handleUpdate,
      problemId,
      id,
    ]);

    return (
      <Card
        ref={setNodeRef}
        style={style}
        sx={{
          mb: 2,
          position: 'relative',
          border: isDragging ? '2px dashed #1976d2' : '1px solid #e0e0e0',
        }}>
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
            zIndex: 1000,
          }}>
          <IconButton
            size='small'
            {...attributes}
            {...listeners}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              cursor: 'grab',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 1)',
                cursor: 'grab',
              },
              '&:active': {
                cursor: 'grabbing',
              },
            }}>
            <DragHandleIcon />
          </IconButton>
          <IconButton
            size='small'
            onClick={handleDelete}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderColor: 'error.main',
              },
            }}>
            <DeleteIcon />
          </IconButton>
        </Box>

        <CardContent sx={{ pt: 6 }}>{renderEditor}</CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // 더 정확한 비교 함수
    if (prevProps.id !== nextProps.id) return false;

    const prevBlock = prevProps.block;
    const nextBlock = nextProps.block;

    // 블록의 핵심 속성들만 비교
    return (
      prevBlock.id === nextBlock.id &&
      prevBlock.type === nextBlock.type &&
      prevBlock.content === nextBlock.content &&
      prevBlock.style === nextBlock.style &&
      prevBlock.serverBlockId === nextBlock.serverBlockId
    );
  }
);

// displayName 설정 (디버깅용)
SortableBlock.displayName = 'SortableBlock';

const DraggableBlockWrapper = () => {
  const { blocks, reorderBlocks, addBlock } = useProblemEdit();
  const [anchorEl, setAnchorEl] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (active.id !== over.id) {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);

        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        reorderBlocks(newBlocks);
      }
    },
    [blocks, reorderBlocks]
  );

  // 블록 추가 핸들러
  const handleAddBlock = useCallback(
    (type) => {
      addBlock(type);
      setAnchorEl(null);
    },
    [addBlock]
  );

  // blocks의 id 배열을 메모이제이션
  const blockIds = useMemo(() => blocks.map((block) => block.id), [blocks]);

  return (
    <Box sx={{ position: 'relative', minHeight: '400px', p: 2 }}>
      <Typography variant='h5' gutterBottom>
        문제 블록 에디터
      </Typography>

      {blocks.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
            backgroundColor: '#fafafa',
          }}>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            블록이 없습니다
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            아래 버튼을 클릭하여 블록을 추가하세요
          </Typography>
        </Box>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock key={block.id} id={block.id} block={block} />
          ))}
        </SortableContext>
      </DndContext>

      {/* 블록 추가 버튼 */}
      <Fab
        color='primary'
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={(event) => setAnchorEl(event.currentTarget)}>
        <AddIcon />
      </Fab>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}>
        <MenuItem onClick={() => handleAddBlock('TEXT')}>
          <TextFields sx={{ mr: 1 }} />
          텍스트 블록
        </MenuItem>
        <MenuItem onClick={() => handleAddBlock('IMAGE')}>
          <ImageIcon sx={{ mr: 1 }} />
          이미지 블록
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DraggableBlockWrapper;
