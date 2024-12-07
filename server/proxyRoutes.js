const axios = require("axios");
const router = require("express").Router();

const TMDB_API_KEY = "63545e4320371bbc270d3d0d78ddb0b5";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

router.get("/proxy/trending", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    if (response.headers["content-type"].includes("application/json")) {
      res.json(response.data);
    } else {
      res.status(500).json({ message: "Invalid response from TMDb API" });
    }
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    res.status(500).json({ message: "Error fetching trending movies", error });
  }
});

module.exports = router;
