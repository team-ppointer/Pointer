import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  createTheme,
  ThemeProvider,
} from '@mui/material';
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

import { DeleteIcon, DragHandleIcon, ImageIcon, TextIcon } from '../assets';

import TextBlockEditor from './editor/text-block/TextBlockEditor';
import ImageBlockEditor from './editor/image-block/ImageBlockEditor';
import ProblemViewer from './viewer/ProblemViewer';

// 테마 생성
const theme = createTheme({
  palette: {
    primary: {
      main: '#3E3F45',
      contrastText: '#ffffff',
    },
  },
});

// 개별 블럭 에디터 (드래그 가능)
function SortableBlock({ id, block, onUpdate, onDelete, ocrApiCall }) {
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
      data-block-id={id}
      elevation={0}
      sx={{
        mb: { xs: 1, md: 2 },
        p: { xs: 1, md: 2 },
        position: 'relative',
        border: isDragging ? '2px dashed #1976d2' : 'none',
        borderRadius: '10px',
      }}>
      <Typography
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          fontFamily: 'Pretendard',
          fontWeight: 700,
          fontSize: '14px',
          lineHeight: '150%',
          letterSpacing: '0%',
          color: '#1E1E21',
          zIndex: 1000,
        }}>
        {block.type === 'TEXT' ? '텍스트 블록' : '이미지 블록'}
      </Typography>
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', zIndex: 1000 }}>
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
            ocrApiCall={ocrApiCall}
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
function LocalDraggableBlockEditor({ blocks, setBlocks, ocrApiCall }) {
  const [, setAnchorEl] = useState(null);
  const lastAddedBlockId = useRef(null);
  const editorContainerRef = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const scrollToNewBlock = useCallback((blockId) => {
    setTimeout(() => {
      const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
      if (blockElement) {
        blockElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });

        blockElement.style.transition = 'box-shadow 0.3s ease';
        blockElement.style.boxShadow = '0 0 0 3px rgba(25, 118, 210, 0.3)';

        setTimeout(() => {
          blockElement.style.boxShadow = '';
        }, 2000);
      }
    }, 100);
  }, []);

  // 블럭 추가
  const handleAddBlock = useCallback(
    (type) => {
      const newBlockId = Date.now() + Math.random();
      const newBlock = {
        id: newBlockId,
        isNew: true,
        type,
        data: '',
        style:
          type === 'TEXT' ? 'text-align: left; padding: 16px;' : 'text-align: center; width: 50%;',
        rank: blocks.length,
        ocrApiCall,
      };
      lastAddedBlockId.current = newBlockId;
      setBlocks((prev) => [...prev, newBlock]);
      setAnchorEl(null);
      scrollToNewBlock(newBlockId);
    },
    [setBlocks, blocks.length, scrollToNewBlock]
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
      ref={editorContainerRef}
      sx={{
        p: { xs: 1, md: 2 },
        minHeight: { xs: '40vh', md: '50vh' },
        background: '#F7F7F7',
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Box sx={{ flexShrink: 0 }}>
        <Typography
          sx={{
            mb: { xs: 1, md: 2 },
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '150%',
            letterSpacing: '0%',
            color: '#1E1E21',
          }}>
          블록 추가
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, md: 2 },
            mb: { xs: 1, md: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: '100%',
          }}>
          <Button
            variant='outlined'
            startIcon={<ImageIcon />}
            onClick={() => handleAddBlock('IMAGE')}
            sx={{
              flex: 1,
              fontFamily: 'Pretendard',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '150%',
              letterSpacing: '0%',
              backgroundColor: '#3E3F45',
              color: '#FFFFFF',
              height: '56px',
              borderRadius: '10px',
            }}>
            이미지 블록 추가
          </Button>
          <Button
            variant='outlined'
            startIcon={<TextIcon />}
            onClick={() => handleAddBlock('TEXT')}
            sx={{
              flex: 1,
              fontFamily: 'Pretendard',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '150%',
              letterSpacing: '0%',
              borderColor: '#C6CAD4',
              color: '#1E1E21',
              height: '56px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
            }}>
            텍스트 블록 추가
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
        }}>
        {blocks.length === 0 ? (
          <Typography color='text.secondary' align='center' sx={{ mt: 10 }}>
            블록을 추가해주세요
          </Typography>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  id={block.id}
                  block={block}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                  ocrApiCall={ocrApiCall}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </Box>
    </Box>
  );
}

function EditorModal({ blocks, onClose, onSave, ocrApiCall }) {
  // body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
    if (onSave) {
      onSave(blocksForSave);
    }

    // 모달 닫기
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Paper
          sx={{
            width: { xs: '95vw', md: '90vw', lg: '85vw' },
            height: { xs: '95vh', md: '90vh' },
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRadius: '10px',
          }}>
          <Typography
            sx={{
              mb: 2,
              fontFamily: 'Pretendard',
              fontWeight: 700,
              fontSize: '24px',
              lineHeight: '150%',
              letterSpacing: '0%',
              color: '#1E1E21',
            }}>
            문제 입력
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, md: 4 },
              flex: 1,
              minHeight: 0,
              flexDirection: 'row',
            }}>
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
              <LocalDraggableBlockEditor
                blocks={internalBlocks}
                setBlocks={setInternalBlocks}
                ocrApiCall={ocrApiCall}
              />
            </Box>
            {/* 우측: 미리보기 */}
            <Box
              sx={{
                flex: 1,
                bgcolor: '#f7f7f7',
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                overflow: 'auto',
                height: '100%',
              }}>
              <Typography
                sx={{
                  mb: { xs: 1, md: 2 },
                  fontFamily: 'Inter',
                  fontWeight: 700,
                  fontSize: '20px',
                  lineHeight: '150%',
                  letterSpacing: '0%',
                  color: '#1E1E21',
                }}>
                미리보기
              </Typography>
              <ProblemViewer problem={problem} />
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: { xs: 1, md: 2 },
              mt: { xs: 1, md: 2 },
              flexDirection: { xs: 'column', sm: 'row' },
            }}>
            <Button
              variant='outlined'
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px',
                width: '120px',
                height: '56px',
              }}>
              취소
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3E3F45',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '18px',
                width: '120px',
                height: '56px',
              }}>
              저장
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default EditorModal;
