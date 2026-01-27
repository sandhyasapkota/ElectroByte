import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Appointment = sequelize.define("Appointment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  appointmentTime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceType: {
    type: DataTypes.STRING, // Laptop, Desktop, Mobile, etc.
    allowNull: false,
  },
  deviceBrand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  issueDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    defaultValue: 'pending',
  },
  pickupRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pickupAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "appointments",
  timestamps: true,
});

export { Appointment };
