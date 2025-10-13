import Tesseract from "tesseract.js";

const imagePath = './test2.jpg';

console.log(`recognising text from ${imagePath}`)

const recognizeText = async (imagePath, language) =>{
    try {
        const worker = await Tesseract.createWorker(language)
        

        const {data: {text}} = await worker.recognize(imagePath)
        
        await worker.terminate()
        return text
    }
    catch(error){
        console.error('error during text recognition:', error)

    }

}
export default recognizeText