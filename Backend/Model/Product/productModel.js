import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    warranty_months: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active", // active | inactive
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

export { Product };
