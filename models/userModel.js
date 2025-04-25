const mongoose = require('mongoose'); 
const validator = require('validator'); 
const bcrypt = require('bcryptjs'); 

const userSchema = new mongoose.Schema({
  nickname: {
    type: String, 
    default: null, 
    index: true, 
  },
  username: {
    type: String, 
    required: true, 
    index: true, 
    trim: true,
    unique: true
  }, 
  password: {
    type: String, 
    required: true, 
    trim: true
  }, 
  email: {
    type: String,
    required: true, 
    index: true, 
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address']
  }
}, {
  timestamps: true
})

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
}

userSchema.pre('save', async function(next){
  try{
    if(this.isModified('password')){
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt); 
    next();
  }
  }catch(e){
    next(new Error('Error hashing the password'))
  }
})

const User = mongoose.model('User', userSchema);

module.exports = User;
