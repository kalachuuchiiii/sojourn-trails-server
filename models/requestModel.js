const { Schema, model } = require("mongoose"); 

const requestSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,  
    ref: "user", 
    required: true,
    index: true
  }, 
    sender: {
     type: Schema.Types.ObjectId,  
    ref: "user", 
    required: true,
    index: true
    }, 
    seen: {
      type: Boolean, 
      index: true,
      default: false
    }
}, { timestamps: true })

requestSchema.index({ sender: 1, recipient: 1}, {unique: true})

const Request = model("Request", requestSchema);

module.exports = Request;