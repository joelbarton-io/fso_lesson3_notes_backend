const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const Note = require("./models/note");

// const password = process.argv[2];
// const url = `mongodb+srv://FSO_barton:${password}@cluster0.ymntqea.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;
// mongoose.set("strictQuery", false);
// mongoose.connect(url);
// const noteSchema = mongoose.Schema({
//   content: String,
//   important: Boolean,
// });

// noteSchema.set("toJSON", {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString();
//     delete returnedObject._id;
//     delete returnedObject.__v;
//   },
// });

// const Note = mongoose.model("Note", noteSchema);

const app = express();
app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :response-time :body"));

app.get("/", (req, res) => res.send("<h1>Notes App</h1>"));

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

app.post("/api/notes", (req, res) => {
  const body = req.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = {
    id: (() => +Math.random().toFixed(6) * 1_000_000)(),
    content: body.content,
    important: body.important,
  };

  notes = notes.concat(note);
  res.status(201).json(note);
});

app.get("/api/notes/:id", (req, res) => {
  const noteID = +req.params.id;
  const note = notes.find(({ id }) => noteID === id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({
      error: "note not found",
    });
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const noteID = +req.params.id;
  notes = notes.filter(({ id }) => id === noteID);
  res.status(204).end();
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
