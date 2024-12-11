const axios = require("axios");
const TMDB_API_KEY = "63545e4320371bbc270d3d0d78ddb0b5";

const fetchTMDbMovieDetails = async (tmdbId) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching TMDb movie details:", error);
    throw new Error("Failed to fetch movie details from TMDb");
  }
};

module.exports = { fetchTMDbMovieDetails };
