const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas Connected'))
  .catch(err => console.log(err));

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/posts', require('./src/routes/postRoutes'));
app.use('/api/applications', require('./src/routes/applicationRoutes'));
app.use('/api/conversations', require('./src/routes/conversationRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
