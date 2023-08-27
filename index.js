const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const formidable = require('formidable');
const multer = require('multer');

//middleware
app.use(cors());
app.use(express.json());


//mongodb connection
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bdsz2a.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
   

     const database = client.db("SEOPage1");
    const attachmentCollection = database.collection("attachments");

app.get('/attachment',async(req, res) => {
  const queryTitle = req.query.title;

  const query = { title: queryTitle };
  const result = await attachmentCollection.find(query).toArray();

  res.send(result);
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public'); 
  },
  filename: function (req, file, cb) {
   return cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.patch('/attachment/:id', upload.array('files'), async (req, res) => {
  try {
    const _id = req.params.id;
    console.log(req.body);
    console.log(req.files);
    const fileNames = req.files.map(file => file.filename);
console.log(fileNames)
    const query = { _id: new ObjectId(_id) };
    const update = { $push: { files: { $each: fileNames } } };

    const result = await attachmentCollection.updateOne(query, update);

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Files uploaded and updated' });
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


//ping
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running');
})
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})