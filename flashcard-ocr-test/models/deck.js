// models/Deck.js
import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true }
});

const deckSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // To link to Firebase User ID
    deckName: { type: String, required: true, trim: true, default: 'Untitled Deck' },
    flashcards: [flashcardSchema],
    createdAt: { type: Date, default: Date.now }
});

// Prevent Mongoose from recompiling model if it already exists (useful for development)
export default mongoose.models.Deck || mongoose.model('Deck', deckSchema);