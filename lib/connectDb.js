
const mongoose = require('mongoose'); 
const { log } = console;

const connectDb = async() => {
  try{
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
    log('MongoDB Connected Successfully')
  }catch(e){
    log(`DB donnection failed: ${e.message}`)
  }
}

module.exports = { connectDb };