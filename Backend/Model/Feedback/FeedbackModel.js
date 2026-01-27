import { DataTypes } from "sequelize";
import { sequelize } from "../../Database/db.js";

const Feedback = sequelize.define("Feedback", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('order', 'repair', 'product'),
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.INTEGER, // orderId, repairId, or productId
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER, // 1-5
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "feedbacks",
  timestamps: true,
});

export { Feedback };
