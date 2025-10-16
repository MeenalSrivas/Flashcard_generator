// src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExtractText = async () => {
  if (!selectedFile) return;
  setLoading(true);
  setError('');
  setFlashcards([]); // Clear previous flashcards

  const formData = new FormData();
  formData.append('file', selectedFile);
  

  try {
    const response = await axios.post('http://localhost:3000/api/extract-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setExtractedText(response.data.text);
  } catch (err) {
    setError('Failed to extract text. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleGenerateFlashcards = async () => {
  if (!extractedText) return;
  setLoading(true);
  setError('');

  try {
    const response = await axios.post('http://localhost:3000/api/generate-flashcard', {
      text: extractedText,
    });
    // The response from Hugging Face is the raw array, not nested
    setFlashcards(response.data.flashcards); 
  } catch (err) {
    setError('Failed to generate flashcards. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Flashcard Generator</h1>
        <p>Upload an image of your textbook to get started.</p>

        <div className="step">
          <h2>Step 1: Upload Image</h2>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleExtractText} disabled={!selectedFile || loading}>
            {loading ? 'Extracting...' : 'Extract Text'}
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
            <button onClick={handleGenerateFlashcards} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Flashcards'}
            </button>
          </div>
        )}

        {flashcards.length > 0 && (
          <div className="step">
            <h2>Step 3: Your Flashcards</h2>
            <div className="flashcard-container">
              {flashcards.map((card, index) => (
                <div className="flashcard" key={index}>
                  <div className="flashcard-front"><strong>Front:</strong> {card.front}</div>
                  <div className="flashcard-back"><strong>Back:</strong> {card.back}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </header>
    </div>
  );
}

export default App;