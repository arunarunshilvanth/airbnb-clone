// --- Core Modules ---
const path = require("path");

// --- External Modules ---
const express = require("express");
const session = require("express-session");
const multer =require('multer');
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

// --- Local Modules ---
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const errorsController = require("./controllers/errors");
const rootDir = require("./utils/pathUtil");
const User = require("./models/user");

// --- Configuration ---
const app = express();
const PORT = 3000;
const DB_PATH = "mongodb://127.0.0.1:27017/airbnb";

// --- Session Store Setup ---
const store = new MongoDBStore({
  uri: DB_PATH,
  collection: "sessions"
});

store.on("error", function (error) {
  console.log("Session Store Error:", error.message);
});

// --- View Engine ---
app.set("view engine", "ejs");
app.set("views", "views");

const randomString =(length) =>{
  const characters='abcdefghijklmnopqrstuvwxyz';
  let result ='';
  for(let i =0; i<length;i++){
    result +=characters.charAt(Math.floor(Math.random()*characters.length));
  }
  return result;
}

const storage =multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"uploads/")
  },
  filename:(req,file,cb)=>{
    cb(null, randomString(10) +'_'+file.originalname);
  }
});

const fileFilter =(req,file,cb)=>{
  if(file.mimetype==='image/png' || file.mimetype == 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

const multerOptions={
  storage,fileFilter
};

// --- Body Parser & Static ---
app.use(express.urlencoded({ extended: true }));

app.use(multer(multerOptions).single('photo'));
app.use(express.static(path.join(rootDir, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Session Middleware ---
app.use(
  session({
    secret: "arun",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

/* =========================================================
   GLOBAL USER & LOGIN HANDLING (SAFE VERSION)
========================================================= */

app.use(async (req, res, next) => {
  // Always define these so EJS never crashes
  res.locals.isLoggedIn = false;
  res.locals.user = null;

  if (!req.session.userId) {
    return next();
  }

  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return next();
    }

    req.user = user;
    res.locals.user = user;
    res.locals.isLoggedIn = true;

    next();
  } catch (err) {
    next(err);
  }
});

/* =========================================================
   ROUTES
========================================================= */

app.use(authRouter);
app.use(storeRouter);

// Protect host routes
app.use("/host", (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
});

app.use("/host", hostRouter);

// 404 Handler
app.use(errorsController.pageNotFound);

/* =========================================================
   DATABASE CONNECTION
========================================================= */

mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });
