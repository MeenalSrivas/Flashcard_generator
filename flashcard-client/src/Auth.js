// src/Auth.js
import React, { useState,useEffect } from 'react';
import { auth, googleProvider,createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup } from "./firebase";
import './Auth.css'; 
import { useNavigate } from 'react-router-dom';

const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.47-1.97 3.23v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.01z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

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
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // On success, the AuthPage.js listener will redirect
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button 
        type="button" 
        onClick={handleGoogleSignIn} 
        disabled={loading} 
        className="google-signin-button"
      >
        <GoogleIcon />
        Sign {isSignUp ? 'Up' : 'In'} with Google
      </button>

      
      
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

      

      

      

      
      
      
      {error && <p className="error">{error}</p>}

      <button 
        type="button" 
        onClick={() => setIsSignUp(!isSignUp)} 
        disabled={loading} 
        className="toggle-auth-button"
      >
        {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}

export default Auth;