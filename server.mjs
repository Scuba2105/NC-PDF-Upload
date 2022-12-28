import express from 'express';
import fileUpload from "express-fileupload"
import path from 'path';
import {findData, createData, getJSON} from './controllers/dataController.mjs';

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

app.get('/dates', async (req, res) => {
  try {
    getJSON(req, res);
  } 
  catch (err) {
    res.send(err.message);
  }
});

app.post('/fileupload', async (req, res) => {
  try {
    const createdData = await createData(req, res, __dirname);
    res.render('routes',createdData);
  } 
  catch (error) {
    res.send(err.message);
  }
});

app.post('/search', async (req, res) => {
  try {  
  const foundData = await findData(req, res, __dirname);
    if (foundData != undefined) {
      res.render('routes',foundData);  
    }
    else {
      res.send(`There is no data for ${res.body.searchfordata}. Please select a valid date`);
    }
  }
  catch (error) {
    res.send(err.message);
  }
});

// Start server listening on port 5050
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})