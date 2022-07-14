
const express = require("express")
const router = express.Router();

const {register,login} = require('../controller/userController')
const {createBook, getAllBooks,getBookDetails,updateBook,deleteBook} = require('../controller/bookController')
const {authentication, authorisation} = require('../middleware/auth')
const {addReview, updateReview,deleteReview} = require('../controller/reviewController')

    


//____Creating_User____\\
router.post('/register',register)
//____User_Login_____\\
router.post('/login', login)

//Book Apis

router.post('/books',createBook)
router.get('/books',authentication, getAllBooks)
router.get('/books/:bookId',authentication,getBookDetails)
router.put('/books/:bookId',authentication,authorisation,updateBook)
router.delete('/books/:bookId',authentication,authorisation,deleteBook)



//Review Apis

router.post("/books/:bookId/review", addReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)

module.exports = router;