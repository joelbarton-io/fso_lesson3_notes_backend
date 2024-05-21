const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :response-time :body"));
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port 3001");
});

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (req, res) => res.send("backend is running"));
app.get("/api/notes", (req, res) => res.send(JSON.stringify(notes)));

app.post("/api/notes", (req, res) => {
  const { content, important } = req.body;
  const id = (() => +Math.random().toFixed(6) * 1_000_000)();
  const newNote = {
    id,
    content,
    important,
  };

  notes = notes.concat(newNote);
  res.status(201).json(newNote);
});
