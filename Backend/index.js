// index.js
import app from "./app.js";
import { sequelize, testConnection } from "./Database/db.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on ${PORT}`);
  await testConnection();
  await sequelize.sync({ alter: true });
});
