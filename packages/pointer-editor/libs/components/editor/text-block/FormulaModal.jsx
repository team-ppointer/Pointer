import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const FormulaModal = ({ isOpen, onClose, onSave, initialValue = '' }) => {
  const [formula, setFormula] = useState(initialValue);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    setFormula(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (formula) {
      try {
        const rendered = katex.renderToString(formula, { throwOnError: false });
        setPreview(rendered);
      } catch {
        setPreview('수식 오류');
      }
    } else {
      setPreview('');
    }
  }, [formula]);

  const handleSave = () => {
    onSave(formula);
    onClose();
    setFormula('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '400px',
          maxWidth: '600px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 10000,
        }}>
        <h3 style={{ margin: '0 0 15px 0' }}>LaTeX 수식 입력</h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>수식:</label>
          <input
            type='text'
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='예: x^2 + y^2 = z^2'
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            미리보기:
          </label>
          <div
            style={{
              border: '1px solid #eee',
              padding: '10px',
              minHeight: '40px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              textAlign: 'center',
            }}
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
            삽입
          </button>
        </div>

        <div
          style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
          }}>
          💡 Enter로 삽입, Esc로 취소
        </div>
      </div>
    </div>
  );
};

export default FormulaModal;
