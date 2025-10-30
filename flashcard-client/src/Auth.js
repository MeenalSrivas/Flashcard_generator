// src/Auth.js
import React, { useState,useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase'; // Import auth from your config file
import { onAuthStateChanged } from 'firebase/auth';
import './Auth.css'; 
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Default to Sign Up
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate()

  useEffect(() =>{
    const unsubscribe = onAuthStateChanged(auth, (user) =>{
      if(user){
        navigate('/')
      }
    })
    return () => unsubscribe();
  },[navigate])
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        // User will be automatically logged in after signup
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // No need for alert, onAuthStateChanged in App.js will handle UI update
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      
      <div className="animation-wrapper">
        <ul className="floating-cards">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <h1 className="auth-title">Welcome to AI Flashcards</h1>
      <p className="auth-subtitle">Log in or sign up to create your decks</p> 
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleSubmit}>
        
        <input
        className="auth-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
    
          placeholder="Email"
          required
          disabled={loading}
        />
        
        <input
          type="password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
        />
        <button className="auth-button" type="submit" disabled={loading} >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
        
        
      </form>
      
      <button type="button" onClick={() => setIsSignUp(!isSignUp)} disabled={loading}>
        Switch to {isSignUp ? 'Log In' : 'Sign Up'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default Auth;