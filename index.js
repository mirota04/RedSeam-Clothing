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

// Helper function to build pagination URLs with current filters
const buildPaginationUrl = (pageNum, filters = {}) => {
    const params = new URLSearchParams();
    params.set('page', pageNum);
    
    if (filters.priceFrom) params.set('filter[price_from]', filters.priceFrom);
    if (filters.priceTo) params.set('filter[price_to]', filters.priceTo);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.sortOrder) params.set('sort_order', filters.sortOrder);
    
    return `/?${params.toString()}`;
};

// Make buildPaginationUrl available to all EJS templates
app.locals.buildPaginationUrl = buildPaginationUrl;

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
        let page = req.query.page || 1;
        const priceFrom = req.query['filter[price_from]'] || req.query.filter?.price_from;
        const priceTo = req.query['filter[price_to]'] || req.query.filter?.price_to;
        const sort = req.query.sort;
        const sortOrder = req.query.sort_order;
        
        const apiUrl = process.env.API_URL?.replace(/\/$/, '');
        let actualPage = page;
        
        // For price high-to-low, we need to reverse the page numbers
        if (sort === 'price' && sortOrder === 'desc') {
            // First, get the total number of pages to calculate the reversed page
            const tempUrl = `${apiUrl}/products?page=1`;
            let tempUrlWithFilters = tempUrl;
            if (priceFrom) tempUrlWithFilters += `&filter[price_from]=${priceFrom}`;
            if (priceTo) tempUrlWithFilters += `&filter[price_to]=${priceTo}`;
            if (sort) tempUrlWithFilters += `&sort=${sort}`;
            
            const tempResponse = await axios.get(tempUrlWithFilters, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${yourBearerToken}`,
                },
            });
            
            const totalPages = tempResponse.data.meta?.last_page || 1;
            actualPage = totalPages - parseInt(page) + 1;
        }
        
        let url = `${apiUrl}/products?page=${actualPage}`;
        
        // Add filter parameters if they exist
        if (priceFrom) url += `&filter[price_from]=${priceFrom}`;
        if (priceTo) url += `&filter[price_to]=${priceTo}`;
        if (sort) url += `&sort=${sort}`;
        
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${yourBearerToken}`,
            },
        });

        let products = response.data.data || [];
        let pagination = response.data.meta || {};
        
        // Handle price high-to-low sorting by reversing the array
        if (sort === 'price' && sortOrder === 'desc') {
            products = products.reverse();
            
            // Update pagination to show correct page numbers for high-to-low
            pagination = {
                ...pagination,
                current_page: parseInt(page), // Show the original page number
                prev: pagination.next ? `?page=${parseInt(page) + 1}` : null,
                next: pagination.prev ? `?page=${parseInt(page) - 1}` : null
            };
        }
        
        res.render('home.ejs', { 
            user: req.session.user,
            products: products,
            pagination: pagination,
            currentPage: parseInt(page),
            filters: {
                priceFrom: priceFrom || '',
                priceTo: priceTo || '',
                sort: sort || '',
                sortOrder: sortOrder || ''
            }
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to empty products on error
        res.render('home.ejs', { 
            user: req.session.user,
            products: [],
            pagination: {},
            currentPage: 1,
            filters: {
                priceFrom: '',
                priceTo: '',
                sort: '',
                sortOrder: ''
            }
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