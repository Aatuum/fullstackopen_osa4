const express = require('express');
const Blog = require('../models/blog');
const User = require('../models/user');
const blogsRouter = express.Router();
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
  // Muuta /api/blogs -> /
  try {
    const blogs = await Blog.find({}).populate('user', {
      username: 1,
      name: 1,
    });
    response.json(blogs);
  } catch (error) {
    response.status(500).send({ error: 'Something went wrong' });
  }
});

// POST-pyyntö uuden blogin lisäämiselle
blogsRouter.post('/', async (request, response) => {
  const { title, url, likes } = request.body;

  const user = request.user; // Haetaan käyttäjä request-olion user-kentästä

  const blog = new Blog({
    title,
    url,
    likes: likes || 0,
    user: user._id, // Linkitetään blogi tiettyyn käyttäjään
  });

  try {
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    response.status(201).json(savedBlog);
  } catch (error) {
    response.status(400).json({ error: 'Error' });
  }
});

// DELETE METHOD
blogsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  // Haetaan blogi tietokannasta
  const blog = await Blog.findById(id);
  if (!blog) {
    return response.status(404).json({ error: 'Blog not found' });
  }

  const user = request.user; // Haetaan käyttäjä request-olion user-kentästä

  // Tarkistetaan, että käyttäjä on blogin omistaja
  if (blog.user.toString() !== user._id.toString()) {
    return response.status(403).json({ error: 'You are not the blog owner' });
  }

  // Poistetaan blogi, jos käyttäjä on oikea omistaja
  await Blog.findByIdAndDelete(id);

  response.status(200).json({ message: 'Blog deleted successfully' });
});

// PUT METHOD
blogsRouter.put('/:id', async (request, response) => {
  const { id } = request.params;
  const { likes } = request.body;

  if (likes === undefined) {
    return response.status(400).json({ error: 'Provide a value for likes' });
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      // Only update the likes field
      { likes },
      // Return the updated blog as response
      { new: true }
    );
    if (!updatedBlog) {
      return response.status(404).json({ error: 'Not found' });
    }
    // Send back the updated blog
    response.status(200).json(updatedBlog);
  } catch (error) {
    response.status(400).json({ error: 'Invalid ID or operation failed' });
  }
});
module.exports = blogsRouter;
