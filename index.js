import express from 'express';
import bodyParser from 'body-parser';
import env from 'dotenv';
import session from 'express-session';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

const app = express();
const PORT = process.env.PORT || 5000;
const API_URL = process.env.API_URL;
const saltRounds = 10;
env.config();

const yourBearerToken = process.env.BEARER_TOKEN;
const config = {
    headers: { Authorization: `Bearer ${yourBearerToken}` },
};

// Multer setup - avatar optional, limit ~2MB
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.get('/', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const apiUrl = process.env.API_URL?.replace(/\/$/, '');
        const url = `${apiUrl}/products?page=${page}`;
        
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${yourBearerToken}`,
            },
        });

        const products = response.data.data || [];
        const pagination = response.data.meta || {};
        
        res.render('home.ejs', { 
            user: req.session.user,
            products: products,
            pagination: pagination,
            currentPage: parseInt(page)
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to empty products on error
        res.render('home.ejs', { 
            user: req.session.user,
            products: [],
            pagination: {},
            currentPage: 1
        });
    }
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// Handle login form submission
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render('login.ejs', { 
        error: 'Email and password are required.',
        errorType: 'validation'
      });
    }

    const apiUrl = process.env.API_URL?.replace(/\/$/, '');
    const url = `${apiUrl}/login`;
    
    const response = await axios.post(url, {
      email,
      password
    }, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${yourBearerToken}`,
      },
    });

    // On success, store user data in session
    if (response?.data?.user) {
      req.session.user = response.data.user;
      req.session.token = response.data.token;
    }
    // Redirect to home page
    res.redirect('/');
  } catch (err) {
    if (err.response) {
      // Render login page with error message
      const errorMessage = err.response.data?.message || err.response.data || 'Login failed';
      return res.render('login.ejs', { 
        error: errorMessage,
        errorType: err.response.status === 401 ? 'auth' : 'error'
      });
    }
    res.render('login.ejs', { 
      error: 'Login failed. Please try again.',
      errorType: 'error'
    });
  }
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

// Proxy registration to external API
app.post('/register', upload.any(), async (req, res) => {
  try {
    const { username, email, password, password_confirmation } = req.body;
    if (!username || !email || !password || !password_confirmation) {
      return res.status(400).send('Missing required fields.');
    }
    if (password !== password_confirmation) {
      return res.status(422).send('Passwords do not match.');
    }

    const form = new FormData();
    form.append('username', username);
    form.append('email', email);
    form.append('password', password);
    form.append('password_confirmation', password_confirmation);
    
    // Look for avatar file in any uploaded files
    const avatarFile = req.files?.find(file => file.fieldname === 'avatar');
    if (avatarFile) {
      form.append('avatar', avatarFile.buffer, { 
        filename: avatarFile.originalname, 
        contentType: avatarFile.mimetype 
      });
    }

    const apiUrl = process.env.API_URL?.replace(/\/$/, '');
    const url = `${apiUrl}/register`;
    
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
        Accept: 'application/json',
        Authorization: `Bearer ${yourBearerToken}`,
      },
    });

    // On success, store user data in session
    if (response?.data?.user) {
      req.session.user = response.data.user;
      req.session.token = response.data.token;
    }
    // Redirect to home or login as desired
    res.redirect('/');
  } catch (err) {
    if (err.response) {
      // Render register page with error message
      const errorMessage = err.response.data?.message || err.response.data || 'Registration failed';
      return res.render('register.ejs', { 
        error: errorMessage,
        errorType: err.response.status === 422 ? 'validation' : 'error'
      });
    }
    res.render('register.ejs', { 
      error: 'Registration failed. Please try again.',
      errorType: 'error'
    });
  }
});

app.listen(PORT, () => {
    console.log(`Server runnig on port ${PORT}.`);
});