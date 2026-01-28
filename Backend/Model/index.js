export * from './User/UserModel.js';
export * from './Product/productModel.js';
export * from './Product/ProductImageModel.js';
export * from './Category/CategoryModel.js';
export * from './Brand/BrandModel.js';
export * from './Cart/CartModel.js';
export * from './Order/OrderModel.js';
export * from './Address/AddressModel.js';
export * from './Appointment/appointmentModel.js';
export * from './Repair/RepairModel.js';
export * from './Technician/TechnicianModel.js';
export * from './Ticket/TicketModel.js';
export * from './Ticket/TicketReplyModel.js';
export * from './FAQ/FAQModel.js';
export * from './Feedback/FeedbackModel.js';
export * from './Wishlist/WishlistModel.js';

// Model Associations
import { User } from './User/UserModel.js';
import { Product } from './Product/productModel.js';
import { ProductImage } from './Product/ProductImageModel.js';
import { Category } from './Category/CategoryModel.js';
import { Brand } from './Brand/BrandModel.js';
import { Cart } from './Cart/CartModel.js';
import { Order, OrderItem } from './Order/OrderModel.js';
import { Address } from './Address/AddressModel.js';
import { Appointment } from './Appointment/appointmentModel.js';
import { Repair } from './Repair/RepairModel.js';
import { Technician } from './Technician/TechnicianModel.js';
import { Feedback } from './Feedback/FeedbackModel.js';
import { Ticket } from './Ticket/TicketModel.js';
import { TicketReply } from './Ticket/TicketReplyModel.js';
import { Wishlist } from './Wishlist/WishlistModel.js';

// User associations
User.hasMany(Cart, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });
User.hasMany(Address, { foreignKey: 'userId' });
User.hasMany(Appointment, { foreignKey: 'userId' });
User.hasMany(Feedback, { foreignKey: 'userId' });
Feedback.belongsTo(User, { foreignKey: 'userId' });

// Product associations
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });
Brand.hasMany(Product, { foreignKey: 'brand_id' });
Product.belongsTo(Brand, { foreignKey: 'brand_id' });

// Product Image associations
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Cart, { foreignKey: 'productId' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Address associations
Address.belongsTo(User, { foreignKey: 'userId' });

// Appointment associations
Appointment.belongsTo(User, { foreignKey: 'userId' });
Appointment.hasOne(Repair, { foreignKey: 'appointmentId' });

// Repair associations
Repair.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Repair.belongsTo(User, { foreignKey: 'userId' });
Repair.belongsTo(Technician, { foreignKey: 'technicianId' });
Technician.hasMany(Repair, { foreignKey: 'technicianId' });

// Technician associations
Technician.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Technician, { foreignKey: 'userId' });

// Ticket associations
Ticket.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Ticket, { foreignKey: 'userId' });
Ticket.hasMany(TicketReply, { foreignKey: 'ticketId' });
TicketReply.belongsTo(Ticket, { foreignKey: 'ticketId' });
TicketReply.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(TicketReply, { foreignKey: 'userId' });

// Wishlist associations
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Wishlist, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });