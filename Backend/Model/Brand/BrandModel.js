import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Brand = sequelize.define("Brand", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "brands",
  timestamps: true,
});

export { Brand };
