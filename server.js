const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Import the path module

const authRoutes = require('./routes/authRoutes');
const franchiseRoutes = require('./routes/franchiseRoutes');
const gymRoutes = require('./routes/gymRoutes');
const memberRoutes = require('./routes/memberRoutes');
const trainerRoutes = require('./routes/trainerRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const workoutRoutes = require("./routes/workoutRoutes");
const dietPlanRoutes = require("./routes/dietPlanRoutes");
const errorMiddleware = require('./middleware/errorMiddleware');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, 'build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/gym', gymRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/memberships', membershipRoutes);
app.use("/api/workouts", workoutRoutes);
app.use('/api', dietPlanRoutes);

// Error handling middleware should be after all routes
app.use(errorMiddleware);

// For any route not handled by API, send back the React app's index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
