const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
});

module.exports = mongoose.model("Favourite", favouriteSchema);
