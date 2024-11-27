const router = require("express").Router();

const userController = require("../controllers/userController");
const movieController = require("../controllers/movieController");

router.use("/auth", userController);
router.use("/movies", movieController);

module.exports = router;
