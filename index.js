const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const Note = require("./models/note");
const note = require("./models/note");

/* non-extracted mongoose setup code
const password = process.argv[2];
const url = `mongodb+srv://FSO_barton:${password}@cluster0.ymntqea.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.set("strictQuery", false);
mongoose.connect(url);
const noteSchema = mongoose.Schema({
  content: String,
  important: Boolean,
});

noteSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Note = mongoose.model("Note", noteSchema);
 */

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

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => {
    console.log("note saved on mongodb cluster");
    res.status(201).json(savedNote);
  });
});

app.get("/api/notes/:id", (req, res) => {
  Note.findById(req.params.id).then((note) => {
    if (note) {
      res.json(note);
    } else {
      res.status(404).json({
        error: "note not found",
      });
    }
  });

  //   const note = notes.find(({ id }) => noteID === id);
  //   if (note) {
  //     res.json(note);
  //   } else {
  //     res.status(404).json({
  //       error: "note not found",
  //     });
  //   }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const something = await Note.findByIdAndDelete(req.params.id);

    res.status(204).end();
  } catch (e) {
    console.log(`oops ${e.message}`);
    res.status(404).json({ error: "note could not be deleted" });
  }
});

// not working, losing key in frontend code??
app.put("/api/notes/:id", async (req, res) => {
  console.log("made it to route");
  console.log(req.body.content, req.body.id, req.body.important);
  //   res.statusMessage = "poop";
  //   res.status(500).end();
  try {
    const noteToUpdate = await Note.findById(req.params.id);
    if (!noteToUpdate) {
      res.statusMessage = "resource could not be found";
      res.status(404).json({
        error:
          "Note could not be updated because it wasn't found on the database",
      });
    }

    noteToUpdate.important = req.body.important;
    noteToUpdate.content = req.body.content;

    noteToUpdate.save().then((savedNote) => {
      console.log("note updated on mongodb cluster");
      res.status(204).json(savedNote);
    });
  } catch (e) {
    console.log(`something failed when attempting to update ${e.message}`);
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
