🚀 Getting Started
Follow these steps to set up and run the project locally.

Prerequisites

1)Node.js (LTS version recommended)

2)MongoDB Instance (local or cloud-hosted)

3)A Groq API Key

4)A Firebase Project for Authentication

5)Tesseract OCR installed on your system (for text extraction)

--------------------------------------------------------------------------------------------------
Installation
Clone the Repository:
git clone [Your Repository URL]
cd flashcard-generator-ai

--------------------------------------------------------------------------
Install Dependencies:
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install

-----------------------------------------------------------------------------
Environment Variables
# MongoDB
MONGO_URI=[Your MongoDB Connection String]

# Groq
GROQ_API_KEY=[Your Groq API Key]

# Firebase (Configuration for Server-Side Verification/Admin)
FIREBASE_SERVICE_ACCOUNT=[Path to your Firebase service account JSON]

Note: You will also need to configure Firebase credentials within the React frontend

--------------------------------------------------------------------------------------------------
Running the Application
Start the Backend Serve-
node server.js or index.js

Start the Frontend Client (from the client directory):
npm start
