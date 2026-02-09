const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============== DATA SECTION (MUST COME FIRST) ==============
// Monthly hikes data
const monthlyHikes = [
  { month: 'January', name: 'Cool Breezing', difficulty: 'Easy', spots: 75 },
  { month: 'February', name: 'Couples Edition', difficulty: 'Moderate', spots: 100 },
  { month: 'March', name: 'Environment Conservation', difficulty: 'Easy', spots: 'unlimited' },
  { month: 'April', name: 'Waterfall Wellness Retreat', difficulty: 'Moderate', spots: 'unlimited' },
  { month: 'May', name: 'Hope', difficulty: 'Challenging', spots: 50 },
  { month: 'June', name: 'Coffee Vibes', difficulty: 'Easy', spots: 'unlimited' },
  { month: 'July', name: 'Coffee n the cold!', difficulty: 'Moderate', spots: 80 },
  { month: 'August', name: 'Honeymoon Time!', difficulty: 'Easy', spots: 'unlimited' },
  { month: 'September', name: 'Rainy Meditation', difficulty: 'Moderate', spots: 90 },
  { month: 'October', name: 'Hard Hiking Adventure', difficulty: 'Challenging', spots: 90 },
  { month: 'November', name: 'Thanksgiving Gratitude Hike', difficulty: 'Moderate', spots: 'unlimited' },
  { month: 'December', name: 'Wholesome Reflection', difficulty: 'Easy', spots: 'unlimited' }
];

// Dietary options
const dietaryOptions = [
  'Vegetarian', 'Plantains', 'Gluten-Free', 'Dairy-Free', 
  'Nut-Free', 'Coffee', 'Keto', 'Fish', 'No Restrictions'
];

// Accommodation options
const accommodationOptions = [
  'Camping (Tent)',
  'Bamboo Hut Shared',
  'Bamboo Hut Private',
  'Luxury Wilderness Retreat',
  'Day Trip Only'
];
// ===========================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"  // ✅ Added Font Awesome CDN
      ],
      scriptSrc: [
        "'self'", 
        "https://kit.fontawesome.com"  // Keep this if you use any FA scripts
      ],
      fontSrc: [
        "'self'", 
        "data:", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"  // ✅ Added for Font Awesome fonts
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/submit', limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ CRITICAL: Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup (DO THIS ONLY ONCE)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============== ROUTES ==============

// Route 1: Serve index.html as homepage (from public folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route 2: Serve contact page with dynamic data
app.get('/contact', (req, res) => {
  res.render('contact', {  
    monthlyHikes, 
    dietaryOptions, 
    accommodationOptions,
    currentMonth: new Date().toLocaleString('default', { month: 'long' })
  });
});

// Form submission endpoint
app.post('/submit', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      hikeMonth, 
      participants, 
      dietary, 
      accommodation, 
      message 
    } = req.body;

    // Email to business
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Hike Booking: ${name} - ${hikeMonth}`,
      html: `
        <h2>New Hike Booking Request</h2>
        <p><strong>Client:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Selected Hike:</strong> ${hikeMonth}</p>
        <p><strong>Number of Participants:</strong> ${participants}</p>
        <p><strong>Dietary Preferences:</strong> ${dietary}</p>
        <p><strong>Accommodation:</strong> ${accommodation}</p>
        <p><strong>Message:</strong> ${message || 'No additional message'}</p>
        <hr>
        <p>This booking was submitted on ${new Date().toLocaleDateString()}</p>
      `
    };

    // Email to client (confirmation)
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'GuraNatureParadise Hike Inquiry - Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Gura Nature Paradise</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #2d5a27;">Hey, ${name}!</h2>
            <p>We've received your bookings for the <strong>${hikeMonth}</strong> hike.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4a7c59;">
              <h3 style="color: #2d5a27; margin-top: 0;">Your booking details are as follows:</h3>
              <p><strong>Participants:</strong> ${participants}</p>
              <p><strong>Dietary preferences:</strong> ${dietary}</p>
              <p><strong>Accommodation:</strong> ${accommodation}</p>
              ${message ? `<p><strong>Your Message:</strong> ${message}</p>` : ''}
            </div>
            
            <p>Your request is under review and contact you as soon as possible.</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Next Steps:</strong></p>
              <ol style="margin: 10px 0;">
                <li>We'll verify hike availability for ${participants} participant(s)</li>
                <li>Then, send you a detailed itinerary and packing list</li>
                <li>And finally, provide payment instructions and options</li>
                <li>Answer any queries you may have</li>
              </ol>
            </div>
            
            <p>For immediate questions, you can reply to this email or contact us via WhatsApp, 0.</p>
            
            <p>Kind regards,<br>Gura Nature Paradise Team</p>
          </div>
          <div style="background-color: #2d5a27; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <p>&copy; ${new Date().getFullYear()} Gura Nature Paradise. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(clientMailOptions);

    res.json({ 
      success: true, 
      message: 'Your inquiry has been submitted successfully! Kindly check your email for confirmation.' 
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'There was an error submitting your form. Please try again or contact us directly.' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route 5: Catch-all for SPA (if using client-side routing)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});