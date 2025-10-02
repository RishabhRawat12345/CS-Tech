const express = require('express');
const router = express.Router();
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: 'Missing required fields' });

    const existing = await Agent.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Agent already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const agent = await Agent.create({
      firstName,
      lastName,
      email,
      phone,
      password: hash
    });

    return res.status(201).json({
      message: 'Agent registered successfully',
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone || null
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const agent = await Agent.findOne({ email });
    if (!agent) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, agent.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: agent._id, email: agent.email, role: 'agent' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone || null,
        role: 'agent'
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
