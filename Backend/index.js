import express from 'express';
// import cors from 'cors';
// import bodyParser from 'body-parser';
import {UserRoute} from './Routes/index.js';
import dotenv from 'dotenv';
dotenv.config();
import {testConnection} from './database/db.js';

const app = express();
const PORT = process.env.PORT || 5000;
testConnection();
// app.use(cors());
// app.use(bodyParser.json());
app.use('/api/users', UserRoute);
// app.use('/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;