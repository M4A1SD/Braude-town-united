// import { Resend } from 'resend';
const { Resend } = require('resend');
const express = require('express');
// npm install express
const cors = require('cors');
const app = express();
app.use(cors({
  origin: ['https://braude-town-united.onrender.com', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
})); 
app.use(express.json());
require('dotenv').config();
// npm install dotenv
// npm init -y
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------------------------
// Deployment
const path = require('path');
console.log("local mode")
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));


// ------------------------------------------------------------------------------
// GOOGLE AUTH
const { OAuth2Client } = require('google-auth-library');
// npm install google-auth-library

console.log(process.env.GOOGLE_CLIENT_ID)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token
async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

// Login endpoint
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  
  const payload = await verifyGoogleToken(credential);
  if (!payload) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  // Here you would typically:
  // 1. Check if user exists in your database
  // 2. Create user if they don't exist
  // 3. Create a session or JWT token
  // 4. Return user data and/or token

  res.json({
    user: {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    }
  });
});

// ------------------------------------------------------------------------------
// CHAT IMPORTS
const StreamChat = require("stream-chat").StreamChat;
// npm install stream-chat

const clientChat = StreamChat.getInstance(
  process.env.API_KEY,
  process.env.API_KEY_SECRET
);

clientChat.updateAppSettings({
  webhook_url: "https://braude-town-united.onrender.com/stream-event",
});


clientChat.updateAppSettings({ reminders_interval: 86400 }); //86400 is 24 hours. i dont wanna spam the users

//this is important, but only needed once.
clientChat.updateChannelType("messaging", {
  reminders: true,
  read_events: true,
});



app.get("/", (req, res) => {
  console.log("GET request received at /");
  res.send("Server is running");
});

app.get("/user-token", async (req, res) => {
  const email = req.query.email;
  // const userId = req.query.userId; no need for this
  console.log("getting token");
  
  //need data base to keep track of IDS, for now just use email up until @
  // const userId = email.split("@")[0];
  try {
    const user = await clientChat.upsertUser({
      name: "",
      id: email,
      

    });
    console.log("upserted user:", email);
    //create token takes the user id string
    const token = clientChat.createToken(email);
    console.log("token:", token);
    res.json(token);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to upsert user" });
  }
});

app.get("/key", (req, res) => {
  res.json(process.env.API_KEY);
});






// ------------------------------------------------------------------------------
// Mail imports
const formData = require("form-data");
const Mailgun = require("mailgun.js");
// npm install mailgun.js
const mailgun = new Mailgun(formData);


// npm install resend


const resend = new Resend(process.env.RESEND_API_KEY);



const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});


app.post("/stream-event", async (request, response) => {
  console.log("POST request received at /stream-event");

  // Check if it's a new message event
  if (request.body.type !== "message.new") {
    console.log("Not a new message event - skipping email");
    return response.status(200).json({ message: "not a new message" });
  }
 
  const receiverEmail = request.body.members[0].user_id + "@gmail.com";
  console.log("receiverEmail:", receiverEmail);
  const newMessage = request.body.message.text;
  console.log("messsage recieved:", newMessage);

  try {
    // Send email using Resend
    // await resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: receiverEmail,
    //   subject: 'New message alert!',
    //   html: `<h1>You have a new message: "${newMessage}"</h1>`
    // });
    console.log("dont send resend mail yet");
    // Send email using Mailgun
    await mg.messages.create(
      "sandbox7435613884b0432d893fd5c676e55329.mailgun.org",
      {
        from: "Braude-Town: New message alert! <mailgun@sandbox7435613884b0432d893fd5c676e55329.mailgun.org>",
        to: [receiverEmail],
        subject: "New message alert!",
        text: `You have a new message: "${newMessage}"`,
        html: `<h1>You have a new message: "${newMessage}"</h1>`,
      }
    );

    console.log("Emails sent successfully");
    return response.status(200).json({ message: "Emails sent successfully" });

  } catch (error) {
    console.error("Error sending email:", error);
    return response.status(500).json({ error: "Failed to send email" });
  }
});









// ------------------------------------------------------------------------------
// DB
const { MongoClient } = require('mongodb');



// Replace the incorrect 'use' line with proper MongoDB connection
const dbUser = process.env.MONGO_USER;
const dbPassword = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${dbUser}:${dbPassword}@braudetowndb.ixdq1.mongodb.net/`;

const clientDB = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await clientDB.connect();
    db = clientDB.db('mongodbVSCodePlaygroundDB');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log("MONGO NOT CONNECTED");
    console.error('MongoDB connection error:', error);
  }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});


//get user ID by email
app.get('/api/findUser', async (request,response)=>{
  try {
    const userInfo = request.query.email;
    if (!userInfo) {
      return response.status(400).json({ message: "Email is required", success: false });
    }
    
    const user = await db.collection('users').findOne({ email: userInfo });
    if (user) {
      response.json({ message: "Exists", success: true, user: user });
    } else {
      response.status(404).json({ message: "Doesn't exist", success: false });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    response.status(500).json({ message: "Server error", success: false });
  }
})

//create entry mail:ID
// make sure no duplicate entries created
app.post('/api/createUser', async (request,response)=>{
  const {email, plateNumber} = request.body
  const result = await insertData({email, plateNumber})
  console.log("creating new user: ", email, id, result)
  if(result.failed){
    response.json({message: "User creation failed", result: result, success: false})
  }else{
    response.json({message: "User created", result: result, success: true})
  }
})

//get user mail by ID
app.get('/api/getUserByPlateNumber', async (request,response)=>{
  console.log("Getting user by ID", request.query)
  const {plateNumber} = request.query
  const user = await db.collection('users').findOne({plateNumber: plateNumber})
  if(user){
    response.json({message: "User found", success: true, user: user})
  }else{
    response.json({message: "User not found", success: false})
  }
})




async function  insertData(data) {
  try {
    const collection = db.collection('users');
    console.log(data);
    const result = await collection.insertOne(data);
    console.log("Insertion result: ", result);
    return result;
  } catch (error) {
    if (error.code === 11000) {
      console.log("Error: Email already exists");
    }
    console.log("Data insertion failed");
    console.log(error);
    return {failed: true, error: error};
  }
}

async function deleteData(email) {
  const collection = db.collection('users');
  const delResult = await collection.deleteOne({email: email});
  console.log("Deleted: ", delResult);
}

async function printData() {
  const collection = db.collection('users');
  const data = await collection.find({}).toArray();
  console.log("Current database contents:");
  console.log(data);
  return data;
}




//testing functions
async function main() {
  await connectToMongo();
  
  await printData();
  
//   await insertData({
//     email: `example${i}@gmail.com`,
//     id: `611451${i}`
//   });
  
//   await printData();
  
//   await deleteData(`example${i}@gmail.com`);
//   await printData();
//   await clientDB.close();
}





// ------------------------------------------------------------------------------
// START

// ensure DB connects before listening
async function startServer() {
  try {
    await connectToMongo();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

//  must be at the end of the file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

startServer();
