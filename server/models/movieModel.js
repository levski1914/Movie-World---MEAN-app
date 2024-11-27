const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  title: { required: true, type: String },
  desc: { required: true, type: String },
  genre: { required: true, type: String },
  releaseDate: { required: true, type: String },
  image: { required: true, type: String },
  rating: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
