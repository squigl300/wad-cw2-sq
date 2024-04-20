const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const mustacheExpress = require('mustache-express');
const path = require('path');
const methodOverride = require('method-override');
const { notFoundError, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(methodOverride('_method'));

// Set up Mustache as the template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Set up session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Restrict cookie access to HTTP(S) only
    maxAge: 24 * 60 * 60 * 1000, // Set session expiration time (e.g., 24 hours)
  },
}));
app.use(flash());

// Set up middleware to parse request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up static file serving middleware
app.use(express.static(path.join(__dirname, 'public')));

// Custom middleware to set flash messages in response locals
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Import route files
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const pantryRoutes = require('./routes/pantryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Set up routes
app.use('/users', userRoutes);
app.use('/items', itemRoutes);
app.use('/pantries', pantryRoutes);
app.use('/admin', adminRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('home', { title: 'Food Share App', user: req.session.user });
});

// Other routes
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  // TODO: Implement email sending or store the message in the database
  console.log(`Received contact form submission: Name: ${name}, Email: ${email}, Message: ${message}`);
  res.redirect('/contact');
});

app.get('/terms', (req, res) => {
  res.render('terms', { title: 'Terms of Service' });
});

app.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy Policy' });
});

// Error handling middleware
app.use(notFoundError);
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});