const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const Note = require("./models/note");

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
app.use(express.json());
app.use(cors());
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(morgan(":method :url :status :response-time :body"));
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

app.get("/", (req, res) => res.send("<h1>Notes App</h1>"));

app.get("/api/notes", async (req, res, next) => {
  try {
    const notes = await Note.find({});
    res.json(notes);
  } catch (e) {
    next(e);
  }
});

app.post("/api/notes", async (req, res, next) => {
  try {
    const note = new Note({
      content: req.body.content,
      important: req.body.important,
    });

    const savedNote = await note.save();
    // console.log("from route handler: ", savedNote);
    res.status(201).json(savedNote); // had wrong status code!!
  } catch (e) {
    next(e);
  }
});

app.get("/api/notes/:id", async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      return res.json(note);
    }
    // what about here though? another response?
  } catch (e) {
    next(e);
  }
});

app.delete("/api/notes/:id", async (req, res, next) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// was not working previously, losing key in frontend code??
app.put("/api/notes/:id", async (req, res, next) => {
  try {
    const note = {
      content: req.body.content,
      important: req.body.important,
    };

    const updated = await Note.findByIdAndUpdate(req.params.id, note, {
      new: true,
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
