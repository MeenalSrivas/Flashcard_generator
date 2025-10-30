import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import mongoose from 'mongoose'
import admin from 'firebase-admin';
import dotenv from 'dotenv'
import Deck from './models/deck.js';
import recognizeText from './ocr-engine.js'
import { generateFlashcards} from './ai-generator.js'

dotenv.config()
const app = express()
const port= 3000

try {
  // Use environment variable for path in production, or local file
  const serviceAccountPath = process.env.FIREBASE_ADMIN_SDK_PATH || './Firebase_admin_key.json';
  // Check if file exists before trying to import
  if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Firebase Admin SDK key file not found at ${serviceAccountPath}. Ensure it's uploaded as a Secret File on Render.`);
  }
  // Dynamically import JSON (required for ES Modules)
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin Initialized...');
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
  process.exit(1);
}

// --- MongoDB Connection ---
if (!process.env.MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined.");
    process.exit(1);
}
mongoose.connect(process.env.MONGO_URI)
    .then(() => {console.log('MongoDB Connected...');

    app.listen(port, () =>{
    console.log(`server running on ${port}`)
})
})
    .catch(err => {
        console.error('MongoDB Connection Error:', err)
        process.exit(1);
    });





const allowedorigins = [
    'http://localhost:3001', // Your local React app (for testing)
  'https://flashcard-generator-ch-dusky.vercel.app'
]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedorigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.use(express.json())
app.use(cors(allowedorigins))

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'No token provided' })

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Add user info (like uid) to request
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error.code, error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const uploadDir = 'uploads'

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir)
}

const upload = multer({dest: uploadDir})


app.get('/hell', (req, res)=>{
    res.send('hello world')
})
app.post('/api/extract-text', upload.single('file') ,async(req,res) =>{
    if (!req.file){
        return res.status(400).json({error: 'No file uploaded'})
    }
    const language = req.body.language || 'eng'

    try{

        const extractedText = await recognizeText(req.file.path, language)
        res.json({text:extractedText})

    }catch(error){
        res.status(500).json({error: 'Error during text recognition'})

    }finally{
        fs.unlinkSync(req.file.path)
    }
})

app.post('/api/generate-flashcard',async(req,res) =>{
    const {text} =req.body
    if (!text){
        return res.status(400).json({error:"no text is present"})

    }
    try{
        const flashcards = await generateFlashcards(text)
        res.json({flashcards})
        

    }catch(error){
        res.status(500).json({error:'error in generating flashcards'})
    }
})
app.post('/api/decks', authenticateToken, async (req, res) => {
    const userId = req.user.uid;
    const { deckName, flashcards } = req.body;

    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
        return res.status(400).json({ error: 'Flashcards array is required and cannot be empty.' });
    }

    try {
        const newDeck = new Deck({
            userId,
            deckName: deckName || `Deck - ${new Date().toLocaleDateString()}`,
            flashcards: flashcards
        });
        await newDeck.save();
        console.log(`Deck saved for user ${userId}`);
        res.status(201).json(newDeck);
    } catch (error) {
        console.error("Error saving deck:", error);
        res.status(500).json({ error: 'Failed to save deck.' });
    }
});
app.get('/api/decks', authenticateToken, async (req, res) => {
    const userId = req.user.uid;
    try {
        const decks = await Deck.find({ userId }).sort({ createdAt: -1 });
        console.log(`Fetched ${decks.length} decks for user ${userId}`);
        res.json(decks);
    } catch (error) {
        console.error("Error fetching decks:", error);
        res.status(500).json({ error: 'Failed to fetch decks.' });
    }
});



