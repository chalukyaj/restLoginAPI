const express = require ('express');
const app = express ();

const bodyParser = require ('body-parser');
const morgan = require ('morgan');
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Handling cases where there is no valid API endpoint
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404; 
    next(error);
});

//Generic Error Handling
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error : {
            msg : error.message
        }
    });
});

module.exports = app;