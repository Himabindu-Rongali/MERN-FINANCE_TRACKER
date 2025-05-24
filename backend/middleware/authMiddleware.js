const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if token is in the correct format (Bearer <token>)
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token is not valid, authorization denied' });
  }

  const token = parts[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); // Use the same secret as in auth.js
    req.user = decoded.user; // Add user from payload
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid, authorization denied' });
  }
};
