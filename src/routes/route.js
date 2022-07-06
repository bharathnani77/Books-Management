const express = require("express")
const router = express.Router();

const userController = require('../controller/userController')
const bookController=require('../controller/bookController')

//____Creating_User____\\
router.post('/register', userController.CreateRegister)
//____User_Login_____\\
router.post('/login', userController.userLogin)
//____Creating_books____\\
router.post('/books', bookController.createBook)



module.exports = router;