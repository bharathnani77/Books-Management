const mongoose = require('mongoose')

const userModel = require('../models/userModel')
const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const upload = require('../aws/config')

const dateRegex = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/ 


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    if(typeof value ==="number" && value.toString().trim().length === 0) return false
    return true;
}
  
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
 }


const createBook = async (req, res) => {
  try {
    const requestBody= req.body;
    let files = req.files;
    let uploadedFileURL;
    if(!isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, message: "Invalid request, please provide valid details" })
    } 

    //Extract request body fields
    const { title, excerpt, userId, ISBN, category, subcategory, releasedAt  } = requestBody;


    // Validations starts
    if(!isValid(title)) {
        return res.status(400).send({status: false, message: 'Title is required'})
    }

    const isTitleAlreadyUsed = await bookModel.findOne({title});

    if(isTitleAlreadyUsed) {
        return res.status(400).send({status: false, message: 'Title already exists'})
    }

    if(!isValid(excerpt)) {
        return res.status(400).send({status: false, message: 'Excerpt is required'})
    }

    if(!isValid(userId)) {
        return res.status(400).send({status: false, message: 'User id is required'})
    }
    
    if(!isValidObjectId(userId)) {
        return res.status(400).send({status: false, message: `${userId} is an invalid user id`})
    }

    const isUserIdExists = await userModel.findOne({_id : userId})

    if(!isUserIdExists) return res.status(400).send({status: false, messsage: `${userId} does not exists`})

    if(!isValid(ISBN)) {
        return res.status(400).send({status: false, message: 'ISBN is required'})
    }

    const isISBNAlreadyUsed = await userModel.findOne({ISBN : ISBN})

    if(isISBNAlreadyUsed) {
        return res.status(400).send({status: false, message: `${ISBN} ISBN is already in use`})
    }

    if(!isValid(category)) {
        return res.status(400).send({status: false, message: 'Category is required'})
    }

    if(!isValid(subcategory)) {
        return res.status(400).send({status: false, message: 'SubCategory is required'})
    }

    if(!isValid(releasedAt)) {
        return res.status(400).send({status: false, message: 'Release date is required'})
    }

    if(!dateRegex.test(releasedAt)) {
        return res.status(400).send({status: false, message: 'Release date must be in "YYYY-MM-DD"'})
    }

    if(files && files.length>0){
        uploadedFileURL = await upload.uploadFile(files[0]);
     }
     obj['bookCover'] = uploadedFileURL

    const newBook = await bookModel.create({
        title, excerpt, userId, ISBN, category, subcategory, releasedAt 
    });

    return res.status(201).send({status: true, message: 'Book created successfully', data: newBook});
} catch (error) {
    return res.status(500).send({status: false, message: error.message});
}
}

const getAllBooks = async (req, res) => {
  try {
    const filterQuery = {isDeleted : false}
    const queryParams = req.query;

    if(isValidRequestBody(queryParams)) {
        const { userId, category, subcategory} = queryParams;

        if(isValid(userId) && isValidObjectId(userId)) {
            filterQuery['userId'] = userId
        }

        if(isValid(category)) {
            filterQuery['category'] = category.trim()
        }

        if(isValid(subcategory)) {
            filterQuery['subcategory'] = subcategory.trim()
        }  
    }

    const books = await bookModel.find(filterQuery).sort({title: 1}).select("_id title excerpt userId category releasedAt reviews")

    if(Array.isArray(books) && books.length === 0) {
        return res.status(404).send({status: false, message: 'No Books found'})
    }

    return res.status(200).send({status: true, message: 'Books List', data: books})
} catch (error) {
    return res.status(500).send({status: false, message: error.message});
}
}

const getBookDetails = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if(!isValidObjectId(bookId)) {
            return res.status(400).send({status: false, message: `${bookId} is not a valid book id`})
        }

        const book = await bookModel.findById({ _id: bookId, isDeleted: false})

        const data = book.toObject()
        data['reviewsData'] = reviews

        return res.status(200).send({status: false, message: 'Success', data: data})
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}

const updateBook = async function (req, res) {
    try {
        const requestBody = req.body
        const params = req.params
        const bookId = params.bookId
        const userId = req.userId

        //validation starts
        if(!isValidObjectId(bookId)) {
            return res.status(400).send({status: false, message: `${bookId} is not a valid book id`})
        }

        if(!isValidObjectId(userId)) {
            return res.status(400).send({status: false, message: `${userId} is not a valid user id`})
        }

        const book = await bookModel.find({_id: bookId, isDeleted: false})

        if(!book) {
            return res.status(404).send({status: false, message: 'Book not found'})
        }

        if(book.userId.toString() !== userId) {
            return res.status(403).send({status: false, message: 'Unauthorized access! owner info not found'})
        }

        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, messsage: 'No parameters passed'})
        }

        //Extract request body fields
        const { title, excerpt, releasedAt, ISBN} = requestBody

        const updatedBookData = {}

        if(isValid(title)) {
            const isTitleAlreadyUsed = await bookModel.findOne({title, _id: {$ne: bookId}});

            if(isTitleAlreadyUsed) {
                return res.status(400).send({status: false, message: `${title} title already exists`})
            }

            if(!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
            updatedBookData['$set'] = {}
            updatedBookData['$set']['title'] = title
        }

        if (isValid(excerpt)) {
            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                 updatedBookData['$set'] = {}
            updatedBookData['$set']['excerpt'] = excerpt
        }

        if (isValid(ISBN)) {
            const isISBNAlreadyUsed = await bookModel.findOne({ISBN, _id: {$ne: bookId}});

            if(isISBNAlreadyUsed) {
                return res.status(400).send({status: false, message: `${ISBN} ISBN already exists`})
            }

            if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                 updatedBookData['$set'] = {}
            updatedBookData['$set']['ISBN'] = ISBN
        }    
            

            if (isValid(releasedAt)) {

                if(!dateRegex.test(releasedAt)) {
                    return res.status(400).send({status: false, message: 'Releasing date must in "YYY-MM-DD" format'})
                }

                if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
                   updatedBookData['$set'] = {}
                updatedBookData['$set']['releasedAt'] = releasedAt;
            }

            const updatedBook = await bookModel.findOneAndUpdate({_id: bookId}, updatedBookData, {new: true})

            return res.status(200).send({status: true, message: 'Success', data: updatedBook});
        } catch (error) {
                return res.status(500).send({status: false, message: error.message})
            }
        }

const deleteBook = async function (req, res) {
    try {
        const params = req.params
        const bookId = params.bookId
        const userId = req.userId;

        if(!isValidObjectId(bookId)) {
            return res.status(400).send({status: false, message: `${bookId} is not a valid book id`})
        }

        if(!isValidObjectId(userId)) {
            return res.status(400).send({status: false, message: `${userId} is not a valid user id`})
        }

        const book = await bookModel.find({_id: bookId, isDeleted: false})

        if(!book) {
            return res.status(404).send({status: false, message: 'Book not found'})
        }

        if(book.userId.toString() !== userId) {
            return res.status(403).send({status: false, message: 'Unauthorized access! owner info not found'})
        }

        await bookModel.findOneAndUpdate({_id: bookId},{$set: {isDeleted: true, deletedAt: new Date()}})
        return res.status(200).send({status: true, message: 'Success'})
    } catch (error) {
        return res.status(500).send({status: false, message: error.message});
    }
}


module.exports = {createBook, getAllBooks,getBookDetails, updateBook, deleteBook}
