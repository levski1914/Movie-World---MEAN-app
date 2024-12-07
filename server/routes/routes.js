const router = require("express").Router();

const userController = require("../controllers/userController");
const movieController = require("../controllers/movieController");
const proxyRoutes = require("../proxyRoutes");

router.use("/auth", userController);
router.use("/movies", movieController);
router.use("/api", proxyRoutes);

module.exports = router;
