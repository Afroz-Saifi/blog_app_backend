const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { connection } = require("./config/db");
const { router } = require("./routes/routes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", router);

app.listen(process.env.port, async () => {
  console.log(`server running on port ${process.env.port}`);
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
});
