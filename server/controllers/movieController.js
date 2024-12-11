const router = require("express").Router();
const Favourite = require("../models/favouriteModel");
const Movie = require("../models/movieModel");
const authMiddleware = require("../middleware/authMiddleware");
// const mongoose = require("mongoose");
const { fetchTMDbMovieDetails } = require("./tmdbController");

router.post("/favourites", authMiddleware, async (req, res) => {
  const { movieId } = req.body;

  const existingFavourite = await Favourite.findOne({
    user: req.user.id,
    movie: movieId,
  });

  if (existingFavourite) {
    return res.status(400).json({ message: "Movie already in favourites" });
  }

  // Добавете към любими само ако не съществува
  const favourite = new Favourite({
    user: req.user.id,
    movie: movieId,
  });

  await favourite.save();
  res.status(201).json({ message: "Movie added to favourites successfully" });
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
    const movieId = req.params.id.startsWith("tmdb-")
      ? req.params.id.replace("tmdb-", "")
      : req.params.id;

    const favourite = await Favourite.findOneAndDelete({
      user: req.user.id,
      movie: movieId,
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
  try {
    const { tmdbId } = req.body;

    if (!tmdbId) {
      return res.status(400).json({ message: "TMDb ID is required" });
    }

    let movieRecord = await Movie.findOne({ tmdbId });
    if (!movieRecord) {
      const tmdbData = await fetchTMDbMovieDetails(tmdbId);
      if (!tmdbData || !tmdbData.title || !tmdbData.poster_path) {
        return res.status(500).json({ message: "Invalid TMDb data" });
      }

      const genres = tmdbData.genres.map((g) => g.name).join(", ");

      movieRecord = new Movie({
        title: tmdbData.title,
        desc: tmdbData.overview || "No description available",
        genre: genres || "Unknown",
        releaseDate: tmdbData.release_date || "Unknown",
        image: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`,
        rating: tmdbData.vote_average || 0,
        tmdbId: tmdbId,
        createdBy: req.user.id,
      });

      await movieRecord.save();
    }

    res.status(201).json(movieRecord);
  } catch (error) {
    console.error("Error creating movie from TMDb:", error);
    res
      .status(500)
      .json({ message: "Failed to create movie from TMDb", error });
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
  const { source } = req.query;

  try {
    let movies;
    if (source === "database") {
      movies = await Movie.find({ tmdbId: { $exists: false } }); // Само локални филми
    } else {
      movies = await Movie.find();
    }

    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Error fetching movies" });
  }
});
router.get("/movies", async (req, res) => {
  const genre = req.query.genre;

  try {
    let movies = await Movie.find(); // Извлича всички филми

    if (genre) {
      // Филтрира филмите според жанра
      movies = movies.filter((movie) =>
        movie.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    res.json(movies);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch movies" });
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

router.post("/:id/rate", authMiddleware, async (req, res) => {
  const { rating, userId, guestId } = req.body;
  const movieId = req.params.id;

  if (!movieId || movieId === "undefined") {
    return res.status(400).json({ message: "Movie ID is required." });
  }

  if (!rating || (!userId && !guestId)) {
    return res
      .status(400)
      .json({ message: "Rating, User ID, or Guest ID is required." });
  }

  try {
    let movie;

    // Проверка за TMDb филм
    if (movieId.startsWith("tmdb-")) {
      const tmdbId = movieId.replace("tmdb-", "");

      // Опитваме се да намерим филма в базата
      movie = await Movie.findOne({ tmdbId });

      if (!movie) {
        // Ако филмът не съществува, извличаме данни от TMDb API
        const response = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
          params: { api_key: TMDB_API_KEY },
        });

        const tmdbData = response.data;

        // Създаваме нов запис за филма в базата
        movie = new Movie({
          title: tmdbData.title,
          desc: tmdbData.overview || "No description available",
          genre: tmdbData.genres.map((g) => g.name).join(", ") || "Unknown",
          releaseDate: tmdbData.release_date || "Unknown",
          image: `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`,
          tmdbId: tmdbId,
          createdBy: null,
        });

        await movie.save();
      }
    } else {
      // За локални филми директно намираме по ID
      movie = await Movie.findById(movieId);
    }

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Добавяне или актуализация на рейтинга
    const existingRating = movie.ratings.find(
      (r) => r.userId?.toString() === userId || r.guestId === guestId
    );

    if (existingRating) {
      existingRating.rating = rating; // Актуализация
    } else {
      movie.ratings.push({ userId, guestId, rating }); // Нов рейтинг
    }

    // Актуализиране на средния рейтинг
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
