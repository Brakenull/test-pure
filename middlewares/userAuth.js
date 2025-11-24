const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, callback) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer '))
  {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: 'User not signed in' }));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) throw new Error();

    req.user = decoded;
    callback();
  } catch {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: 'Invalid admin token' }));
  }
};