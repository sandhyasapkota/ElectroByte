import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Repair = sequelize.define("Repair", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  repairToken: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  technicianId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('received', 'diagnosing', 'in_progress', 'waiting_parts', 'completed', 'ready_pickup'),
    defaultValue: 'received',
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  finalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  technicianNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: "repairs",
  timestamps: true,
});

export { Repair };
