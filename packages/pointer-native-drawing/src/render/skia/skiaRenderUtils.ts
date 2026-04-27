type MeasureTextFn = (text: string) => { width: number };

/**
 * 텍스트를 최대 너비 기준으로 줄바꿈하여 라인 배열로 반환.
 * calculateTextLineCount와 renderedTexts에서 공유하여 중복 제거.
 */
export function wrapTextToLines(
  text: string,
  maxWidth: number,
  measureText: MeasureTextFn
): string[] {
  const allLines: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (!paragraph) {
      allLines.push('');
      continue;
    }

    const words = paragraph.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const textWidth = measureText(testLine).width;

      if (textWidth > maxWidth && currentLine) {
        allLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }

      if (i === words.length - 1) {
        allLines.push(currentLine);
      }
    }
  }

  return allLines;
}
