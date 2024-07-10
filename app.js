const express = require('express');
const bodyParser = require('body-parser');
const visaRoutes = require('./routes/visa-routes');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', visaRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
