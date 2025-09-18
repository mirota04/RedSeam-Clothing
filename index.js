import express from 'express';
import bodyParser from 'body-parser';
import env from 'dotenv';

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL;
const saltRounds = 10;
env.config();