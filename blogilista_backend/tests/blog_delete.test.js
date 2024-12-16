const { test, after, before } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const assert = require('node:assert');
const app = require('../index');
const api = supertest(app);
const Blog = require('../models/blog');

let blogId;

// Test for adding a blog
test('a blog can be added via POST method', async () => {
  const newBlog = {
    title: 'Toimii deletointi',
    author: 'Test Deletointi',
    url: 'http://testdelete.com',
    likes: 10,
  };

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  blogId = response.body._id;

  assert.strictEqual(response.body.title, newBlog.title);
  assert.strictEqual(response.body.author, newBlog.author);
});

test('a blog can be deleted', async () => {
  if (!blogId) {
    throw new Error(' Blog must be added first');
  }

  const deleteResponse = await api.delete(`/api/blogs/${blogId}`).expect(200);

  assert.strictEqual(deleteResponse.body.message, 'Blog deleted successfully');

  const deletedBlog = await Blog.findById(blogId);
  assert.strictEqual(
    deletedBlog,
    null,
    'blog should be deleted from the database'
  );
});

after(async () => {
  await mongoose.connection.close();
});
