import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const ProductImage = sequelize.define("ProductImage", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.TEXT, // For base64 or file paths
    allowNull: false,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "product_images",
  timestamps: true,
});

export { ProductImage };
