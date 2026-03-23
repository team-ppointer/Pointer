export const colors = {
  black: '#1E1E21',

  // Grayscale
  'gray-100': '#F8F9FC', // 기존 lightgray100
  'gray-200': '#F3F5FB', // 기존 lightgray200
  'gray-300': '#EDEEF2', // 기존 lightgray300
  'gray-400': '#DFE2E7', // 기존 lightgray400
  'gray-500': '#C6CAD4', // 기존 lightgray500
  'gray-600': '#9FA4AE', // 기존 midgray100
  'gray-700': '#6B6F77', // 기존 midgray200
  'gray-800': '#3E3F45', // 기존 darkgray100
  'gray-900': '#222224', // 기존 darkgray200

  // Colors
  'green-100': '#E7F6E5', // 기존 light green
  'green-500': '#0C9200', // 기존 green
  'red-100': '#FCE4E4', // 기존 light red
  'red-400': '#FF3B30', // 기존 red-delete
  'red-500': '#D20000', // 기존 red
  'blue-100': '#ECF0FB', // 기존 light blue 100
  'blue-200': '#D6E1FF', // 기존 light blue 200
  'blue-500': '#3A67EE', // 기존 blue100
  'blue-600': '#2653DA', // 기존 blue200
  'blue-700': '#123FC6', // 기존 blue300

  // Brand Colors
  'primary-100': '#E9EBF8', // 기존 sub color2
  'primary-200': '#C5CEFF', // 기존 sub color1
  'primary-500': '#617AF9', // 기존 main color
  'primary-600': '#526BEA', // 기존 main color2
  'secondary-100': '#FFF4CC', // 기존 light yellow
  'secondary-500': '#E59C00', // 기존 yellow

  // New Colors
  new: '#E75043',
};

export const fontFamily = {
  pretendard: ['Pretendard'],
};

export const fontSize = {
  // ============================================================
  // Deprecated — Use typo-* classes instead (e.g. className="typo-title-1-bold")
  // ============================================================
  /** @deprecated Use typo-* classes instead */
  '32b': ['32px', { fontWeight: '700', lineHeight: '48px' }],
  /** @deprecated Use typo-* classes instead */
  '24b': ['24px', { fontWeight: '700', lineHeight: '36px' }],
  /** @deprecated Use typo-* classes instead */
  '20b': ['20px', { fontWeight: '700', lineHeight: '30px' }],
  /** @deprecated Use typo-* classes instead */
  '20r': ['20px', { fontWeight: '400', lineHeight: '30px' }],
  /** @deprecated Use typo-* classes instead */
  '18b': ['18px', { fontWeight: '700', lineHeight: '27px' }],
  /** @deprecated Use typo-* classes instead */
  '18sb': ['18px', { fontWeight: '600', lineHeight: '27px' }],
  /** @deprecated Use typo-* classes instead */
  '18m': ['18px', { fontWeight: '500', lineHeight: '27px' }],
  /** @deprecated Use typo-* classes instead */
  '16b': ['16px', { fontWeight: '700', lineHeight: '24px' }],
  /** @deprecated Use typo-* classes instead */
  '16sb': ['16px', { fontWeight: '600', lineHeight: '24px' }],
  /** @deprecated Use typo-* classes instead */
  '16m': ['16px', { fontWeight: '500', lineHeight: '24px' }],
  /** @deprecated Use typo-* classes instead */
  '16r': ['16px', { fontWeight: '400', lineHeight: '24px' }],
  /** @deprecated Use typo-* classes instead */
  '14b': ['14px', { fontWeight: '700', lineHeight: '21px' }],
  /** @deprecated Use typo-* classes instead */
  '14sb': ['14px', { fontWeight: '600', lineHeight: '21px' }],
  /** @deprecated Use typo-* classes instead */
  '14m': ['14px', { fontWeight: '500', lineHeight: '21px' }],
  /** @deprecated Use typo-* classes instead */
  '14r': ['14px', { fontWeight: '400', lineHeight: '21px' }],
  /** @deprecated Use typo-* classes instead */
  '13b': ['13px', { fontWeight: '700', lineHeight: '20px' }],
  /** @deprecated Use typo-* classes instead */
  '13m': ['13px', { fontWeight: '500', lineHeight: '20px' }],
  /** @deprecated Use typo-* classes instead */
  '13r': ['13px', { fontWeight: '400', lineHeight: '20px' }],
  /** @deprecated Use typo-* classes instead */
  '12sb': ['12px', { fontWeight: '600', lineHeight: '18px' }],
  /** @deprecated Use typo-* classes instead */
  '12m': ['12px', { fontWeight: '500', lineHeight: '18px' }],
  /** @deprecated Use typo-* classes instead */
  '12r': ['12px', { fontWeight: '400', lineHeight: '18px' }],
  /** @deprecated Use typo-* classes instead */
  '10m': ['10px', { fontWeight: '500', lineHeight: '15px' }],
  /** @deprecated Use typo-* classes instead */
  '10r': ['10px', { fontWeight: '400', lineHeight: '15px' }],

  // ============================================================
  // Typography Tokens — Mobile (default)
  // ============================================================

  // Display 1
  'display-1-bold': ['24px', { fontWeight: '700', lineHeight: '32px', letterSpacing: '-0.72px' }],

  // Title 1
  'title-1-bold': ['22px', { fontWeight: '700', lineHeight: '30px', letterSpacing: '-0.55px' }],
  'title-1-semibold': ['22px', { fontWeight: '600', lineHeight: '30px', letterSpacing: '-0.55px' }],

  // Title 2
  'title-2-bold': ['18px', { fontWeight: '700', lineHeight: '26px', letterSpacing: '-0.36px' }],
  'title-2-semibold': ['18px', { fontWeight: '600', lineHeight: '26px', letterSpacing: '-0.36px' }],

  // Heading 1
  'heading-1-bold': ['17px', { fontWeight: '700', lineHeight: '26px', letterSpacing: '-0.17px' }],
  'heading-1-semibold': ['17px', { fontWeight: '600', lineHeight: '26px', letterSpacing: '-0.17px' }],

  // Heading 2 (same size as Body 1, semantic distinction)
  'heading-2-bold': ['15px', { fontWeight: '700', lineHeight: '24px' }],
  'heading-2-semibold': ['15px', { fontWeight: '600', lineHeight: '24px' }],

  // Body 1
  'body-1-medium': ['15px', { fontWeight: '500', lineHeight: '24px' }],
  'body-1-regular': ['15px', { fontWeight: '400', lineHeight: '24px' }],

  // Body 2
  'body-2-medium': ['14px', { fontWeight: '500', lineHeight: '22px', letterSpacing: '0.07px' }],
  'body-2-regular': ['14px', { fontWeight: '400', lineHeight: '22px', letterSpacing: '0.07px' }],

  // Label 1
  'label-1-semibold': ['13px', { fontWeight: '600', lineHeight: '20px', letterSpacing: '0.13px' }],
  'label-1-medium': ['13px', { fontWeight: '500', lineHeight: '20px', letterSpacing: '0.13px' }],

  // Caption
  'caption-medium': ['12px', { fontWeight: '500', lineHeight: '18px', letterSpacing: '0.18px' }],
  'caption-regular': ['12px', { fontWeight: '400', lineHeight: '18px', letterSpacing: '0.18px' }],

  // ============================================================
  // Typography Tokens — Tablet (md breakpoint, used by typo-* CSS)
  // ============================================================

  // Display 1
  'display-1-bold-tablet': ['28px', { fontWeight: '700', lineHeight: '36px', letterSpacing: '-0.84px' }],

  // Title 1
  'title-1-bold-tablet': ['24px', { fontWeight: '700', lineHeight: '32px', letterSpacing: '-0.6px' }],
  'title-1-semibold-tablet': ['24px', { fontWeight: '600', lineHeight: '32px', letterSpacing: '-0.6px' }],

  // Title 2
  'title-2-bold-tablet': ['20px', { fontWeight: '700', lineHeight: '28px', letterSpacing: '-0.4px' }],
  'title-2-semibold-tablet': ['20px', { fontWeight: '600', lineHeight: '28px', letterSpacing: '-0.4px' }],

  // Heading 1
  'heading-1-bold-tablet': ['18px', { fontWeight: '700', lineHeight: '28px', letterSpacing: '-0.18px' }],
  'heading-1-semibold-tablet': ['18px', { fontWeight: '600', lineHeight: '28px', letterSpacing: '-0.18px' }],

  // Heading 2 (same size as Body 1 tablet)
  'heading-2-bold-tablet': ['16px', { fontWeight: '700', lineHeight: '26px' }],
  'heading-2-semibold-tablet': ['16px', { fontWeight: '600', lineHeight: '26px' }],

  // Body 1
  'body-1-medium-tablet': ['16px', { fontWeight: '500', lineHeight: '26px' }],
  'body-1-regular-tablet': ['16px', { fontWeight: '400', lineHeight: '26px' }],
};

export const screens = {
  sm: '0px',
  md: '740px',
  lg: '1024px',
};

export const shadow = {
  100: {
    shadowColor: '#0C0C0D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  900: {
    shadowColor: '#ff00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
};
