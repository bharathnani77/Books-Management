const bookModel = require('../Models/bookModel')
const userModel=require('../Models/userModel')

const mongoose= require('mongoose')

// - Create a book document from request body. Get userId in request body only.
// - Make sure the userId is a valid userId by checking the user exist in the users collection.
// - Return HTTP status 201 on a succesful book creation. Also return the book document. 
// The response should be a JSON object like [this](#successful-response-structure) 
// - Create atleast 10 books for each user
// - Return HTTP status 400 for an invalid request with a response body like [this](#error-response-structure)

// {
//     "_id": ObjectId("88abc190ef0288abc190ef55"),
//     "title": "How to win friends and influence people",
//     "excerpt": "book body",
//     "userId": ObjectId("88abc190ef0288abc190ef02"),
//     "ISBN": "978-0008391331",
//     "category": "Book",
//     "subcategory": "Non fiction",
//     "isDeleted": false,
//     "reviews": 0,
//     "releasedAt": "2021-09-17"
//     "createdAt": "2021-09-17T04:25:07.803Z",
//     "updatedAt": "2021-09-17T04:25:07.803Z",
//   }
const createBook = async function (req, res) {

    const data = req.body
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please enter valid Detail" })

    if (!title) return res.status(400).send({ status: false, message: "Title is mandatory" })
    if (!excerpt) return res.status(400).send({ status: false, message: "excerpt is mandatory" })
    if (!userId) return res.status(400).send({ status: false, message: "userId is mandatory" })
    if (!ISBN) return res.status(400).send({ status: false, message: "ISBN is mandatory" })
    if (!category) return res.status(400).send({ status: false, message: "category is mandatory" })
    if (!subcategory) return res.status(400).send({ status: false, message: "subcategory is mandatory" })
    if (!releasedAt) return res.status(400).send({ status: false, message: "Released date is mandatory" })
    
    if (mongoose.Types.ObjectId.isValid(userId) == false) {
        return res.status(400).send({ status: false, message: "userId Invalid" });
    }
    const userID = await userModel.findOne({_id: userId}) 
    if(!userID) return res.status(404).send({status: false, message: "UserID not Found"})

    const postBook = await bookModel.create(data)
    res.status(201).send({ status: true, message: "Created successfully", data: postBook , releasedAt: new Date()})

}

module.exports = { createBook }