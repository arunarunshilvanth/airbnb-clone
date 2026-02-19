// External Module
const express = require("express");
const storeRouter = express.Router();

// Local Module
const storeController = require("../controllers/storeController");

// Home
storeRouter.get("/", storeController.getIndex);
storeRouter.get("/index", storeController.getIndex);

// Homes
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);

// Bookings
storeRouter.get("/bookings", storeController.getBookings);

// ✅ Favourite Routes
storeRouter.get("/favourite", storeController.getFavouriteList);
storeRouter.post("/favourite", storeController.postAddToFavourite);
storeRouter.post("/favourite/delete/:homeId", storeController.postRemoveFromFavourite);

module.exports = storeRouter;
