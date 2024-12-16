const jwt = require('jsonwebtoken');

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.replace('Bearer ', '');
    request.token = token; // Asetetaan token requestiin
  } else {
    request.token = null;
  }
  next(); // Siirrytään seuraavaan
};

module.exports = tokenExtractor;
