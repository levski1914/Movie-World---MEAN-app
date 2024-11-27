const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/routes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(routes);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MONGODB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`server is listen on http://localhost:${PORT}`)
);
