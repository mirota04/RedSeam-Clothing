import express from 'express';
import bodyParser from 'body-parser';
import env from 'dotenv';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 5000;
const API_URL = process.env.API_URL;
const saltRounds = 10;
env.config();

const yourBearerToken = process.env.BEARER_TOKEN;
const config = {
    headers: { Authorization: `Bearer ${yourBearerToken}` },
};

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

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.listen(PORT, () => {
    console.log(`Server runnig on port ${PORT}.`);
});