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

router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const averageRating =
      movie.ratings.reduce((sum, r) => sum + r.rating, 0) /
      (movie.ratings.length || 1);

    res.status(200).json({
      movie,
      averageRating: averageRating || 0,
      totalRatings: movie.ratings.length || 0,
      ratings: movie.ratings || [],
    });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    res.status(500).json({ message: "Error fetching movie details", error });
  }
});
router.post("/:id/rate", async (req, res) => {
  const { rating, userId, guestId } = req.body;

  console.log("Received data:", { userId, guestId, rating });

  if (!rating || (!userId && !guestId)) {
    return res
      .status(400)
      .json({ message: "Rating, User ID, or Guest ID is required." });
  }

  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const existingRating = movie.ratings.find(
      (r) => r.userId?.toString() === userId || r.guestId === guestId
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      movie.ratings.push({ userId, guestId, rating });
    }

    movie.rating =
      movie.ratings.reduce((sum, r) => sum + r.rating, 0) /
      movie.ratings.length;

    await movie.save();

    res.status(200).json({
      message: "Rating updated successfully",
      averageRating: movie.rating,
      totalRatings: movie.ratings.length,
    });
  } catch (error) {
    console.error("Error updating rating:", error);
    res.status(500).json({ message: "Error updating rating", error });
  }
});
router.get("/genre/:genre", async (req, res) => {
  try {
    const genre = req.params.genre;
    const movies = await Movie.find({ genre: genre });
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies by genre", error });
  }
});
module.exports = router;
