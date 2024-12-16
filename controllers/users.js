const express = require('express');
const User = require('../models/user');
const usersRouter = express.Router();
const bcrypt = require('bcrypt'); // Import bcrypt

usersRouter.get('/', async (request, response) => {
  try {
    const users = await User.find({}).populate('blogs', {
      title: 1,
      url: 1,
      likes: 1,
    }); // Specify which fields from blogs you want to include
    response.json(users);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error retrieving users' });
  }
});

// Method to create a new user
usersRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body;

  if (!username || !password || !name) {
    return response.status(400).json({ error: 'All fields are needed' });
  }

  // Validate username length
  if (username.length < 3) {
    return response
      .status(400)
      .json({ error: 'Username must be 3 characters long' });
  }

  // Validate password length
  if (password.length < 3) {
    return response
      .status(400)
      .json({ error: 'Password must be 3 characters long' });
  }
  try {
    // Checks that the username is not already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return response
        .status(400)
        .json({ error: 'Username is already taken enter new one' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Create a new user object
    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    // Dont show password in the response
    response.status(201).json({
      username: savedUser.username,
      name: savedUser.name,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error' });
  }
});

module.exports = usersRouter;
