const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userExtractor = async (request, response, next) => {
  const token = request.token;

  if (!token) {
    return response.status(401).json({ error: 'Enter token' });
  }

  try {
    // Verifoidaan token ja saadaan käyttäjän ID mukana
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token is not valid' });
    }

    // Haetaan käyttäjä tokenin perusteella
    const user = await User.findById(decodedToken.id);
    if (!user) {
      return response.status(401).json({ error: 'Enter real user' });
    }

    // Lisätään user request-olioon
    request.user = user;

    // Siirrytään seuraavaan
    next();
  } catch (error) {
    response.status(401).json({ error: 'Verification failed' });
  }
};

module.exports = userExtractor;
