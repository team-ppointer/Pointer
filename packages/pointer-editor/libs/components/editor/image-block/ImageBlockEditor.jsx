import { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  Box,
  TextField,
  Slider,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';

import { MinusIcon, PlusIcon, CloudUploadIcon } from '../../../assets';
import { getFileUploadUrl, uploadFileToS3 } from '../../../api/fileUpload';

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
    <Box sx={{ display: 'flex', minHeight: '300px', gap: 2 }}>
      {/* 왼쪽 설정 영역 */}
      <Box sx={{ flex: 1, py: 2 }}>
        {/* 이미지 선택 혹은 교체 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#1E1E21',
              }}>
              이미지 선택 혹은 교체
            </Typography>
          </Box>

          {/* 파일 input (숨김) */}
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {/* URL 입력 필드 + 업로드 버튼 통합 */}
          <TextField
            fullWidth
            size='small'
            placeholder='이미지를 선택해 주세요'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            sx={{
              justifyContent: 'center',
              backgroundColor: '#F7F7F7',
              borderRadius: '10px',
              height: '56px',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiOutlinedInput-input': {
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#1E1E21',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              '& .MuiOutlinedInput-input::placeholder': {
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#C6CAD4',
                opacity: 1,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    sx={{
                      padding: 0,
                      marginRight: 0,
                      marginLeft: 2,
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&:active': {
                        backgroundColor: 'transparent',
                      },
                    }}>
                    <CloudUploadIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {uploadError && (
            <Alert severity='error' sx={{ mt: 1 }}>
              {uploadError}
            </Alert>
          )}
        </Box>

        {/* 이미지 크기 조절 섹션 */}
        <Box>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#1E1E21',
              }}>
              이미지 크기 조절
            </Typography>

            <Typography
              variant='subtitle2'
              sx={{
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '150%',
                letterSpacing: '0%',
                color: '#1E1E21',
              }}>
              {width}%
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F7F7F7',
              borderRadius: '10px',
              height: '56px',
              gap: 0,
            }}>
            <IconButton
              onClick={() => setWidth(Math.min(100, width - 5))}
              disableRipple
              sx={{
                padding: 0,
                marginRight: 0,
                marginLeft: 2,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:active': {
                  backgroundColor: 'transparent',
                },
              }}>
              <MinusIcon />
            </IconButton>
            <Slider
              value={width}
              onChange={(e, newValue) => setWidth(newValue)}
              min={10}
              max={100}
              step={5}
              sx={{
                flex: 1,
                height: 2,
                '& .MuiSlider-rail': {
                  backgroundColor: '#C6CAD4',
                },
                '& .MuiSlider-thumb': {
                  height: 16,
                  width: 16,
                  backgroundColor: '#1E1E21',
                  border: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                  '&.Mui-focusVisible': {
                    boxShadow: 'none',
                  },
                },
              }}
            />
            <IconButton
              onClick={() => setWidth(Math.min(100, width + 5))}
              disableRipple
              sx={{
                padding: 0,
                marginLeft: 0,
                marginRight: 2,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:active': {
                  backgroundColor: 'transparent',
                },
              }}>
              <PlusIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* 오른쪽 미리보기 영역 */}
      <Box
        sx={{
          flex: 1,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
        }}>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            minHeight: '200px',
            backgroundColor: '#fafafa',
          }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt='미리보기'
              style={{
                ...getImageStyle(),
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              onLoad={(e) => {
                e.target.style.display = 'block';
              }}
            />
          ) : (
            <Typography
              variant='body2'
              sx={{
                fontFamily: 'Pretendard',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '150%',
                letterSpacing: '0%',
                textAlign: 'center',
                color: '#C6CAD4',
                whiteSpace: 'pre-line',
              }}>
              {'이미지\n미리보기'}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
});

// displayName 설정 (디버깅용)
ImageBlockEditor.displayName = 'ImageBlockEditor';

export default ImageBlockEditor;
