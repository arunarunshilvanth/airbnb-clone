const Home = require("../models/home");
const User = require("../models/user");

/* ======================================================
   HOME PAGE
====================================================== */
exports.getIndex = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();

    res.render("store/index", {
      registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index"
    });

  } catch (err) {
    next(err);
  }
};


/* ======================================================
   HOMES LIST
====================================================== */
exports.getHomes = async (req, res, next) => {
  try {
    const registeredHomes = await Home.find();

    res.render("store/home-list", {
      registeredHomes,
      pageTitle: "Homes List",
      currentPage: "Home"
    });

  } catch (err) {
    next(err);
  }
};


/* ======================================================
   BOOKINGS PAGE
====================================================== */
exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings"
  });
};


/* ======================================================
   HOME DETAILS
====================================================== */
exports.getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId);

    if (!home) {
      return res.redirect("/homes");
    }

    res.render("store/home-detail", {
      home,
      pageTitle: "Home Detail",
      currentPage: "Home"
    });

  } catch (err) {
    next(err);
  }
};


/* ======================================================
   ADD TO FAVOURITE
====================================================== */
exports.postAddToFavourite = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const homeId = req.body.id;

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.redirect("/login");
    }

    // Force array safety
    const favouritesArray = Array.isArray(user.favourites)
      ? user.favourites
      : [];

    const alreadyAdded = favouritesArray.some(
      fav => fav.toString() === homeId
    );

    if (!alreadyAdded) {
      favouritesArray.push(homeId);
      user.favourites = favouritesArray;
      await user.save();
    }

    res.redirect("/favourite");

  } catch (err) {
    next(err);
  }
};



/* ======================================================
   GET FAVOURITE LIST
====================================================== */
exports.getFavouriteList = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId)
      .populate("favourites");

    // Force array safety
    const favouriteHomes = Array.isArray(user?.favourites)
      ? user.favourites
      : [];

    res.render("store/favourite-list", {
      favouriteHomes,
      pageTitle: "My Favourites",
      currentPage: "favourites"
    });

  } catch (err) {
    next(err);
  }
};



/* ======================================================
   REMOVE FROM FAVOURITE
====================================================== */
exports.postRemoveFromFavourite = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const homeId = req.params.homeId;

    const user = await User.findById(req.session.userId);

    if (!user || !Array.isArray(user.favourites)) {
      return res.redirect("/favourite");
    }

    user.favourites = user.favourites.filter(
      fav => fav.toString() !== homeId
    );

    await user.save();

    res.redirect("/favourite");

  } catch (err) {
    next(err);
  }
};
