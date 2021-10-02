//// express allow your application to easier looking synt ax//
const dotenv = require("dotenv");
const express = require("express");
require("./db/conn");

const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

dotenv.config({ path: "./config.env" });
app.use(express.json());
app.use(require("./router/auth"));

//////// hello world from ///
app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(1337, () => {
  console.log("server started on 1337");
});
