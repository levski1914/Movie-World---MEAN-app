const router = require("express").Router();

const Movie = require("../models/movieModel");
const authMiddleware = require("../middleware/authMiddleware");

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
module.exports = router;
