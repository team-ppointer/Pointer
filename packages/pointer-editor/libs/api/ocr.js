export const recognizeImageWithMathpix = async (imageUrl, ocrApiCall) => {
  const requestData = {
    src: imageUrl,
    formats: ['text', 'latex_styled'],
    metadata: { improve_mathpix: false },
    include_line_data: true,
    format_options: {
      text: {
        transform: [],
      },
    },
  };

  console.log('OCR Request Data:', JSON.stringify(requestData));

  // admin의 다른 mutation들과 동일한 패턴: { body: {...} }
  const res = await ocrApiCall({
    body: requestData,
  });
  return res;
};

export const convertMathpixToDollar = (text) => {
  if (!text) return '';
  let output = text;
  output = output.replace(/\\\[([\s\S]*?)\\\]/g, (_m, p1) => `$${p1.replace(/\s+/g, ' ').trim()}$`);
  output = output.replace(/\\\(([\s\S]*?)\\\)/g, (_m, p1) => `$${p1.replace(/\s+/g, ' ').trim()}$`);
  return output;
};

export function composeTextFromLineData(lineData) {
  if (!Array.isArray(lineData) || lineData.length === 0) return '';
  const pieces = lineData.map((item) => {
    const raw = typeof item?.text === 'string' ? item.text : '';
    const normalized = raw.replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
    return normalized.replace(/^\n+|\n+$/g, '');
  });
  return pieces.join('\n');
}

export const recognizeAndConvertMathpixText = async (imageUrl, ocrApiCall) => {
  const json = await recognizeImageWithMathpix(imageUrl, ocrApiCall);
  const converted = convertMathpixToDollar(json.text || '');
  return converted;
};

export default {
  recognizeImageWithMathpix,
  convertMathpixToDollar,
  recognizeAndConvertMathpixText,
  composeTextFromLineData,
};
