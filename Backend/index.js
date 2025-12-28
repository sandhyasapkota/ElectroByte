import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {UserRoute} from './Routes/index.js';
import {productRoute} from './Routes/index.js';
import {authRouter} from './Routes/index.js';
import dotenv from 'dotenv';
dotenv.config();
import {testConnection, sequelize} from './Database/db.js';
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

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
  
  // Force sync - WARNING: This will drop and recreate tables!
  await sequelize.sync({ force: true });
  console.log("✅ Database synced!");
});

export default app;