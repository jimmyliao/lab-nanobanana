const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Trust Proxy is required for Cloud Run because it sits behind a Google Load Balancer
app.set('trust proxy', 1);

// Parse JSON bodies (Required for passcode verification)
app.use(express.json());

// Helper function to create a limiter from env vars or defaults
// Format: WINDOW_MS,MAX_REQUESTS (e.g., "60000,5")
const createLimiter = (configStr, defaultWindow, defaultMax, message) => {
  let windowMs = defaultWindow;
  let max = defaultMax;

  if (configStr) {
    const parts = configStr.split(',');
    if (parts.length === 2) {
      windowMs = parseInt(parts[0], 10);
      max = parseInt(parts[1], 10);
    }
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, error: message || 'Too many requests, please try again later.' },
    keyGenerator: (req) => {
      // Create a unique key based on IP. 
      // In Cloud Run/Express, req.ip is populated correctly with 'trust proxy' set.
      return req.ip; 
    }
  });
};

// --- Rate Limit Configuration ---
// Limit 1: 1 minute (60000ms), 5 requests
const limiter1 = createLimiter(
  process.env.RATE_LIMIT_SHORT, 
  60 * 1000, 
  5, 
  'Rate limit exceeded: You can only make 5 requests per minute.'
);

// Limit 2: 5 minutes (300000ms), 30 requests
const limiter2 = createLimiter(
  process.env.RATE_LIMIT_MEDIUM, 
  5 * 60 * 1000, 
  30, 
  'Rate limit exceeded: You can only make 30 requests per 5 minutes.'
);

// Limit 3: 10 minutes (600000ms), 80 requests
const limiter3 = createLimiter(
  process.env.RATE_LIMIT_LONG, 
  10 * 60 * 1000, 
  80, 
  'Rate limit exceeded: You can only make 80 requests per 10 minutes.'
);

// Apply limits to API endpoints or the whole app
app.use(limiter1);
app.use(limiter2);
app.use(limiter3);

// --- API Endpoints ---

// Verify Passcode Endpoint
app.post('/api/verify-passcode', (req, res) => {
  const { passcode } = req.body;
  const correctPasscode = process.env.APP_PASSCODE || 'jimmyliao'; // Default fallback
  
  if (passcode === correctPasscode) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid passcode' });
  }
});

// Serve Static Files (The React App)
app.use(express.static(path.join(__dirname, '.')));

// SPA Fallback: Send index.html for any other requests (frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Nano Banana Server listening on port ${port}`);
  console.log(`Rate Limits Active`);
});