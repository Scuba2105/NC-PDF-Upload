import express from 'express';
import path from 'path';
// Must remove test data and replace with exported function from extractPDFData 
import {storeData} from './utils/extractPDFData.mjs';
import fileUpload from "express-fileupload"

// Create app
const app = express();

// Define port
const PORT = process.env.PORT || 5050;

// Define __dirname
const __dirname = path.dirname('.')

// Load view engine
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Serving static files 
app.use(express.static('public'));
app.use(fileUpload());

// Serve index.html when root page accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post('/fileupload', async (req, res) => {
  try {
    const pdf = req.files.pdftoparse
    const testData = await storeData(pdf.data);
    res.render('routes',testData);
  } 
  catch (error) {
    res.send(err.message);
  }
});

app.post('/search', (req, res) => {
  try {
    const body = 'hello world';
    
    // Calling response.writeHead method
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'text/plain'
    });
    
    res.end(body);
  } 
  catch (error) {
    res.send(err.message);
  }
});

// Start server listening on port 5050
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})