const Home = require("../models/home");
const fs =require('fs');

exports.getAddHome = (req, res, next) => {
  res.render('host/edit-home', {
    pageTitle: 'Add Home to airbnb',
    currentPage: 'addHome',
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user
  });
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === 'true';

  Home.findById(homeId)
    .then(home => {
      if (!home) {
        console.log("Home not Found for editing");
        return res.redirect("/host/host-home-list");
      }

      res.render('host/edit-home', {
        home: home,
        pageTitle: 'Edit your Home',
        currentPage: 'host-homes',
        editing: editing,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    });
};

exports.getHostHomes = (req, res, next) => {
  Home.find()
    .then(registeredHomes => {
      res.render('host/host-home-list', {
        registeredHomes,
        pageTitle: 'Host Home',
        currentPage: 'host-homes',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    });
};

exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  console.log(houseName, price, location, rating, description);
  console.log(req.file);


  if(!req.file){
    return res.status(422).send("No image Provided");
  }

  const photo =req.file.path;

  const home = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description
  });

  home.save()
    .then(() => {
      console.log("Home saved Successfully..");
      res.redirect('/host/host-home-list');
    })
    .catch(err => {
      console.log("Error while saving home", err);
    });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, price, location, rating, description } = req.body;
  

  Home.findById(id)
    .then(home => {
      home.houseName = houseName;
      home.location = location;
      home.price = price;
      home.rating = rating;
      //home.photo = photo;
      home.description = description;

      if(req.file){
        fs.unlink(home.photo,(err)=>{
          if(err){
            console.log("Error while deleting file",err);
          } 
        });
         home.photo =req.file.path;
        
      }



      return home.save();
    })
    .then(result => {
      console.log('Home Updated', result);
      res.redirect('/host/host-home-list');
    })
    .catch(err => {
      console.log("Error while Updating.", err);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;

  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect('/host/host-home-list');
    })
    .catch(err => {
      console.log('Error While deleting', err);
    });
};
