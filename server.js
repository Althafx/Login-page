// import all the required modules
const express = require('express');  // Importing the Express module to create the server
const app = express();  // Initializing the Express application
const hbs = require('hbs');  // Importing the Handlebars (HBS) view engine for rendering templates
const session = require('express-session');  // Importing the express-session module for session management
const nocache = require('nocache');  // Importing the nocache module to disable caching

// Set the folder for static assets (like CSS, images)
app.use(express.static('public'));

// Set Handlebars (HBS) as the view engine for rendering views
app.set('view engine', 'hbs');

// Predefined username and password (for basic authentication)
const username = "admin";  // Static username
const password = "admin@123";  // Static password

// Middleware to parse incoming requests with urlencoded and JSON payloads
app.use(express.urlencoded({ extended: true }));  // Parses form data (from POST requests)
app.use(express.json());  // Parses JSON data (for API requests)

// Creating a session, which is used to store user information during the session lifecycle
app.use(session({
    secret: 'keyboard cat',  // A secret key for encoding session data
    resave: false,  // Prevents resaving session if nothing has changed
    saveUnitialized: true,  // Forces a session that is uninitialized to be saved to the store
}));

// Disable client-side caching using the nocache middleware (prevents browsers from caching pages)
app.use(nocache());

// Handle GET requests to the root URL ("/")
app.get('/', (req, res) => {
    if (req.session.user) {  // If the user is logged in (session contains user info)
        res.render('home');  // Render the home page if the user is logged in
    } else {
        if (req.session.passwordwrong) {  // Check if the password was wrong
            res.render('login', { msg: "INVALID CREDENTIALS" });  // If so, display an error message on the login page
            req.session.passwordwrong = false;  // Reset the wrong password flag after displaying the error
        } else {
            res.render('login');  // If no issues, render the login page
        }
    }
});

// Handle POST requests to the '/verify' URL, for verifying login credentials
app.post('/verify', (req, res) => {
    console.log(req.body);  // Log the incoming request body (the form data)
    if (req.body.username === username && req.body.password === password) {  // Check if the provided credentials match
        req.session.user = req.body.username;  // Store the user info in the session if login is successful
        res.redirect('/home');  // Redirect to the home page after successful login
        console.log('success');
    } else {
        req.session.passwordwrong = true;  // Set a flag to indicate incorrect login credentials
        res.redirect('/');  // Redirect back to the login page
        console.log("login failed");
    }
});

// Handle GET requests to the '/home' URL, after login
app.get('/home', (req, res) => {
    if (req.session.user) {  // Check if the user is logged in
        res.render('home');  // Render the home page if logged in
    } else {
        if (req.session.passwordwrong) {  // Check if the password was wrong
            req.session.passwordwrong = false;  // Reset the password flag
            res.render('login', { msg: "INVALID CREDENTIALS" });  // Render the login page with an error message
        } else {
            res.render('login');  // Otherwise, just show the login page
        }
    }
});

// Handle the '/logout' URL to log the user out
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {  // Destroy the session when logging out
        if (err) {
            return console.log(err);  // Log any errors that occur during session destruction
        }
        res.redirect('/');  // Redirect back to the login page after logging out
    });
});

// Start the server, listening on port 3003
app.listen(3003, () => console.log("server running on port 3003"));
