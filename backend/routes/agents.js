const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Create agent
router.post('/create', auth, async (req, res) => {
  try {
    const {firstName, email, phone, password } = req.body;
    if (!firstName || !email || !phone || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await Agent.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Agent email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const agent = await Agent.create({ firstName, email, phone, password: hash });
    res.json({ agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List agents
router.get('/list', auth, async (req, res) => {
  try {
    const agents = await Agent.find({}, '-password');
    res.json({ agents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
