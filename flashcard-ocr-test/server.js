import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import recognizeText from './ocr-engine.js'
import { generateFlashcards} from './ai-generator.js'

const app = express()
const port= 3000

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



app.listen(port, () =>{
    console.log(`server running on ${port}`)
})