const express = require ('express');
const login  = express.Router();
const bCrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const config = require ('../../config');
const db = require ('../../db/dbOps');

login.post('/register', async (req, res, next) => {
    let e = req.body.email;
    let n = req.body.fullname;
    let p = req.body.password;

    let emailReg = new RegExp('^[a-zA-Z]+[a-zA-Z0-9]*@[a-zA-Z]+\.[a-zA-Z]+$'), err = false, errMsg = '';
    if(!e || !emailReg.test(e)) {
        err = true;
        errMsg = 'Invalid Email'
    }
    else if(!p || !n) {
        err = true;
        errMsg = `Invalid ${!n ? 'Name' : 'Password'}`;
    }
    p = bCrypt.hashSync(p, 10);
    if(!err) {
        try {
            await db.query('INSERT INTO users (name, email, pass) VALUES ($1, $2, $3)', [n, e, p]);
            
            res.status(200).json({
                msg : 'Registration Successful'
            });
        }
        catch (e) {
            console.log(e);
            err = true;
            //Unique Constraint Fails. Can be handled by a Select, but this is a single DB op and faster
            if(e.code === '23505') {
                errMsg = 'Email already registered';
            }
            else {
                errMsg = 'DB Error Occurred';
            }
        }
    }

    if(err) {
        return res.status(400).json({
            error : {
                msg : errMsg
            }
        });
    }
});

login.post('/log', async (req, res, next) => {
    let e = req.body.email;
    let p = req.body.password;

    let emailReg = new RegExp('^[a-zA-Z]+[a-zA-Z0-9]*@[a-zA-Z]+\.[a-zA-Z]+$'), err = false, errMsg = '';
    if(!e || !emailReg.test(e)) {
        err = true;
        errMsg = 'Invalid Email'
    }
    else if(!p) {
        err = true;
        errMsg = `Invalid Password`;
    }

    if(!err) {
        let v = await db.query('SELECT id, pass FROM users WHERE email = $1', [e]);

        if(v.rowCount) {
            let r = bCrypt.compareSync(p, v.rows[0].pass.trim());
            
            if(r) {
                let token = jwt.sign({
                    id : v.rows[0].id
                }, config.secret, {
                    expiresIn : config.loginExp
                });

                return res.status(200).json({
                    msg : "Login Successful",
                    token: token
                });
            }
            else {
                err = true;
                errMsg = 'Invalid Password';
            }
        }
        else {
            err = true;
            errMsg = 'Login Details Not Found';
        }
    }

    if(err) {
        return res.status(401).json({
            error : {
                msg : errMsg
            }
        });
    }
});

login.patch('/profile', async function (req, res, next) {
    let e = req.body.email, n = req.body.fullname;

    let emailReg = new RegExp('^[a-zA-Z]+[a-zA-Z0-9]*@[a-zA-Z]+\.[a-zA-Z]+$'), err = false, errMsg = '';

    if(!e || !emailReg.test(e)) {
        err = true;
        errMsg = 'Invalid Email'
    }
    else if(!n) {
        err = true;
        errMsg = `Replacement can't be empty`;
    }
    
    let r = await db.query('UPDATE users SET name = $1 WHERE email = $2', [n, e]);
    if(r.rowCount) {
        return res.status(200).json({
            msg : "Update Successful"
        });
    }
    else {
        err = true;
        errMsg = 'Email not found';
    }
    if(err) {
        return res.status(400).json({
            error : {
                msg : errMsg
            }
        });
    }
});

module.exports = login;