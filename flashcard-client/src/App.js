// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Flashcard from './Flashcard.js'

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextCard = () => {
  // Move to the next card if not at the end
  if (currentIndex < flashcards.length - 1) {
    setCurrentIndex(currentIndex + 1);
  }
};

const handlePrevCard = () => {
  // Move to the previous card if not at the beginning
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
  }
};

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  const API_URL = 'https://flashcard-generator-t4ok.onrender.com'


  const handleExtractText = async () => {
  console.log("triggered extract-text button")
  if (!selectedFile) return;
  setIsExtracting(true);
  setError('');
  setFlashcards([]); // Clear previous flashcards

  const formData = new FormData();
  formData.append('file', selectedFile);
  

  try {
    const response = await axios.post(`${API_URL}/api/extract-text`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setExtractedText(response.data.text);
  } catch (err) {
    console.error("Extraction APi Error", err) //tracting the error more carefully 
    if (err.response){
      setError(`error:${err.response.data.error || 'Server error'}`)
    }
    else{
      setError('Network error. Failed to extract text. Please try again later.');
    }
    
  } finally {
    setIsExtracting(false);
  }
};

  const handleGenerateFlashcards = async () => {
  setCurrentIndex(0);
  if (!extractedText) return;
  setIsGenerating(true);
  setIsExtracting(false)
  setError('');


  try {
    const response = await axios.post(`${API_URL}/api/generate-flashcard`, {
      text: extractedText,
    });
    console.log("Received data from backend:", response.data);
    // The response from Hugging Face is the raw array, not nested
    setFlashcards(response.data.flashcards); 
  } catch (err) {
    setError('Failed to generate flashcards. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};
console.log("Rendering - isExtracting:", isExtracting, "isGenerating:", isGenerating);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Flashcard Generator</h1>
        <p>Upload an image of your textbook to get started.</p>

        <div className="step">
          <h2>Step 1: Upload Image</h2>
          <input type="file" onChange={handleFileChange} />
          <button  type="button" onClick={handleExtractText} disabled={!selectedFile || isExtracting || isGenerating}>
            {isExtracting ? 'Extracting...' : 'Extract Text'}
            
          </button>
          
        </div>
        

        {extractedText && (
          <div className="step">
            <h2>Step 2: Review Text & Generate</h2>
            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              rows="10"
              cols="80"
            />
            <button  type="button" onClick={handleGenerateFlashcards} disabled={isGenerating || isExtracting}>
              {isGenerating ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
        )}

        {flashcards.length > 0 && (
          <div className="step">
            <h2 className="step-title">Step 3: Your Flashcards</h2>
            <div className="flashcard-container">
              {flashcards.map((card, index) => {
                // Determine the state of each card
                const cardState = index < currentIndex ? 'dismissed' : index === currentIndex ? 'active' : 'upcoming';

                // Calculate the style for stacking effect (transform and zIndex)
                const stackStyle = {
                  // Only apply stacking transform if the card is upcoming or dismissed initially
                  transform: cardState !== 'active' ? `translateY(${-index * 4}px)` : undefined, 
                  zIndex: flashcards.length - index,
                };
                return (
                  <Flashcard
                    key={index} // React needs a unique key for list items
                    front={card.front}
                    back={card.back}
                    cardState={cardState} // Pass the calculated state ('active', 'dismissed', 'upcoming')
                    style={stackStyle}    // Pass the stacking styles
                    // Note: onClick logic is now handled inside Flashcard.js for flipping
                  />
                );
              })}
              
            </div>
            <div>
              <button onClick={handlePrevCard} disabled={currentIndex === 0} type="button">
                Previous
              </button>
              <span>{currentIndex + 1} / {flashcards.length}</span>
              <button onClick={handleNextCard} disabled={currentIndex === flashcards.length - 1} type="button">
                Next
              </button>

            </div>
            
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </header>
    </div>
  );
}

export default App;