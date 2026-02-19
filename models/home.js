
const mongoose =require('mongoose');
//const favourite = require('./favourite');

const homeSchema=mongoose.Schema({
  houseName:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  location:{
    type:String,
    required:true
  },
  rating:{
    type:Number,
    required:true
  },
  photo:String,
  description:String,
})

/**
 * 
    
       save()
       static find() 
       static findById(homeId)
       static deleteById(homeId) 
 */


// homeSchema.pre('findOneAndDelete', async function () {
//   console.log("Came to pre hook while deleting  a home");
//   const homeId = this.getQuery()._id;
//   await favourite.deleteMany({ houseId: homeId });
  
// });


module.exports =mongoose.model('Home',homeSchema);