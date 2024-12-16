const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const tokenExtractor = require('./middleware/tokenExtractor');
const userExtractor = require('./middleware/userExtractor');

const mongoUrl = process.env.MONGODB_URI;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const app = express();

app.use(cors());
app.use(express.json());

// Middlewaret
app.use(tokenExtractor);

app.use('/api/blogs', userExtractor, blogsRouter);

app.use('/api/login', loginRouter);

app.use('/api/users', usersRouter);

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
