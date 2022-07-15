
const express = require("express")
const router = express.Router();

const {register,login} = require('../controller/userController')
const {createBook, getAllBooks,getBookDetails,updateBook,deleteBook} = require('../controller/bookController')
const {authentication, authorisation} = require('../middleware/auth')
const {addReview, updateReview,deleteReview} = require('../controller/reviewController')
const {uploadFile} = require('../aws/config')

    


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

router.post("/aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})

module.exports = router;