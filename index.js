const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/Routes");
const authRouter = require("./routes/authRouter");
require("dotenv").config();
const cors = require("cors");
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(authRouter);
    app.use(routes);
    app.listen(process.env.PORT, () => {
      console.log(
        "Express is up and running...listening on port 3000  - MongoDB connected"
      );
    });
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));
