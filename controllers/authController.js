const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

/* ===============================
   GET LOGIN
=================================*/
exports.getLogin = (req, res, next) => {

  // 🚫 If already logged in → redirect home
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }

  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    errors: [],
    oldInput: { email: "" }
  });
};


/* ===============================
   GET SIGNUP
=================================*/
exports.getSignup = (req, res, next) => {

  // 🚫 If already logged in → redirect home
  if (req.session.isLoggedIn) {
    return res.redirect("/");
  }

  res.render("auth/signup", {
    pageTitle: "Signup",
    currentPage: "signup",
    errors: [],
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: ""
    }
  });
};


/* ===============================
   POST SIGNUP
=================================*/
exports.postSignup = [

  check("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name should be at least 2 characters long")
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("First Name should contain only alphabets"),

  check("lastName")
    .trim()
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name should contain only alphabets"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password should be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password should contain one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password should contain one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password should contain one number")
    .matches(/[!@&]/)
    .withMessage("Password should contain at least one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type"),

  check("terms")
    .notEmpty()
    .withMessage("Please accept the terms and conditions"),

  async (req, res, next) => {

    const { firstName, lastName, email, password, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        errors: errors.array().map(err => err.msg),
        oldInput: { firstName, lastName, email, userType }
      });
    }

    try {

      // Optional: Prevent duplicate email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(422).render("auth/signup", {
          pageTitle: "Signup",
          currentPage: "signup",
          errors: ["Email already exists"],
          oldInput: { firstName, lastName, email, userType }
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        userType
      });

      await user.save();

      res.redirect("/login");

    } catch (err) {
      next(err);
    }
  }
];


/* ===============================
   POST LOGIN
=================================*/
exports.postLogin = async (req, res, next) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        errors: ["User does not exist"],
        oldInput: { email }
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(422).render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        errors: ["Invalid Password"],
        oldInput: { email }
      });
    }

    // ✅ Store minimal session data (no BSON issues)
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    await req.session.save();

    res.redirect("/");

  } catch (err) {
    next(err);
  }
};


/* ===============================
   POST LOGOUT
=================================*/
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};
