import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";
import { User } from "./userModel.js";

const Appointment = sequelize.define("Appointment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  service: {
    type: DataTypes.STRING,
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

  status: {
    type: DataTypes.STRING,
    defaultValue: "Pending",
  },
}, {
  tableName: "appointments",
  timestamps: true,
});

/* 🔗 Relationships */
User.hasMany(Appointment, { foreignKey: "userId" });
Appointment.belongsTo(User, { foreignKey: "userId" });

export { Appointment };
