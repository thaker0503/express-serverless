const express = require("express");
const app = express();
const cors = require("cors");
// const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

// const connect = async () => {
//   await mongoose
//     .connect(process.env.MONGO_URI)
//     //   .then(() => console.log("MongoDB connected..."))
//     .catch((err) => console.log(err));
// };

app.get("/", (req, res) => {
    const { name = "World" } = req.query;
  res.send(`Hello ${name}!`);
});

app.get("/user", async (req, res) => {
  const { prisma } = require("./parisma");

  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

app.post("/user", async (req, res) => {
  const { prisma } = require("./parisma");
  const { name, email } = req.body;
  console.log(name, email);
  const newUser = await prisma.user.create({
    data: { name, email },
  });
  res.json(newUser);
});

// app.listen(3000, () => {
//   console.log("Server started on port 3000");
// });

module.exports = app;
