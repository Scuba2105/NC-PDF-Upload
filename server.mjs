import express from 'express';
import path from 'path';
// Must remove test data and replace with exported function from extractPDFData 
import {storeData} from './utils/extractPDFData.mjs';

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

// Serve index.html when root page accessed
app.get('/', async (req, res) => {
  const testData = await storeData('/home/steven/WebDevelopment/Route List Summary/pdf/RouteListSummary20221227_NCH_NCHTUE_NCHMFPRIM_221222093142_78.pdf')
    res.render('routes',testData);
});

// Start server listening on port 5050
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})