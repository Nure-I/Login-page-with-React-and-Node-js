const express = require('express')
const router = express.Router();

//  mongodb user model
const User = require('./../models/User')

// Password handler
const bcrypt = require('bcrypt')

// signup
router.post('/signup', (req, res) => {
    let {name, email, password, dateofBirth} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dateofBirth = dateofBirth.trim();

    if(name == "" || email == "" || password == "" || dateofBirth == ""){
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        })
    }else if(!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    }else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){

        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })
    }else if (!new Date(dateofBirth).getTime()){
        res.json({
            status: "FAILED",
            message: "Invalid date of birth entered"
        })
    }else if(password.length < 8){
        res.json({
            status: "FAILED",
            message: "Password is too short!"
        })
    }else{
        // Checking if user already exists
        User.find({email}).then(result => {
            if(result.length) {
                // A user already exists
                res.json({
                    status: "FAILED",
                    message: "User email already exists"
                })
            } else{
                // Try to create new user

                // Password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateofBirth
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result,
                        })
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while saving user"
                        })
                    })
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing password"
                    })
                })
            }
        }).catch(err => {
            console.log(err),
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
    }
})

router.post('/signin', (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty credetials!"
        })
    } else {
        // check if user exist
        User.find({email}).then(data => {
            if (data.length){
                // user exists
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if(result){
                        // password match
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Invalid password entered"
                        })
                    }
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while comparing passwords!"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid Credentials entered!"
                })
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
    }
})
module.exports = router;