import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
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
} from "../../../assets/formulaGroupIcon";
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
} from "../../../assets/formulaIcon";

const categories = [
  {
    label: "그리스어",
    symbols: ["ⅰ", "ⅱ", "ⅲ", "ⅳ", "ⅴ", "ⅵ", "ⅶ", "ⅷ", "ⅸ", "ⅹ", "ⅺ", "ⅻ"],
  },
  {
    label: "괄호",
    symbols: ["『", "』", "「", "」"],
  },
  {
    label: "기호",
    symbols: [
      "★",
      "☆",
      "●",
      "○",
      "◎",
      "◇",
      "◆",
      "□",
      "■",
      "△",
      "▲",
      "▽",
      "▼",
      "→",
      "←",
    ],
  },
  {
    label: "원문자",
    symbols: [
      "㉠",
      "㉡",
      "㉢",
      "㉣",
      "㉤",
      "㉥",
      "㉦",
      "㉧",
      "㉨",
      "㉩",
      "㉪",
      "㉫",
      "㉬",
      "㉭",
      "①",
      "②",
      "③",
      "④",
      "⑤",
      "⑥",
      "⑦",
      "⑧",
      "⑨",
      "⑩",
    ],
  },
  {
    label: "괄호문자",
    symbols: ["⑴", "⑵", "⑶", "⑷", "⑸", "⑹", "⑺", "⑻", "⑼", "⑽"],
  },
  {
    label: "첨자",
    symbols: [
      {
        icon: <SuperscriptIcon />,
        latex: "^{}",
      },
      {
        icon: <LeftSuperscriptIcon />,
        latex: "{}^{}", // { } LSUP { }
      },
      {
        icon: <SubscriptIcon />,
        latex: "_{}",
      },
    ],
  },
  {
    label: "벡터",
    symbols: [
      {
        icon: <BarAccentIcon />,
        latex: "\\overline{ }",
      },
      {
        icon: <HatAccentIcon />,
        latex: "\\hat{}",
      },
      {
        icon: <ArchAccentIcon />,
        latex: "\\overset{\\frown}{ }",
      },
    ],
  },
  {
    label: "분수",
    symbols: ["\\dfrac{a}{b}"],
  },
  {
    label: "제곱근",
    symbols: ["\\sqrt{x}", "\\sqrt[3]{x}"],
  },
  {
    label: "시그마",
    symbols: [
      {
        icon: <SigmaIcon />,
        latex: "\\sum _{ } ^{ }",
      },
      {
        icon: <ProductIcon />,
        latex: "\\prod_{ }^{ }",
      },
    ],
  },
  {
    label: "적분",
    symbols: [
      {
        icon: <IntegralIcon />,
        latex: "\\int_{ }^{ }",
      },
    ],
  },

  {
    label: "괄호셋",
    symbols: [
      {
        icon: <ParenthesisIcon />,
        latex: "\\left( \\right)",
      },
      {
        icon: <BracketIcon />,
        latex: "\\left[ \\right]",
      },
      {
        icon: <BraceIcon />,
        latex: "\\left\\{ \\right\\}",
      },
      {
        icon: <AngleBracketIcon />,
        latex: "\\langle \\rangle",
      },
      {
        icon: <BarBracketIcon />,
        latex: "\\left|\\right|",
      },
      {
        icon: <DoubleBarIcon />,
        latex: "\\left\\lVert \\right\\rVert",
      },
    ],
  },
  {
    label: "람다",
    symbols: [
      {
        icon: <AlphaIcon />,
        latex: "α",
      },
      {
        icon: <BetaIcon />,
        latex: "β",
      },
      {
        icon: <GammaIcon />,
        latex: "γ",
      },
      {
        icon: <ThetaIcon />,
        latex: "θ",
      },
      {
        icon: <PiIcon />,
        latex: "π",
      },
      {
        icon: <OmegaIcon />,
        latex: "ω",
      },
    ],
  },
  {
    label: "이등호",
    symbols: [
      {
        icon: <SmallSigmaIcon />,
        latex: "∑",
      },
      {
        icon: <SmallProductIcon />,
        latex: "∏",
      },
      {
        icon: <SmallInterIcon />,
        latex: "∩",
      },
      {
        icon: <UnionIcon />,
        latex: "∪",
      },
      {
        icon: <SubsetIcon />,
        latex: "⊂",
      },
      {
        icon: <SupersetIcon />,
        latex: "⊃",
      },
      {
        icon: <SubsetEqIcon />,
        latex: "⊆",
      },
      {
        icon: <SupersetEqIcon />,
        latex: "⊇",
      },
      {
        icon: <ElementOfIcon />,
        latex: "∈",
      },
      {
        icon: <ContainsIcon />,
        latex: "∋",
      },
      {
        icon: <LessEqualIcon />,
        latex: "≤",
      },
      {
        icon: <GreaterEqualIcon />,
        latex: "≤",
      },
      {
        icon: <MuchLessIcon />,
        latex: "≪",
      },
      {
        icon: <MuchGreaterIcon />,
        latex: "≫",
      },
      {
        icon: <PrecedesIcon />,
        latex: "<",
      },
      {
        icon: <SucceedsIcon />,
        latex: ">",
      },
    ],
  },
  {
    label: "플마",
    symbols: [
      {
        icon: <PlusMinusIcon />,
        latex: "±",
      },
      {
        icon: <MinusPlusIcon />,
        latex: "∓",
      },
      {
        icon: <TimesIcon />,
        latex: "×",
      },
      {
        icon: <DivideIcon />,
        latex: "÷",
      },
      {
        icon: <CircleOperatorIcon />,
        latex: "∘",
      },
      {
        icon: <DegreeIcon />,
        latex: "°",
      },
      {
        icon: <ThereforeIcon />,
        latex: "∴",
      },
      {
        icon: <BecauseIcon />,
        latex: "∵",
      },
      {
        icon: <NotEqualIcon />,
        latex: "≠",
      },
      {
        icon: <SimilarEqualIcon />,
        latex: "∼",
      },
      {
        icon: <CongruentIcon />,
        latex: "≃",
      },
      {
        icon: <InfinityIcon />,
        latex: "∞",
      },
    ],
  },
  {
    label: "삼각형",
    symbols: [
      {
        icon: <TriangleIcon />,
        latex: "△",
      },
      {
        icon: <AngleIcon />,
        latex: "∠",
      },
    ],
  },
  {
    label: "행렬",
    symbols: ["\\begin{bmatrix}1 & 0 \\\\ 0 & 1\\end{bmatrix}"],
  },
  {
    label: "극한",
    symbols: [
      {
        icon: <LimIcon />,
        latex: "lim _{ } { }",
      },
      {
        icon: <LimArrowIcon />,
        latex: "lim _{ -> } { }",
      },
      {
        icon: <LimToZeroIcon />,
        latex: "lim _{ ->0} { }",
      },
      {
        icon: <LimToInfinityIcon />,
        latex: "lim _{ ->inf} { }",
      },
    ],
  },
];

const FormulaSymbolDropdown = ({ onInsert, inputRef }) => {
  const [openCategory, setOpenCategory] = useState(null);

  const getCategoryIcon = (label) => {
    switch (label) {
      case "그리스어":
        return <GreekDropdownIcon />;
      case "괄호":
        return <BracketDropdownIcon />;
      case "기호":
        return <SymbolDropdownIcon />;
      case "원문자":
        return <CircleNumberDropdownIcon />;
      case "괄호문자":
        return <ParenNumberDropdownIcon />;
      case "첨자":
        return <SubscriptDropdownIcon />;
      case "벡터":
        return <VectorIcon />;
      case "분수":
        return <FractionIcon />;
      case "제곱근":
        return <SqrtIcon />;
      case "시그마":
        return <SumIcon />;
      case "적분":
        return <IntegralDropdownIcon />;
      case "괄호셋":
        return <ParenthesisDropdownIcon />;
      case "람다":
        return <LambdaIcon />;
      case "이등호":
        return <LessEqualDropdownIcon />;
      case "플마":
        return <PlusMinusDropdownIcon />;
      case "삼각형":
        return <TriangleDropdownIcon />;
      case "극한":
        return <LimDropdownIcon />;
      case "행렬":
        return <MatrixIcon />;
      default:
        return <span>{label}</span>;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
        flexWrap: "wrap",
      }}
    >
      {categories.map((cat) => (
        <div key={cat.label} style={{ position: "relative" }}>
          <button
            onClick={() => {
              const instantInsertLabels = ["분수", "제곱근", "행렬"];

              if (instantInsertLabels.includes(cat.label)) {
                const firstSymbol = cat.symbols?.[0];
                const latex =
                  typeof firstSymbol === "object"
                    ? firstSymbol.latex
                    : firstSymbol;

                onInsert(latex);

                setTimeout(() => {
                  const input = inputRef?.current;
                  if (input) {
                    input.focus();
                    input.setSelectionRange(
                      input.value.length,
                      input.value.length
                    );
                  }
                }, 0);
              } else {
                setOpenCategory((prev) =>
                  prev === cat.label ? null : cat.label
                );
              }
            }}
            style={{
              padding: "0px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getCategoryIcon(cat.label)}
          </button>

          {openCategory === cat.label && (
            <div
              style={{
                position: "absolute",
                top: "120%",
                left: 0,
                background: "white",
                border: "1px solid #C6CAD4",
                borderRadius: "4px",
                zIndex: 10000,
                display: "grid",
                gridTemplateColumns: "repeat(8, auto)",
                gap: "8px",
                padding: "8px",
              }}
            >
              {cat.symbols.map((s, idx) => {
                const isObject = typeof s === "object" && s !== null;

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
                          input.setSelectionRange(
                            input.value.length,
                            input.value.length
                          );
                        }
                      }, 0);
                    }}
                    style={{
                      padding: "6px 8px",
                      fontSize: "14px",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                    }}
                  >
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

const FormulaModal = ({ isOpen, onClose, onSave, initialValue = "" }) => {
  const [formula, setFormula] = useState(initialValue);
  const [preview, setPreview] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setFormula(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (formula) {
      try {
        const rendered = katex.renderToString(formula, { throwOnError: false });
        setPreview(rendered);
      } catch {
        setPreview("수식 오류");
      }
    } else {
      setPreview("");
    }
  }, [formula]);

  const handleSave = () => {
    onSave(formula);
    onClose();
    setFormula("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "400px",
          maxWidth: "600px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          zIndex: 10000,
        }}
      >
        <h3 style={{ margin: "0 0 15px 0" }}>LaTeX 수식 입력</h3>

        <FormulaSymbolDropdown
          onInsert={(symbol) => setFormula((prev) => prev + symbol)}
          inputRef={inputRef}
        />

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            수식:
          </label>
          <input
            ref={inputRef}
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: x^2 + y^2 = z^2"
            style={{
              width: "97%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            미리보기:
          </label>
          <div
            style={{
              border: "1px solid #eee",
              padding: "10px",
              minHeight: "40px",
              backgroundColor: "#f9f9f9",
              borderRadius: "4px",
              textAlign: "center",
            }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            삽입
          </button>
        </div>

        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
          }}
        >
          💡 Enter로 삽입, Esc로 취소
        </div>
      </div>
    </div>
  );
};

export default FormulaModal;
