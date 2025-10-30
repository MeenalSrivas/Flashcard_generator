
import React, { useState, useEffect } from 'react';

const flashcardBaseStyle = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  transformStyle: 'preserve-3d',
  transition: 'transform 0.7s ease-in-out, opacity 0.6s ease-in-out',
  cursor: 'pointer',
  borderRadius: '12px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
};

const flashcardFaceBaseStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  borderRadius: '12px',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  fontFamily: "'Poppins', sans-serif", 
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '25px',
  boxSizing: 'border-box',
};

const frontFaceStyle = {
  ...flashcardFaceBaseStyle, 
  backgroundColor: '#ffffff',
  color: '#333',
  border: '1px solid #f0f0f0',
};

const backFaceStyle = {
  ...flashcardFaceBaseStyle, 
  background: 'linear-gradient(135deg, #61dafb 0%, #3a7bd5 100%)',
  color: '#ffffff',
  transform: 'rotateY(180deg)',
};

const labelStyle = {
  fontWeight: 600,
  color: '#999',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: '15px',
  display: 'flex',
  alignItems: 'center',
};

const textStyle = {
  fontSize: '1.1rem',
  lineHeight: 1.6,
  margin: 0,
};

function Flashcard({ front, back, cardState, style: propStyle }) {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (cardState !== 'active') {
      setIsFlipped(false);
    }
  }, [cardState]);

  const handleCardClick = () => {
    if (cardState === 'active') {
      setIsFlipped(!isFlipped);
    }
  };

  let dynamicTransform = {};
  if (cardState === 'active') {
    dynamicTransform = { transform: `translateY(-20px) scale(1.03) ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`, zIndex: 100 };
  } else if (cardState === 'dismissed') {
    dynamicTransform = { transform: 'translateX(150%) rotate(45deg)', opacity: 0 };
  }
 
  const combinedStyle = {
    ...flashcardBaseStyle,
    ...propStyle, 
    ...dynamicTransform, 
  };

  return (
    <div style={combinedStyle} onClick={handleCardClick}>
      <div style={frontFaceStyle}>
        <strong style={labelStyle}>👁️ Front</strong>
        <p style={textStyle}>{front}</p>
      </div>
      <div style={backFaceStyle}>
        <strong style={labelStyle}>✅ Back</strong>
        <p style={textStyle}>{back}</p>
      </div>
    </div>
  );
}

export default Flashcard;