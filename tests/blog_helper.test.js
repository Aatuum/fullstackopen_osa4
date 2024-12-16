const { test, after, before } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const assert = require('node:assert');
const app = require('../index');
const api = supertest(app);
const Blog = require('../models/blog');

test('blogs are returned as json and correct amount', async () => {
  // Tee GET-pyyntö ja tallenna vastaus muuttujaan
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
  //Tulostetaan haettu data
  console.log('Fetched blogs:', response.body);

  // Käytä assert:ia tarkistamaan blogien määrä
  assert.strictEqual(response.body.length, 2);
});

// Katsotaan että on id-kenttä
test('returned blogs should have id field', async () => {
  const response = await api.get('/api/blogs').expect(200);

  // Tulostetaan kaikki _id kentät konsoliin
  console.log(
    'Fetched blog _id:',
    response.body.map((blog) => blog._id)
  );
  // Tarkistetaan että jokaisella blogilla on oma id-kenttä
  response.body.forEach((blog) => {
    assert.ok(blog._id, 'Blog must have an id field'); // Tarkistetaan, että _id on olemassa
  });
});

test('a blog can be added via POST method', async () => {
  const newBlog = {
    title: 'testi_title',
    author: 'testi_author',
    url: 'testi_url',
    likes: 2,
  };

  // Tehdään POST-pyyntö
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201) // Varmistetaan että statuskoodi on 201 ja onnistui
    .expect('Content-Type', /application\/json/); // Varmistetaan että palautettu sisältö on JSON muodossa

  // Tarkistetaan että blogien määrä kasvaa yhdellä
  const response = await api.get('/api/blogs');

  // Tarkistetaan että lisätty blogi on oikeansisältöinen
  const addedBlog = response.body.map((blog) => blog.title);
  assert(addedBlog.includes('testi_title'));
});

// Testi blogin lisäämiselle ilman likes-kenttää
test('if likes is not provided, it is set to 0', async () => {
  const newBlog = {
    title: 'New Blog Without Likes',
    author: 'Author without likes',
    url: 'url without likes',
    // likes-kenttä jätetään tässä pois
  };

  // Tehdään POST-pyyntö
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201) // Varmistetaan, että statuskoodi on 201
    .expect('Content-Type', /application\/json/); // Varmistetaan, että palautettu sisältö on JSON

  assert.strictEqual(response.body.likes, 0);
});

// Testi, joka varmistaa, että title-kentän puuttuessa palautuu 400 Bad Request
test('adding a blog without title returns 400 Bad Request', async () => {
  const newBlog = {
    author: 'Author without Title',
    url: 'Url without Title',
    // title-kenttä jätetään pois
  };

  await api.post('/api/blogs').send(newBlog).expect(400); // Varmistetaan, että statuskoodi on 400
});

// Testi, joka varmistaa, että url-kentän puuttuessa palautuu 400 Bad Request
test('adding a blog without url returns 400 Bad Request', async () => {
  const newBlog = {
    title: 'Blog without URL',
    author: 'Author without URL',
    // url-kenttä jätetään pois
  };

  await api.post('/api/blogs').send(newBlog).expect(400); // Varmistetaan, että statuskoodi on 400
});

after(async () => {
  // Suljetaan MongoDB-yhteys testien jälkeen
  await mongoose.connection.close();
});
