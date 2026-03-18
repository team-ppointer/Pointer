const USE_MATHPIX_DIRECTLY = false;

export const getMathpixKeys = () => {
  // Vite 전용: .env(.local)에서 VITE_* 변수를 읽습니다.
  const { VITE_MATHPIX_APP_ID, VITE_MATHPIX_API_KEY } = import.meta.env as unknown as {
    VITE_MATHPIX_APP_ID?: string;
    VITE_MATHPIX_API_KEY?: string;
  };

  const appId = VITE_MATHPIX_APP_ID ?? '';
  const appKey = VITE_MATHPIX_API_KEY ?? '';

  if (!appId || !appKey) {
    throw new Error(
      'Mathpix API 환경값이 설정되지 않았습니다. (.env.local에 VITE_MATHPIX_APP_ID, VITE_MATHPIX_API_KEY 필요)'
    );
  }

  return { appId, appKey };
};

export const recognizeImageWithMathpix = async (
  imageUrl: string,
  ocrApiCall: (data: any) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
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

  if (USE_MATHPIX_DIRECTLY) {
    const { appId, appKey } = getMathpixKeys();
    const res = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        app_id: appId,
        app_key: appKey,
      },
      body: JSON.stringify(requestData),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Mathpix 요청 실패: ${res.status} ${res.statusText} ${errText}`);
    }
    const json = await res.json();
    return json;
  } else {
    console.log('OCR API Call:', ocrApiCall);
    // admin의 다른 mutation들과 동일한 패턴: { body: {...} }
    const res = await ocrApiCall({
      body: requestData,
    });
    return res;
  }
};

export const convertMathpixToDollar = (text: string) => {
  if (!text) return '';
  let output = text;
  output = output.replace(/\\\[([\s\S]*?)\\\]/g, (_m, p1) => `$${p1.replace(/\s+/g, ' ').trim()}$`);
  output = output.replace(/\\\(([\s\S]*?)\\\)/g, (_m, p1) => `$${p1.replace(/\s+/g, ' ').trim()}$`);
  return output;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function composeTextFromLineData(lineData: any) {
  if (!Array.isArray(lineData) || lineData.length === 0) return '';
  const pieces = lineData.map((item) => {
    const raw = typeof item?.text === 'string' ? item.text : '';
    const normalized = raw.replace(/\r\n/g, '\n').replace(/[\t ]+$/gm, '');
    return normalized.replace(/^\n+|\n+$/g, '');
  });
  return pieces.join('\n');
}

export const recognizeAndConvertMathpixText = async (
  imageUrl: string,
  ocrApiCall: (data: any) => Promise<any> // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
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
