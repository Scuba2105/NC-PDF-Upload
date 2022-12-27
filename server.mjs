import express from 'express';
import fileUpload from "express-fileupload"
import path from 'path';
import {findData, createData} from './controllers/dataController.mjs';

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
    res.render('routes',foundData);  
  } 
  catch (error) {
    res.send(`There is no data for ${req.body.searchfordata} . Please select an appropriate date`);
  }
});

// Start server listening on port 5050
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})