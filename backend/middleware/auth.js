const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Agent = require('../models/Agent');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser;
    if (decoded.role === 'user') currentUser = await User.findById(decoded.id);
    if (decoded.role === 'agent') currentUser = await Agent.findById(decoded.id);

    if (!currentUser) return res.status(401).json({ message: 'User not found' });

    req.user = currentUser; // attach the logged-in user/agent
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
