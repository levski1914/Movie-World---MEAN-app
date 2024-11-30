const router = require("express").Router();
const Favourite = require("../models/favouriteModel");
const Movie = require("../models/movieModel");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/favourites", authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.body;

    const existingFavourites = await Favourite.findOne({
      user: req.user.id,
      movie: movieId,
    });

    if (existingFavourites) {
      return res.status(400).json({ message: "Movie already in favourites" });
    }

    const favourite = new Favourite({
      user: req.user.id,
      movie: movieId,
    });

    await favourite.save();

    return res.status(201).json({ message: "Movie added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding to favourite", err });
  }
});

router.get("/favourites", authMiddleware, async (req, res) => {
  try {
    const favourites = await Favourite.find({ user: req.user.id }).populate(
      "movie"
    );
    res.status(200).json(favourites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favourites.", error });
  }
});

router.delete("/favourites/:id", authMiddleware, async (req, res) => {
  try {
    const favourite = await Favourite.findOneAndDelete({
      user: req.user.id,
      movie: req.params.id,
    });

    if (!favourite) {
      return res.status(404).json({ message: "Favourite not found." });
    }

    res.status(200).json({ message: "Movie removed from favourites!" });
  } catch (error) {
    res.status(500).json({ message: "Error removing favourite.", error });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { title, genre, desc, image, releaseDate } = req.body;

  try {
    const newMovie = new Movie({
      title,
      desc,
      genre,
      releaseDate,
      image,
      createdBy: req.user.id,
    });

    const savedMovie = await newMovie.save();

    return res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: "Error creating movie", error });
  }
});

router.get("/my-movies", authMiddleware, async (req, res) => {
  try {
    const movies = await Movie.find({ createdBy: req.user.id });
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching movie", err });
  }
});

router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies", error });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movies = await Movie.findById(req.params.id);
    if (!movies) {
      res.status(400).json({ message: "Movie not found" });
    }
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching movie", err });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { title, desc, image, genre, releaseDate } = req.body;

  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    if (movie.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this movie." });
    }

    movie.title = title;
    movie.desc = desc;
    movie.genre = genre;
    movie.releaseDate = releaseDate;
    movie.image = image;

    const updatedMovie = await movie.save();
    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: "Error updating movie", error });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    if (movie.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this movie." });
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ message: "Error with delete", error });
  }
});

router.post("/:id/rate", authMiddleware, async (req, res) => {
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      res.status(404).json({ message: "Movie not found" });
    }

    const newTotalRatings = movie.totalRating + 1;
    const newRating =
      (movie.rating * movie.totalRating + rating) / newTotalRatings;

    movie.totalRating = newTotalRatings;
    movie.rating = newRating;

    await movie.save();
    res
      .status(200)
      .json({ message: "rating added successfully", rating: movie.rating });
  } catch (error) {
    res.status(500).json({ message: "error updating rating", error });
  }
});

module.exports = router;
