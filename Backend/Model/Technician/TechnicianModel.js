import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Technician = sequelize.define("Technician", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  specialization: {
    type: DataTypes.STRING, // Laptop, Desktop, Mobile, etc.
    allowNull: true,
  },
  experience: {
    type: DataTypes.INTEGER, // Years
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "technicians",
  timestamps: true,
});

export { Technician };
