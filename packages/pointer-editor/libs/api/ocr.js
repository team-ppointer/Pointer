export const getMathpixKeys = () => {
  const g = typeof globalThis !== 'undefined' ? globalThis : window;
  const viteEnv =
    typeof import.meta !== 'undefined' && import.meta && import.meta.env
      ? import.meta.env
      : undefined;

  const appId =
    (g && g.__MATHPIX_APP_ID) ||
    (viteEnv && viteEnv.VITE_MATHPIX_APP_ID) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_MATHPIX_APP_ID) ||
    '';

  const appKey =
    (g && g.__MATHPIX_API_KEY) ||
    (viteEnv && viteEnv.VITE_MATHPIX_API_KEY) ||
    (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_MATHPIX_API_KEY) ||
    '';

  if (!appId || !appKey) throw new Error('Mathpix API 환경값이 설정되지 않았습니다.');
  return { appId, appKey };
};

export const recognizeImageWithMathpix = async (imageUrl) => {
  const { appId, appKey } = getMathpixKeys();
  const res = await fetch('https://api.mathpix.com/v3/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      app_id: appId,
      app_key: appKey,
    },
    body: JSON.stringify({
      src: imageUrl,
      formats: ['text', 'latex_styled'],
      metadata: { improve_mathpix: false },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Mathpix 요청 실패: ${res.status} ${res.statusText} ${errText}`);
  }
  const json = await res.json();
  return json;
};

export const convertMathpixToDollar = (text) => {
  if (!text) return '';
  let output = text;
  output = output.replace(/\\\[([\s\S]*?)\\\]/g, (_m, p1) => `$${p1.replace(/\s+/g, ' ').trim()}$`);
  output = output.replace(/\\\(([\s\S]*?)\\\)/g, (_m, p1) => `$${p1.replace(/\s+/g, ' ').trim()}$`);
  return output;
};

export const recognizeAndConvertMathpixText = async (imageUrl) => {
  const json = await recognizeImageWithMathpix(imageUrl);
  const converted = convertMathpixToDollar(json.text || '');
  return converted;
};

export default {
  getMathpixKeys,
  recognizeImageWithMathpix,
  convertMathpixToDollar,
  recognizeAndConvertMathpixText,
};
