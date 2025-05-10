const { Schema, model } = require("mongoose");

const friendshipSchema = new Schema({
   userOne: {
    type: Schema.Types.ObjectId,  
    ref: "user", 
    required: true,
    index: true
  }, 
    userTwo: {
     type: Schema.Types.ObjectId,  
    ref: "user", 
    required: true,
    index: true
    }, 
}, { timestamps: true })

const Friendship = model("friendship", friendshipSchema);

module.exports = Friendship;