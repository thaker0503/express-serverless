const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  const { name = "World" } = req.query;
  res.send(`Hello ${name}!`);
});

app.get("/user", async (req, res) => {
  const { prisma } = require("./prismaClient");

  const allUsers = await prisma.user.findMany();
  res.json(allUsers);
});

app.post("/user", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { name, email } = req.body;
  console.log(name, email);
  const newUser = await prisma.user.create({
    data: { name, email },
  });
  res.json(newUser);
});

app.get("/tasks/:userId", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { userId } = req.params;
  const tasks = await prisma.task.findMany({
    where: {
      authorId: userId,
    },
  });
  res.json(tasks);
});

app.post("/task", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { title, authorId } = req.body;
  if (!title ) {
    return res.status(400).json({ error: "Please provide title of the task" });
  } else if (!authorId) {
    return res.status(400).json({ error: "Please provide authorId" });
  }
  try {
    const newTask = await prisma.task.create({
      include: { author: true },
      data: {
        title,
        authorId,
      },
    });
    res.status(200).json(newTask);
  } catch (err) {
    console.log("][][][][][][]", err);
    res.status(500).json({ error: err });
  }
});

app.get("/task/:taskId", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { taskId } = req.params;
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });
  res.json(task);
});

app.get("/tasks", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { take, skip } = req.query;
  const count = await prisma.task.count();
  if (Number(skip) >= count) {
    return res.status(400).json({
      error: "Skip value is greater than or equal to the total tasks",
    });
  }
  if (Number(take) > 100) {
    return res.status(400).json({ error: "Take value is greater than 100" });
  }
  const tasks = await prisma.task.findMany({
    include: { author: true },
    take: Number(take) || undefined,
    skip: Number(skip) || undefined,
  });
  res.json({ tasks, total: count });
});

app.put("/task/:taskId", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { taskId } = req.params;
  const { title } = req.body;
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title,
    },
  });
  res.json(updatedTask);
});

app.delete("/task/:taskId", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { taskId } = req.params;
  const deletedTask = await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
  res.json(deletedTask);
});

app.post("/signup", async (req, res) => {
  const { prisma } = require("./prismaClient");
  const { name, email, password } = req.body;
  if(!email) {
    return res.status(400).json({ error: "Please provide email field." });
  }
  const oldUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (oldUser) {
    return res.status(400).json({ error: "User already exists" });
  } 
  if (!name || !password) {
    return res.status(400).json({ error: `Please provide ${!name ? 'name' : 'password'} filed.` });
  }
  await bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
        },
      });
      res.json(newUser);
    }
  });
});

app.use("/*", (req, res) => {
  res.status(404).json({ error: "Route Not found" });
});
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = app;
