const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  guestId: { type: String, required: false },
  rating: { type: Number, required: true },
});

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  genre: { type: String, required: true },
  releaseDate: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  ratings: [RatingSchema],
  tmdbId: { type: String, unique: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

module.exports = mongoose.model("Movie", MovieSchema);
