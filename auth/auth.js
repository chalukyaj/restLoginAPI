const express = require('express');
const router = express.Router();
const config = require ('../config');
var jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({extended : false}));
router.use(bodyParser.json());

router.all('/*', function (req, res, next) {
    if(req.originalUrl === '/user/register' || req.originalUrl === '/user/log') {
        next();
    }
    else {
        let token = req.headers['x-access-token'];

        if(!token) {
            return res.status (401).json({
                error : {
                    msg : 'Auth Token Missing'
                }
            });
        }
        
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err)
            {
                return res.status(401).send({ 
                    error : {
                        msg: 'Failed to authenticate token.', err : err
                    }
                });
            }
            
            next();
        });
    }
});

module.exports = router;