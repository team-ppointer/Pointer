import { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

import {
  getFileUploadUrl,
  uploadFileToS3,
} from '../../../../../../../pointer_custom_editor_demo/src/editor-modal/libs/api/fileUpload';

const ImageBlockEditor = memo(({ initialData, onChange }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(50);
  const [borderStyle, setBorderStyle] = useState('none');
  const onChangeRef = useRef(onChange);

  // 현재 스타일을 저장하는 ref (이미지 URL 변경 시 기존 스타일 유지용)
  const currentStyleRef = useRef('');
  const [isInitialized, setIsInitialized] = useState(false);
  const initializedRef = useRef(false); // 중복 초기화 방지

  // 파일 업로드 관련 상태
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // onChange 함수 참조를 항상 최신으로 유지
  onChangeRef.current = onChange;

  // 초기 데이터를 한 번만 설정 (initialData가 변경되어도 다시 초기화하지 않음)
  useEffect(() => {
    if (!initializedRef.current && initialData) {
      initializedRef.current = true;

      // 기존 데이터에서 값들 설정
      if (initialData.content) {
        setImageUrl(initialData.content);
      }

      if (initialData.style) {
        // 기존 스타일에서 width, border 등을 파싱
        const style = initialData.style;
        const widthMatch = style.match(/width:\s*(\d+)%/);
        const borderMatch = style.match(/border:\s*([^;]+)/);

        if (widthMatch) setWidth(parseInt(widthMatch[1]));
        if (borderMatch && borderMatch[1] !== 'none') setBorderStyle(borderMatch[1]);

        currentStyleRef.current = initialData.style;
      } else {
        // 기본 스타일 설정
        const defaultStyle = `text-align: center; width: ${width}%;`;
        currentStyleRef.current = defaultStyle;
      }

      setIsInitialized(true);
    }
  }, [initialData, width]); // width를 의존성에 추가 (기본값 설정용)

  // 이미지 URL 변경 시에만 content 업데이트 (스타일은 기존 것 유지)
  useEffect(() => {
    if (isInitialized) {
      const blockData = {
        type: 'IMAGE',
        content: imageUrl,
        style: currentStyleRef.current, // 기존 스타일 유지
      };

      // 상위 컴포넌트에 변경사항 전달
      onChangeRef.current?.(blockData);
    }
  }, [imageUrl, isInitialized]);

  // 스타일 변경 시에만 스타일 업데이트
  useEffect(() => {
    if (isInitialized) {
      const newStyle = generateStyle();

      // 스타일이 실제로 변경된 경우에만 업데이트
      if (newStyle !== currentStyleRef.current) {
        currentStyleRef.current = newStyle;

        const blockData = {
          type: 'IMAGE',
          content: imageUrl,
          style: newStyle,
        };

        // 상위 컴포넌트에 변경사항 전달
        onChangeRef.current?.(blockData);
      }
    }
  }, [width, borderStyle, isInitialized, imageUrl]);

  const generateStyle = useCallback(() => {
    const styles = ['text-align: center']; // 항상 center로 고정

    // 이미지 크기 추가
    styles.push(`width: ${width}%`);

    if (borderStyle !== 'none') {
      styles.push(`border: ${borderStyle}`);
      styles.push('padding: 10px');
    }

    return styles.join('; ') + ';';
  }, [width, borderStyle]);

  const getImageStyle = useCallback(() => {
    return {
      width: `${width}%`,
      height: 'auto',
      maxWidth: '100%',
      border: borderStyle !== 'none' ? borderStyle : undefined,
      padding: borderStyle !== 'none' ? '10px' : undefined,
    };
  }, [width, borderStyle]);

  // 파일 선택 핸들러
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');
    setIsUploading(true);

    try {
      // 이미지 업로드
      const result = await getFileUploadUrl({ fileName: file.name });
      console.log(result);

      const uploadResult = await uploadFileToS3({
        uploadUrl: result.uploadUrl,
        contentDisposition: result.contentDisposition,
        file: file,
      });
      console.log(uploadResult);
      // 성공 시 URL 설정
      setImageUrl(result.file.url);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      setUploadError(error.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
      // 파일 input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 파일 선택 버튼 클릭
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* 이미지 설정 영역 */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant='h6' component='h3'>
            이미지 블록
          </Typography>
        </Box>

        <TextField
          fullWidth
          size='small'
          label='이미지 URL'
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder='https://example.com/image.jpg'
          sx={{ mb: 1 }}
        />

        {/* 파일 업로드 섹션 */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant='caption' display='block' gutterBottom color='text.secondary'>
            또는 파일을 업로드하세요
          </Typography>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <Button
            variant='outlined'
            size='small'
            startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            onClick={handleUploadClick}
            disabled={isUploading}
            sx={{ mb: 1 }}>
            {isUploading ? '업로드 중...' : '파일 선택'}
          </Button>

          {uploadError && (
            <Alert severity='error' sx={{ mt: 1 }}>
              {uploadError}
            </Alert>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <FormControl size='small' sx={{ minWidth: 80 }}>
            <InputLabel>테두리</InputLabel>
            <Select
              value={borderStyle}
              label='테두리'
              onChange={(e) => setBorderStyle(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    zIndex: 9999,
                  },
                },
                disablePortal: true,
                keepMounted: false,
              }}
              sx={{ zIndex: 9999 }}>
              <MenuItem value='none'>없음</MenuItem>
              <MenuItem value='1px solid #ccc'>얇은 회색</MenuItem>
              <MenuItem value='2px solid #000'>굵은 검정</MenuItem>
              <MenuItem value='1px dashed #999'>점선</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography variant='caption' display='block' gutterBottom>
              이미지 크기: {width}%
            </Typography>
            <Slider
              value={width}
              onChange={(e, newValue) => setWidth(newValue)}
              min={10}
              max={100}
              step={5}
              size='small'
              valueLabelDisplay='auto'
            />
          </Box>
        </Box>
      </Box>

      {/* 미리보기 */}
      {imageUrl && (
        <Box
          sx={{
            mt: 1,
            p: 1,
            border: '1px dashed #ccc',
            borderRadius: 1,
            textAlign: 'center',
          }}>
          <Typography variant='caption' display='block' gutterBottom>
            미리보기:
          </Typography>
          <img
            src={imageUrl}
            alt='미리보기'
            style={getImageStyle()}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            onLoad={(e) => {
              e.target.style.display = 'block';
            }}
          />
        </Box>
      )}
    </>
  );
});

// displayName 설정 (디버깅용)
ImageBlockEditor.displayName = 'ImageBlockEditor';

export default ImageBlockEditor;
