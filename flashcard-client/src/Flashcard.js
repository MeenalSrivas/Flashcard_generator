import React, { useState, useEffect } from 'react';
import './flashcard.css'; // Import the new CSS file


function Flashcard({ front, back, cardState, style: propStyle }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // When the card is no longer 'active', reset its flip state.
  useEffect(() => {
    if (cardState !== 'active') {
      setIsFlipped(false);
    }
  }, [cardState]);

  // Handle the click to flip the card.
  // Only allows flipping if the card is the 'active' one.
  const handleCardClick = () => {
    if (cardState === 'active') {
      setIsFlipped(!isFlipped);
    }
  };

  // --- Dynamic Styles ---
  // These styles change based on the component's state,
  // so they remain inline.
  
  let dynamicTransform = {};
  if (cardState === 'active') {
    // The active card is brought up, scaled, and can be flipped
    dynamicTransform = { 
      transform: `translateY(-20px) scale(1.03) ${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}`, 
      zIndex: 100 
    };
  } else if (cardState === 'dismissed') {
    // A dismissed card is animated off-screen
    dynamicTransform = { 
      transform: 'translateX(150%) rotate(45deg)', 
      opacity: 0 
    };
  }
  // 'upcoming' cards just use their default CSS transform (from propStyle)

  // Combine the base, prop (stacking), and dynamic styles
  const combinedStyle = {
    ...propStyle, 
    ...dynamicTransform, 
  };

  // The JSX now uses CSS classes instead of inline style objects
  return (
    <div 
      className="flashcard-base" 
      style={combinedStyle} 
      onClick={handleCardClick}
    >
      {/* Front Face of the Card */}
      <div className="flashcard-face flashcard-front">
        <strong className="flashcard-label">👁️ Front</strong>
        <p className="flashcard-text">{front}</p>
      </div>
      
      {/* Back Face of the Card */}
      <div className="flashcard-face flashcard-back">
        <strong className="flashcard-label">✅ Back</strong>
        <p className="flashcard-text">{back}</p>
      </div>
    </div>
  );
}

export default Flashcard;

