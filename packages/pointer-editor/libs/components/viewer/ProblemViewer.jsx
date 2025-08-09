import React, { memo } from 'react';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const ProblemViewer = memo(
  ({ problem, loading = false }) => {
    const renderMathContent = (content) => {
      if (!content) return null;

      // HTML 콘텐츠인 경우 (Quill에서 온 것)
      if (content.includes('<') && content.includes('>')) {
        // Quill HTML 콘텐츠 처리
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Quill의 수식 요소들을 찾아서 텍스트로 변환
        const formulaElements = tempDiv.querySelectorAll('.ql-formula');
        formulaElements.forEach((element) => {
          const formulaValue = element.getAttribute('data-value');
          if (formulaValue) {
            element.outerHTML = `$${formulaValue}$`;
          }
        });

        // HTML을 텍스트로 변환
        let textContent = tempDiv.innerHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<\/h[1-6]>/gi, '\n');

        // 나머지 HTML 태그 제거
        const textDiv = document.createElement('div');
        textDiv.innerHTML = textContent;
        textContent = textDiv.textContent || textDiv.innerText || '';

        // 변환된 텍스트로 수식 처리
        return renderTextWithMath(textContent.trimEnd());
      } else {
        // 일반 텍스트 콘텐츠 (기존 방식)
        return renderTextWithMath(content);
      }
    };

    const renderTextWithMath = (content) => {
      if (!content) return null;

      let processedContent = content;

      const blockMathRegex = /\$\$(.*?)\$\$/g;
      const inlineMathRegex = /\$(.*?)\$/g;

      let parts = [processedContent];

      // 블록 수식 처리
      parts = parts.flatMap((part) => {
        if (typeof part === 'string') {
          const splitParts = [];
          let lastIndex = 0;
          let match;

          while ((match = blockMathRegex.exec(part)) !== null) {
            if (match.index > lastIndex) {
              splitParts.push(part.substring(lastIndex, match.index));
            }
            splitParts.push(
              <Box key={`block-${match.index}`} sx={{ my: 2, textAlign: 'center' }}>
                <BlockMath math={match[1]} />
              </Box>
            );
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < part.length) {
            splitParts.push(part.substring(lastIndex));
          }

          return splitParts.length > 0 ? splitParts : [part];
        }
        return [part];
      });

      // 인라인 수식 처리
      parts = parts.flatMap((part) => {
        if (typeof part === 'string') {
          const splitParts = [];
          let lastIndex = 0;
          let match;

          while ((match = inlineMathRegex.exec(part)) !== null) {
            if (match.index > lastIndex) {
              splitParts.push(part.substring(lastIndex, match.index));
            }
            splitParts.push(<InlineMath key={`inline-${match.index}`} math={match[1]} />);
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < part.length) {
            splitParts.push(part.substring(lastIndex));
          }

          return splitParts.length > 0 ? splitParts : [part];
        }
        return [part];
      });

      // 개행 문자를 <br> 태그로 변환
      parts = parts.flatMap((part, parentIdx) => {
        if (typeof part === 'string') {
          return part
            .split('\n')
            .map((line, lineIdx, array) =>
              lineIdx < array.length - 1 ? [line, <br key={`br-${parentIdx}-${lineIdx}`} />] : line
            )
            .flat();
        }
        return [part];
      });

      // 탭 문자를 적절한 공백으로 변환
      parts = parts.flatMap((part) => {
        if (typeof part === 'string') {
          // 탭을 유지하고 CSS로 간격 조정하도록 변경
          return [part];
        }
        return [part];
      });

      return parts.map((part, index) =>
        typeof part === 'string' ? <span key={index}>{part}</span> : part
      );
    };

    const renderBlock = (block, index) => {
      // CSS 스타일을 파싱하는 함수
      const parseStyleString = (styleString) => {
        if (!styleString) return {};

        const styleObject = {};
        const declarations = styleString.split(';').filter((decl) => decl.trim());

        declarations.forEach((decl) => {
          const [property, value] = decl.split(':').map((s) => s.trim());
          if (property && value) {
            // CSS 속성을 camelCase로 변환
            const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            styleObject[camelProperty] = value;
          }
        });

        return styleObject;
      };

      switch (block.type) {
        case 'TEXT':
          // content 또는 data 필드에서 텍스트 가져오기
          const textContent = block.content || block.data || '';

          // 빈 텍스트 블록은 렌더링하지 않음 (Quill의 기본 빈 콘텐츠도 포함)
          if (
            !textContent ||
            textContent.trim() === '' ||
            /^[\s\n]*$/.test(textContent) ||
            textContent.trim() === '<p><br></p>' ||
            /^<p>\s*<br\s*\/?>\s*<\/p>$/i.test(textContent.trim())
          ) {
            return null;
          }

          return (
            <Typography
              key={index}
              variant='body1'
              component='div'
              sx={{
                mb: 1, // 2에서 1로 줄임
                tabSize: 4,
                MozTabSize: 4,
                whiteSpace: 'pre-wrap',
                '& .katex': {
                  fontSize: '1.2em',
                },
                '& .katex-display': {
                  margin: '1.5em 0',
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  margin: '10px auto',
                },
                '& p': {
                  margin: 0,
                  lineHeight: 1.6,
                },
                ...parseStyleString(block.style),
              }}>
              {renderMathContent(textContent)}
            </Typography>
          );

        case 'IMAGE':
          // content 또는 data 필드에서 이미지 URL 가져오기
          const imageUrl = block.content || block.data || '';

          // 빈 이미지 URL은 렌더링하지 않음
          if (!imageUrl || imageUrl.trim() === '') {
            return null;
          }

          const imageStyles = parseStyleString(block.style);

          return (
            <Box
              key={index}
              sx={{
                my: 1.5,
                textAlign: 'center', // 중앙 정렬 고정
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <img
                src={imageUrl}
                alt={`문제 이미지 ${index + 1}`}
                style={{
                  height: 'auto',
                  maxWidth: '100%',
                  width: imageStyles.width || '50%', // 스타일에서 width 가져오기, 기본값 50%
                  border: imageStyles.border,
                  padding: imageStyles.padding,
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          );

        default:
          return null;
      }
    };

    if (loading || !problem) {
      return (
        <Container maxWidth='md' sx={{ py: 4 }}>
          <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
            <CircularProgress size={60} />
          </Box>
        </Container>
      );
    }

    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
          <Box sx={{ lineHeight: 2, fontSize: '1.1rem' }}>
            {problem.blocks && problem.blocks.length > 0 ? (
              problem.blocks.map((block, index) => renderBlock(block, index))
            ) : (
              <Typography
                variant='body1'
                component='div'
                sx={{
                  '& .katex': {
                    fontSize: '1.2em',
                  },
                  '& .katex-display': {
                    margin: '1.5em 0',
                  },
                }}>
                {renderMathContent(problem.problem_content)}
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>
    );
  },
  (prevProps, nextProps) => {
    // problem의 얕은 비교로 변경 (더 민감하게 반응)
    if (prevProps.loading !== nextProps.loading) return false;

    const prevProblem = prevProps.problem;
    const nextProblem = nextProps.problem;

    if (!prevProblem && !nextProblem) return true;
    if (!prevProblem || !nextProblem) return false;

    // 제목 비교
    if (prevProblem.title !== nextProblem.title) return false;

    // 블록 배열 참조 비교 (더 빠른 감지)
    if (prevProblem.blocks !== nextProblem.blocks) return false;

    return true;
  }
);

export default ProblemViewer;
