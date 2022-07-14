const mongoose = require('mongoose')
const bookModel = require('../models/bookModel')

const BookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const ReviewModel = require('../models/reviewModel')

const numberRegex = /\d+/

const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0
}

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false
  if (typeof value === "string" && value.trim().length === 0) return false
  if(typeof value ==="number" && value.toString().trim().length === 0) return false
  return true;
}

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
}

const addReview = async function (req, res) {
  try {
    const requestBody = req.body
    const params = req.params
    const bookId = params.bookId

    if(!isValidRequestBody(requestBody)) {
      return res.status(400).send({ status: false, message: "Invalid request, please provide valid details" })
    } 

    if(!isValidObjectId(bookId)) {
      return res.status(400).send({status: false, message: `${bookId} is an invalid book id`})
    }

    const book = await bookModel.findOne({_id:bookId, isDeleted: false})

    if(!book) return res.status(404).send({status: false, message: 'Book does not exist'})

    const {review, rating, reviewedBy} = requestBody;

    if(!isValid(rating)) {
      return res.status(400).send({status: false, message: 'Rating is required'})
    }

    if(!(!isNaN(Number(rating)) && numberRegex.test(rating))) {
      return res.status(400).send({status: false, message: 'Rating should be a valid number'})
    }

    if(rating<1) {
      return res.status(400).send({status: false, message: 'Rating must be between 1 to 5'})
    }

    if(rating>5) {
      return res.status(400).send({status: false, message: 'Rating must be between 1 to 5'})
    }

    const newReview = await reviewModel.create({
      bookId,
      rating,
      review,
      reviewedBy,
      reviewedAt: new Date()
    });

    book.reviews = book.reviews + 1
    await book.save()

    const data = book.toObject()
    data['reviewData'] = newReview

    return res.status(201).send({status: true, message: 'Review added successfully', data: data})
  } catch (error) {
    return res.status(500).send({status: false, message: error.message})
  }
}

const updateReview = async function (req, res) {
  try {
    const requestBody = req.body
    const params = req.params
    const bookId = params.bookId
    const reviewId = params.reviewId

    //validation starts
    if(!isValidObjectId(bookId)) {
      return res.status(400).send({status: false, message: `${bookId} is not a valid book id`})
    }

    const book = await bookModel.findOne({_id:bookId, isDeleted: false})

    if(!book) {
      return res.status(404).send({status: false, message: 'Book not found'})
    }

    if(!isValidObjectId(reviewId)) {
      return res.status(400).send({status: false, message: `${reviewId} is not a valid review id`})
    }

    const reviewExists = await reviewModel.findOne({_id: reviewId, bookId: bookId, isDeleted: false})

    if(!reviewExists) {
      return res.status(404).send({status: false, message: 'Book review not found'})
    }
    const data = book.toObject()
    data['reviewsData'] = reviewExists

    if(!isValidRequestBody(requestBody)) {
      return res.status(400).send({status: false, message:'No parameters passed. Review unmodified', data: data})
    }

    //Extract request body fields
    const {review, rating, reviewedBy} = requestBody;

    const updatedReviewData = {}

    if(!isValid(rating)) {
      if(!(!isNaN(Number(rating)) && numberRegex.test(rating))) {
        return res.status(400).send({status: false, message: 'Rating should be a valid number'})
      }

      if(rating<1) {
        return res.status(400).send({status: false, message: 'Rating must be between 1 to 5'})
      }
  
      if(rating>5) {
        return res.status(400).send({status: false, message: 'Rating must be between 1 to 5'})
      }

      if(!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set'))
            updatedReviewData['$set'] = {}
            updatedReviewData['$set']['rating'] = rating
        }

        if (isValid(review)) {
          if (!Object.prototype.hasOwnProperty.call(updatedBookData, '$set'))
               updatedReviewData['$set'] = {}
          updatedReviewData['$set']['review'] = review
        }

        if (isValid(reviewedBy)) {
          if (!Object.prototype.hasOwnProperty.call(updatedReviewData, '$set'))
               updatedReviewData['$set'] = {}
          updatedReviewData['$set']['reviewedBy'] = reviewedBy
        }

          updatedReviewData['$set']['reviewedAt'] = new Date()

        const updatedReiew = await reviewModel.findOneAndUpdate({_id: reviewId}, updatedReviewData, {new: true})

        data['reviewsData'] = updatedReiew

        return res.status(200).send({status: true, message: "Succes", data: data})
  } catch (error) {
    return res.status(500).send({status: false, message: error.message});
  }
}

const deleteReview = async function (req, res) {
  try {
    const params = req.params
    const bookId = params.bookId
    const reviewId = params.reviewId

    if(!isValidObjectId(bookId)) {
      return res.status(400).send({status: false, message: `${bookId} is not a valid book id`})
    }

    if(!isValidObjectId(reviewId)) {
      return res.status(400).send({status: false, message: `${reviewId} is not a valid review id`})
    }

    const book = await bookModel.findOne({_id:bookId, isDeleted: false})

    if(!book) {
      return res.status(404).send({status: false, message: 'Book not found'})
    }

    const review = await reviewModel.findOne({_id:reviewId,bookId: bookId, isDeleted: false})

    if(!review) {
      return res.status(404).send({status: false, message: 'review not found'})
    }

    await reviewModel.findOneAndUpdate({_id: reviewId},{$set: {isDeleted: true, deletedAt: new Date()}})
    book.reviews = book.reviews === 0 ? 0 : book.reviews - 1
    await book.save()   
    
   return res.status(200).send({status: true, message: 'Success'})
  } catch (error) {
    return res.status(500).send({status: false, message: error.message})
  }
}

module.exports = {addReview, updateReview, deleteReview}