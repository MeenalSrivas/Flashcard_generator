// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { auth } from './firebase'; // Import Firebase auth
import { onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import Flashcard from './Flashcard.js'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const [user, setUser] = useState(null); 
  const [idToken, setIdToken] = useState(null); 
  const [savedDecks, setSavedDecks] = useState([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingDecks, setIsFetchingDecks] = useState(false);

  const handleNextCard = () => {
  
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await getIdToken(currentUser);
          setIdToken(token);
          console.log(token)
          //await handleFetchDecks(token); // Fetch decks immediately on login
        } catch (error) {
          console.error("Error getting ID token:", error);
          setError("Failed to authenticate session. Please log in again.");
          setIdToken(null);
          setSavedDecks([]);
        }
      } else {
        // User is signed out
        setIdToken(null);
        setFlashcards([]); // Clear generated cards on logout
        setSavedDecks([]); // Clear saved decks on logout
        setExtractedText(''); // Clear text on logout
        setSelectedFile(null); // Clear selected file
        navigate('/auth')
      }
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const getAuthHeader = () => {
    if (!idToken) {
      console.error("Attempted API call without ID token.");
      return null; // Or throw an error
    }
    return { headers: { Authorization: `Bearer ${idToken}` } };
  };

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("Logout Error:", error);
      setError("Failed to log out.");
    });
  };
  const handleSaveDeck = async () => {
    const authHeader = getAuthHeader();
    if (!authHeader || flashcards.length === 0) return;

    setIsSaving(true);
    setError('');
    try {
      // Prompt for a deck name or use a default
      const deckName = prompt("Enter a name for this deck:", `Deck - ${new Date().toLocaleDateString()}`);
      if (!deckName) { // Handle cancel
          setIsSaving(false);
          return;
      }

      const response = await axios.post(`${API_URL}/api/decks`,
          { deckName: deckName, flashcards: flashcards },
          authHeader
      );
      alert('Deck saved!');
      setFlashcards([]); // Clear current generated cards after saving
      await handleFetchDecks(idToken); // Refresh saved decks list
    } catch (err) {
      console.error("Save Deck Error:", err);
      setError(err.response?.data?.error || 'Failed to save deck.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleFetchDecks = async (token) => {
    if (!token) return;
    setIsFetchingDecks(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/decks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedDecks(response.data);
    } catch (err) {
      console.error("Fetch Decks Error:", err);
      // Don't overwrite other errors unless fetching fails
      if (!error) setError(err.response?.data?.error || 'Failed to fetch saved decks.');
    } finally {
      setIsFetchingDecks(false);
    }
  };
  const loadDeck = (deckToLoad) => {
      setFlashcards(deckToLoad.flashcards);
      setCurrentIndex(0);
      setExtractedText(''); // Clear extraction area
      setSelectedFile(null);
  };

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

        {user ? (
          // --- Logged In View ---
          <>
            <button className="logout-btn" type="button" onClick={handleLogout} disabled={isSaving || isFetchingDecks} >
              Log Out
            </button>
            <h1>AI Flashcard Generator</h1>
            <p>Welcome, {user.email}!</p>
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
                const cardState = index < currentIndex ? 'dismissed' : index === currentIndex ? 'active' : 'upcoming';

                const stackStyle = {
                  
                  transform: cardState !== 'active' ? `translateY(${-index * 4}px)` : undefined, 
                  zIndex: flashcards.length - index,
                };
                return (
                  <Flashcard
                    key={index} 
                    front={card.front}
                    back={card.back}
                    cardState={cardState} 
                    style={stackStyle}    
                    
                  />
                );
              })}
              
            </div>
            <div className="nagivation">
              <button onClick={handlePrevCard} disabled={currentIndex === 0} type="button">
                Previous
              </button>
              <span>{currentIndex + 1} / {flashcards.length}</span>
              <button onClick={handleNextCard} disabled={currentIndex === flashcards.length - 1} type="button">
                Next
              </button>

            </div>
            <button type="button" onClick={handleSaveDeck} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save This Deck'}
                </button>
            
            
          </div>
        )}
        <div className="step">
              <h2>My Saved Decks</h2>
              <button 
            type="button" 
            onClick={() => handleFetchDecks(idToken)} 
            disabled={isFetchingDecks}
          >
            {isFetchingDecks ? 'Loading...' : 'Fetch My Saved Decks'}
          </button>
              {isFetchingDecks && <p>Loading decks...</p>}
              {!isFetchingDecks && savedDecks.length === 0 && <p>You haven't saved any decks yet.</p>}
              {!isFetchingDecks && savedDecks.length > 0 && (
                <ul>
                  {savedDecks.map(deck => (
                    <li key={deck._id}>
                      {deck.deckName || 'Untitled Deck'} ({deck.flashcards.length} cards) - Created on {new Date(deck.createdAt).toLocaleDateString()}
                      <button type="button" onClick={() => loadDeck(deck)} style={{ marginLeft: '10px' }}>Load</button>
                      {/* Add Delete button/functionality here later */}
                    </li>
                  ))}
                </ul>
              )}
            </div>

        {error && <p className="error">{error}</p>}
        </>
        ) : (
          
          <h1>Loading...</h1>
        )}
        
      </header>
    </div>
  );
}

export default App;