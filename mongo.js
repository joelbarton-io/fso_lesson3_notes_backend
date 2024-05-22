const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}
console.log(process.argv[3]);
const password = process.argv[2];
const url = `mongodb+srv://FSO_barton:${password}@cluster0.ymntqea.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

// Note.find({}).then((res) => {
//   res.forEach((note) => console.log(note));
//   mongoose.connection.close();
// });
let notes = [
  {
    content: "HTML is easy",
    important: true,
  },
  {
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];
Note.insertMany(notes).then((res) => {
  console.log(res);
  console.log(`added ${notes.length} notes to the notes database`);
  mongoose.connection.close();
});

// const note = new Note({
//   content: "HTML is easy",
//   important: true,
// });

// note.save().then((result) => {
//   console.log("note saved!");
//   mongoose.connection.close();
// });
