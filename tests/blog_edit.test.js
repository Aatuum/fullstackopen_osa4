const { test, after, before } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const assert = require('node:assert');
const app = require('../index'); // your app file
const api = supertest(app);
const Blog = require('../models/blog'); // your Blog model

let blogId;

test('a blog can be added via POST method', async () => {
  const newBlog = {
    title: 'Blog to test likes edit',
    author: 'test for likes',
    url: 'testlikes.com',
    likes: 5,
  };

  // Send POST request to create a new blog
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  blogId = response.body._id;

  assert.strictEqual(response.body.title, newBlog.title);
  assert.strictEqual(response.body.author, newBlog.author);
});

// Test for updating the likes field of a blog
test('a blog can be updated via PUT method', async () => {
  if (!blogId) {
    throw new Error('Blog must be created before testing update');
  }

  const updatedLikes = 20;

  const updateResponse = await api
    .put(`/api/blogs/${blogId}`)
    .send({ likes: updatedLikes })
    .expect(200);

  assert.strictEqual(updateResponse.body.likes, updatedLikes);
  assert.strictEqual(updateResponse.body._id, blogId);
});

after(async () => {
  await mongoose.connection.close();
});
