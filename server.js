const express = require('express');
const path = require('path');

// Create app
const app = express();

// Define port
const PORT = process.env.PORT || 5050;

// Serving static files 
app.use(express.static('public'));

// Serve index.html when root page accessed
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/satroutes.html'));
});

// Start server listening on port 5050
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})