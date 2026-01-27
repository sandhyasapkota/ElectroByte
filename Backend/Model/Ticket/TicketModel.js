import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Can be null for contact form submissions
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('contact', 'support'),
    defaultValue: 'support',
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
  },
  adminReply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "tickets",
  timestamps: true,
});

export { Ticket };
