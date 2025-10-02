require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const uploadRoutes = require('./routes/upload');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.use('/api/auth', authRoutes);
    app.use('/api/agents', agentRoutes);
    app.use('/api/files', uploadRoutes);

    app.listen(PORT, () => console.log(`Server running on  http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to DB', err);
  });
