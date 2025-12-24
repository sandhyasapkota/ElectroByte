import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {UserRoute} from './Routes/index.js';
import {productRoute} from './Routes/index.js';
import {authRouter} from './Routes/index.js';
import dotenv from 'dotenv';
dotenv.config();
import {testConnection} from './Database/db.js';
import { authenticateToken } from './Middleware/token-middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authenticateToken);

app.use('/api/users', UserRoute);
app.use('/api/products',productRoute);
app.use('/api', authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  testConnection();
});

export default app;