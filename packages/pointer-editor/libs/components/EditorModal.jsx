import { useState, useCallback } from 'react';
import { Box, Paper, Typography, Button, IconButton, Divider } from '@mui/material';
import {
  TextFields,
  Image as ImageIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import TextBlockEditor from './editor/text-block/TextBlockEditor';
import ImageBlockEditor from './editor/image-block/ImageBlockEditor';
import ProblemViewer from './viewer/ProblemViewer';

// 개별 블럭 에디터 (드래그 가능)
function SortableBlock({ id, block, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 블록 데이터를 Context 형식에 맞게 변환
  const blockForEditor = {
    ...block,
    content: block.data || block.content || '',
    serverBlockId: block.id,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        p: 2,
        position: 'relative',
        border: isDragging ? '2px dashed #1976d2' : '1px solid #e0e0e0',
      }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, zIndex: 1000 }}>
        <IconButton size='small' {...attributes} {...listeners}>
          <DragHandleIcon />
        </IconButton>
        <IconButton size='small' onClick={() => onDelete(id)} color='error'>
          <DeleteIcon />
        </IconButton>
      </Box>
      <Box sx={{ pt: 4 }}>
        {block.type === 'TEXT' ? (
          <TextBlockEditor
            initialData={blockForEditor}
            onChange={(data) =>
              onUpdate(id, { ...block, data: data.content || data.data || '', style: data.style })
            }
            blockId={id}
            problemId='modal'
          />
        ) : block.type === 'IMAGE' ? (
          <ImageBlockEditor
            initialData={blockForEditor}
            onChange={(data) =>
              onUpdate(id, { ...block, data: data.content || data.data || '', style: data.style })
            }
            blockId={id}
            problemId='modal'
          />
        ) : null}
      </Box>
    </Paper>
  );
}

// 블럭 에디터 (Context 없이 상태/props만)
function LocalDraggableBlockEditor({ blocks, setBlocks }) {
  const [, setAnchorEl] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 블럭 추가
  const handleAddBlock = useCallback(
    (type) => {
      const newBlock = {
        id: Date.now() + Math.random(),
        isNew: true,
        type,
        data: '',
        style:
          type === 'TEXT' ? 'text-align: left; padding: 16px;' : 'text-align: center; width: 50%;',
        rank: blocks.length,
      };
      setBlocks((prev) => [...prev, newBlock]);
      setAnchorEl(null);
    },
    [setBlocks, blocks.length]
  );

  // 블럭 수정
  const handleUpdateBlock = useCallback(
    (id, updated) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                data: updated.data ?? updated.content ?? b.data,
                style: updated.style !== undefined ? updated.style : b.style,
              }
            : b
        )
      );
    },
    [setBlocks]
  );

  // 블럭 삭제
  const handleDeleteBlock = useCallback(
    (id) => {
      setBlocks((prev) => {
        const filteredBlocks = prev.filter((b) => b.id !== id);
        // rank 필드 재정렬
        return filteredBlocks.map((block, index) => ({
          ...block,
          rank: index,
        }));
      });
    },
    [setBlocks]
  );

  // 드래그 종료
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const reorderedBlocks = arrayMove(blocks, oldIndex, newIndex);
        // rank 필드 업데이트
        const updatedBlocks = reorderedBlocks.map((block, index) => ({
          ...block,
          rank: index,
        }));
        setBlocks(updatedBlocks);
      }
    },
    [blocks, setBlocks]
  );

  const blockIds = blocks.map((b) => b.id);

  return (
    <Box
      sx={{
        p: 2,
        minHeight: 500,
        background: '#fafbfc',
        borderRadius: 3,
        border: '1px solid #eee',
        height: '100%',
      }}>
      <Typography variant='h6' sx={{ mb: 2 }}>
        블록 추가
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant='outlined'
          startIcon={<TextFields />}
          onClick={() => handleAddBlock('TEXT')}>
          텍스트 블록 추가
        </Button>
        <Button
          variant='contained'
          startIcon={<ImageIcon />}
          onClick={() => handleAddBlock('IMAGE')}>
          이미지 블록 추가
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {blocks.length === 0 ? (
        <Typography color='text.secondary' align='center' sx={{ mt: 10 }}>
          블록을 추가해주세요
        </Typography>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlock
                key={block.id}
                id={block.id}
                block={block}
                onUpdate={handleUpdateBlock}
                onDelete={handleDeleteBlock}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </Box>
  );
}

function EditorModal({ blocks, onClose, onSave }) {
  // props로 받은 데이터를 내부 상태로 관리하고, id가 없는 블록들에 대해 자동으로 id 생성
  const [internalBlocks, setInternalBlocks] = useState(() => {
    return (blocks || []).map((block) => ({
      ...block,
      id: block.id || Math.random().toString(36).substring(2, 15),
      isNew: block.id === null || block.id === undefined,
    }));
  });

  // ProblemViewer용 데이터 변환
  const problem = {
    blocks: internalBlocks.map((block) => ({
      ...block,
      content: block.data || block.content || '',
    })),
  };

  const handleSave = () => {
    console.log(internalBlocks);
    const blocksForSave = internalBlocks.map((block) => {
      const { id, ...blockWithoutId } = block;
      if (block.isNew) {
        return blockWithoutId;
      } else {
        return { id, ...blockWithoutId };
      }
    });
    // 부모 컴포넌트에게 blocks 데이터 전달
    if (onSave) {
      onSave(blocksForSave);
    }

    // 모달 닫기
    onClose();
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        bgcolor: 'rgba(0,0,0,0.08)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Paper
        sx={{
          width: '90vw',
          height: '90vh',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}>
        <Typography variant='h5' sx={{ mb: 2 }}>
          문제 입력
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flex: 1, minHeight: 0 }}>
          {/* 좌측: 블럭 에디터 */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'auto',
            }}>
            <LocalDraggableBlockEditor blocks={internalBlocks} setBlocks={setInternalBlocks} />
          </Box>
          {/* 우측: 미리보기 */}
          <Box
            sx={{
              flex: 1.5,
              minWidth: 0,
              bgcolor: '#f7f7f7',
              borderRadius: 3,
              p: 3,
              overflow: 'auto',
              height: '100%',
            }}>
            <ProblemViewer problem={problem} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant='outlined' onClick={onClose}>
            취소
          </Button>
          <Button variant='contained' color='primary' onClick={handleSave}>
            저장
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default EditorModal;
