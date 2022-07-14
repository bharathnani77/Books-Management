const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')


const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const regexNumber = /\d+/

//Validations
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    if(typeof value ==="number" && value.toString().trim().length === 0) return false
    return true;
}
  
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const register = async function (req, res) {
    try {
        const requestBody= req.body;
        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request, please provide valid details" })
        } 

        //Extract request body fields
        const { title, name, phone, email, password, address } = requestBody;

        // Validations starts
        if(!isValid(title)) {
            return res.status(400).send({status: false, message: 'Title is required'})
        }

        if (!["Mr", "Mrs", "Miss"].indexOf(title) === -1) {  
            return res.status(400).send({ status: false, message: `Title should be among ${['Mr', 'Mrs', 'Miss'].join(', ')}` })
        }

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "Name is requried" })
        }

        if(!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Phone number is requried" }) 
        }

        if(!(!isNaN (Number(phone)) && regexNumber.test(phone))){
            return res.status(400).send({status: false, message: 'Phone number should be a valid number'})
        }

        if(!isValid(email)) {
            return res.status(400).send({status: false, message: 'Email is required'})
        }

        if(!regex.test(email)) {
            return res.status(400).send({status: false, message: 'Email should be a valid email address'})
        }

        if(!isValid(password)) {
            return res.status(400).send({status: false, message: 'Password is required'})
        }

        if(password.split("").length < 8) {
            return res.status(400).send({status: false, message: 'Password length must be between 8 and 15 characters long'})
        }

        if(password.split("").length > 15) {
            return res.status(400).send({status: false, message: 'Password length must be between 8 and 15 characters long'})
        }

        //Duplication of data

        const isPhoneAlreadyUsed = await userModel.findOne({phone});

        if(isPhoneAlreadyUsed) {
            return res.status(400).send({status: false, message: `${phone} phone number already exists`})
        }

        
        const isEmailAlreadyUsed = await userModel.findOne({email});

        if(isEmailAlreadyUsed) {
            return res.status(400).send({status: false, message: `${email} email address already exists`})
        } //Validations ends

        const userData = { title, name, phone, email, password, address }
        const newUser = await userModel.create(userData);

        return res.status(201).send({ status: true, message: "User created succesfully", data: newUser });
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}



const login = async function (req, res) {
  try{
    const requestBody = req.body;
    if(!isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, message: "Invalid request, please provide valid details" })
    } 

    //Extract request body fields
    const {email, password} = requestBody;

    //Validation starts

    if(!isValid(email)) {
        return res.status(400).send({status: false, message: 'Email is requried'})
    }

    if(!regex.test(email)) {
        return res.status(400).send({status: false, message: 'Email should be a valid email address'})
    }

    if(!isValid(password)) {
        return res.status(400).send({status: false, message: 'Password is requried'})
    } //validation ends

    const User = await userModel.findOne({email, password});

    if(!User) {
        return res.status(401).send({status: false, message: 'Invalid login credentials'})
    }

    const token = await jwt.sign({
        userId: User._id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 60
    }, 'someverysecuredprivatekey291@(*#*(@(@()')

    return res.status(200).send({status: true, message: 'User login successful', data: {token}})
} catch (error) {
    return res.status(500).send({status: false, message: error.message});
}
}


module.exports = { register, login }
