const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    bookId: { type: mongoose.Types.ObjectId, ref: 'Book', required: true},
    reviewedBy: {
        type: String,
        required: true,
        default: 'Guest',
        trim: true
    },
    reviewedAt: {
        type: Date,
        required: true,
        format: "YYYY-MM-DD",
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: String, 
    deletedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema)