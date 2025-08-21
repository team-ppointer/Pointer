import React, { useState } from 'react';

import {
  GreekDropdownIcon,
  BracketDropdownIcon,
  SymbolDropdownIcon,
  CircleNumberDropdownIcon,
  ParenNumberDropdownIcon,
  SubscriptDropdownIcon,
  VectorIcon,
  FractionIcon,
  SqrtIcon,
  SumIcon,
  IntegralDropdownIcon,
  ParenthesisDropdownIcon,
  LambdaIcon,
  LessEqualDropdownIcon,
  PlusMinusDropdownIcon,
  TriangleDropdownIcon,
  LimDropdownIcon,
  MatrixIcon,
} from '../../assets/formulaGroupIcon';
import {
  AlphaIcon,
  AngleBracketIcon,
  AngleIcon,
  ArchAccentIcon,
  BarAccentIcon,
  BarBracketIcon,
  BecauseIcon,
  BetaIcon,
  BraceIcon,
  BracketIcon,
  CircleOperatorIcon,
  CongruentIcon,
  ContainsIcon,
  CrossDotIcon,
  DegreeIcon,
  DivideIcon,
  DoubleBarIcon,
  ElementOfIcon,
  GammaIcon,
  GreaterEqualIcon,
  HatAccentIcon,
  InfinityIcon,
  IntegralIcon,
  LeftSuperscriptIcon,
  LessEqualIcon,
  LimArrowIcon,
  LimIcon,
  LimToInfinityIcon,
  LimToZeroIcon,
  MinusPlusIcon,
  MuchGreaterIcon,
  MuchLessIcon,
  NotEqualIcon,
  OmegaIcon,
  ParenthesisIcon,
  PiIcon,
  PlusMinusIcon,
  PrecedesIcon,
  ProductIcon,
  SigmaIcon,
  SimilarEqualIcon,
  SmallInterIcon,
  SmallProductIcon,
  SmallSigmaIcon,
  SubscriptIcon,
  SubsetEqIcon,
  SubsetIcon,
  SucceedsIcon,
  SuperscriptIcon,
  SupersetEqIcon,
  SupersetIcon,
  ThereforeIcon,
  ThetaIcon,
  TimesIcon,
  TriangleIcon,
  UnionIcon,
} from '../../assets/formulaIcon';

// 카테고리별 기호 데이터
const categories = [
  {
    label: '그리스어',
    symbols: ['ⅰ', 'ⅱ', 'ⅲ', 'ⅳ', 'ⅴ', 'ⅵ', 'ⅶ', 'ⅷ', 'ⅸ', 'ⅹ', 'ⅺ', 'ⅻ'],
  },
  {
    label: '괄호',
    symbols: ['〖', '〗', '〔', '〕'],
  },
  {
    label: '기호',
    symbols: ['★', '☆', '●', '○', '◎', '◇', '◆', '□', '■', '△', '▲', '▽', '▼', '→', '←'],
  },
  {
    label: '원문자',
    symbols: [
      '㉠',
      '㉡',
      '㉢',
      '㉣',
      '㉤',
      '㉥',
      '㉦',
      '㉧',
      '㉨',
      '㉩',
      '㉪',
      '㉫',
      '㉬',
      '㉭',
      '①',
      '②',
      '③',
      '④',
      '⑤',
      '⑥',
      '⑦',
      '⑧',
      '⑨',
      '⑩',
    ],
  },
  {
    label: '괄호문자',
    symbols: ['⑴', '⑵', '⑶', '⑷', '⑸', '⑹', '⑺', '⑻', '⑼', '⑽'],
  },
  {
    label: '첨자',
    symbols: [
      {
        icon: <SuperscriptIcon />,
        latex: '^{}',
      },
      {
        icon: <LeftSuperscriptIcon />,
        latex: '{}^{}',
      },
      {
        icon: <SubscriptIcon />,
        latex: '_{}',
      },
    ],
  },
  {
    label: '벡터',
    symbols: [
      {
        icon: <BarAccentIcon />,
        latex: '\\overline{ }',
      },
      {
        icon: <HatAccentIcon />,
        latex: '\\hat{}',
      },
      {
        icon: <ArchAccentIcon />,
        latex: '\\overset{\\frown}{ }',
      },
    ],
  },
  {
    label: '분수',
    symbols: ['\\dfrac{a}{b}'],
  },
  {
    label: '제곱근',
    symbols: ['\\sqrt{x}', '\\sqrt[3]{x}'],
  },
  {
    label: '시그마',
    symbols: [
      {
        icon: <SigmaIcon />,
        latex: '\\sum _{ } ^{ }',
      },
      {
        icon: <ProductIcon />,
        latex: '\\prod_{ }^{ }',
      },
    ],
  },
  {
    label: '적분',
    symbols: [
      {
        icon: <IntegralIcon />,
        latex: '\\int_{ }^{ }',
      },
    ],
  },
  {
    label: '괄호셋',
    symbols: [
      {
        icon: <ParenthesisIcon />,
        latex: '\\left( \\right)',
      },
      {
        icon: <BracketIcon />,
        latex: '\\left[ \\right]',
      },
      {
        icon: <BraceIcon />,
        latex: '\\left\\{ \\right\\}',
      },
      {
        icon: <AngleBracketIcon />,
        latex: '\\langle \\rangle',
      },
      {
        icon: <BarBracketIcon />,
        latex: '\\left|\\right|',
      },
      {
        icon: <DoubleBarIcon />,
        latex: '\\left\\lVert \\right\\rVert',
      },
    ],
  },
  {
    label: '람다',
    symbols: [
      {
        icon: <AlphaIcon />,
        latex: '\\alpha',
      },
      {
        icon: <BetaIcon />,
        latex: '\\beta',
      },
      {
        icon: <GammaIcon />,
        latex: '\\gamma',
      },
      {
        icon: <ThetaIcon />,
        latex: '\\theta',
      },
      {
        icon: <PiIcon />,
        latex: '\\pi',
      },
      {
        icon: <OmegaIcon />,
        latex: '\\omega',
      },
    ],
  },
  {
    label: '이등호',
    symbols: [
      {
        icon: <SmallSigmaIcon />,
        latex: '\\Sigma',
      },
      {
        icon: <SmallProductIcon />,
        latex: '\\Pi',
      },
      {
        icon: <SmallInterIcon />,
        latex: '\\cap',
      },
      {
        icon: <UnionIcon />,
        latex: '\\cup',
      },
      {
        icon: <SubsetIcon />,
        latex: '\\subset',
      },
      {
        icon: <SupersetIcon />,
        latex: '\\supset',
      },
      {
        icon: <SubsetEqIcon />,
        latex: '\\subseteq',
      },
      {
        icon: <SupersetEqIcon />,
        latex: '\\supseteq',
      },
      {
        icon: <ElementOfIcon />,
        latex: '\\in',
      },
      {
        icon: <ContainsIcon />,
        latex: '\\ni',
      },
      {
        icon: <LessEqualIcon />,
        latex: '\\leq',
      },
      {
        icon: <GreaterEqualIcon />,
        latex: '\\geq',
      },
      {
        icon: <MuchLessIcon />,
        latex: '\\ll',
      },
      {
        icon: <MuchGreaterIcon />,
        latex: '\\gg',
      },
      {
        icon: <PrecedesIcon />,
        latex: '\\prec',
      },
      {
        icon: <SucceedsIcon />,
        latex: '\\succ',
      },
    ],
  },
  {
    label: '플마',
    symbols: [
      {
        icon: <PlusMinusIcon />,
        latex: '\\pm',
      },
      {
        icon: <MinusPlusIcon />,
        latex: '\\mp',
      },
      {
        icon: <TimesIcon />,
        latex: '\\times',
      },
      {
        icon: <DivideIcon />,
        latex: '\\div',
      },
      {
        icon: <CircleOperatorIcon />,
        latex: '\\circ',
      },
      {
        icon: <DegreeIcon />,
        latex: '\\degree',
      },
      {
        icon: <ThereforeIcon />,
        latex: '\\therefore',
      },
      {
        icon: <BecauseIcon />,
        latex: '\\because',
      },
      {
        icon: <NotEqualIcon />,
        latex: '\\neq',
      },
      {
        icon: <SimilarEqualIcon />,
        latex: '\\sim',
      },
      {
        icon: <CongruentIcon />,
        latex: '\\cong',
      },
      {
        icon: <InfinityIcon />,
        latex: '\\infty',
      },
    ],
  },
  {
    label: '삼각형',
    symbols: [
      {
        icon: <TriangleIcon />,
        latex: '\\triangle',
      },
      {
        icon: <AngleIcon />,
        latex: '\\angle',
      },
    ],
  },
  {
    label: '행렬',
    symbols: ['\\begin{bmatrix}1 & 0 \\\\ 0 & 1\\end{bmatrix}'],
  },
  {
    label: '극한',
    symbols: [
      {
        icon: <LimIcon />,
        latex: '\\lim_{ } { }',
      },
      {
        icon: <LimArrowIcon />,
        latex: '\\lim_{ \\to } { }',
      },
      {
        icon: <LimToZeroIcon />,
        latex: '\\lim_{ \\to 0} { }',
      },
      {
        icon: <LimToInfinityIcon />,
        latex: '\\lim_{ \\to \\infty} { }',
      },
    ],
  },
];

const FormulaSymbolDropdown = ({ onInsert, inputRef }) => {
  const [openCategory, setOpenCategory] = useState(null);

  const getCategoryIcon = (label) => {
    switch (label) {
      case '그리스어':
        return <GreekDropdownIcon />;
      case '괄호':
        return <BracketDropdownIcon />;
      case '기호':
        return <SymbolDropdownIcon />;
      case '원문자':
        return <CircleNumberDropdownIcon />;
      case '괄호문자':
        return <ParenNumberDropdownIcon />;
      case '첨자':
        return <SubscriptDropdownIcon />;
      case '벡터':
        return <VectorIcon />;
      case '분수':
        return <FractionIcon />;
      case '제곱근':
        return <SqrtIcon />;
      case '시그마':
        return <SumIcon />;
      case '적분':
        return <IntegralDropdownIcon />;
      case '괄호셋':
        return <ParenthesisDropdownIcon />;
      case '람다':
        return <LambdaIcon />;
      case '이등호':
        return <LessEqualDropdownIcon />;
      case '플마':
        return <PlusMinusDropdownIcon />;
      case '삼각형':
        return <TriangleDropdownIcon />;
      case '극한':
        return <LimDropdownIcon />;
      case '행렬':
        return <MatrixIcon />;
      default:
        return <span>{label}</span>;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
      {categories.map((cat) => (
        <div key={cat.label} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              const instantInsertLabels = ['분수', '제곱근', '행렬'];

              if (instantInsertLabels.includes(cat.label)) {
                const firstSymbol = cat.symbols?.[0];
                const latex = typeof firstSymbol === 'object' ? firstSymbol.latex : firstSymbol;

                onInsert(latex);

                setTimeout(() => {
                  const input = inputRef?.current;
                  if (input) {
                    input.focus();
                    input.setSelectionRange(input.value.length, input.value.length);
                  }
                }, 0);
              } else {
                setOpenCategory((prev) => (prev === cat.label ? null : cat.label));
              }
            }}
            style={{
              padding: '0px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {getCategoryIcon(cat.label)}
          </button>

          {openCategory === cat.label && (
            <div
              style={{
                position: 'absolute',
                top: '120%',
                left: 0,
                background: 'white',
                border: '1px solid #C6CAD4',
                borderRadius: '4px',
                zIndex: 10000,
                display: 'grid',
                gridTemplateColumns: 'repeat(8, auto)',
                gap: '8px',
                padding: '8px',
              }}>
              {cat.symbols.map((s, idx) => {
                const isObject = typeof s === 'object' && s !== null;

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const latex = isObject ? s.latex : s;
                      onInsert(latex);
                      setOpenCategory(null);
                      setTimeout(() => {
                        const input = inputRef?.current;
                        if (input) {
                          input.focus();
                          input.setSelectionRange(input.value.length, input.value.length);
                        }
                      }, 0);
                    }}
                    style={{
                      padding: '6px 8px',
                      fontSize: '14px',
                      border: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                    }}>
                    {isObject ? s.icon : s}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FormulaSymbolDropdown;
