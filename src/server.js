import express from 'express';
import bodyParser from 'body-parser';

const app = express();
var cors = require('cors')

app.use(cors())

app.use(bodyParser.json());

var fs = require("fs");

app.get('/api/rooms', (req, res) => {

    var contents = fs.readFileSync('./src/mockapi/api.json');
    
    // Define to JSON type
    var rooms = JSON.parse(contents);
   // Get Value from JSON

    res.status(200).json(`${JSON.stringify(rooms.data)}`);
});


app.listen(8000, () => console.log('Listening on port 8000'));