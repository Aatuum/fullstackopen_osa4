const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    unique: true,
  },
  name: String,
  passwordHash: {
    type: String,
    minlength: 3,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog', // Reference to Blog model
    },
  ],
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});
module.exports = mongoose.model('User', userSchema);
