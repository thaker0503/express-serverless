const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

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

app.get("/tasks/:userId", async (req, res) => {
    const { prisma } = require("./parisma");
    const { userId } = req.params;
    const tasks = await prisma.task.findMany({
        where: {
            authorId: userId
        }
    })
    res.json(tasks)
})

app.post("/task", async (req, res) => {
    const { prisma } = require("./parisma");
    const { title, authorId } = req.body;
    try{
        const newTask = await prisma.task.create({
            data: {
                title,
                authorId
            }
        })
        res.status(200).json(newTask)
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err})
    }
})

app.get("/task/:taskId", async (req, res) => {
    const { prisma } = require("./parisma");
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
        where: {
            id: taskId
        }
    })
    res.json(task)
})

app.get("/tasks", async (req, res) => {
    const { prisma } = require("./parisma");
    const tasks = await prisma.task.findMany()
    res.json(tasks)
})


app.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = app;
