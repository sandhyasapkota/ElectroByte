import { sequelize } from './Database/db.js';
import {
  User,
  Product,
  Category,
  Brand,
  FAQ,
  Technician,
  ProductImage,
  Order,
  OrderItem,
  Address,
  Appointment,
  Repair,
  Ticket,
  TicketReply,
  Feedback,
  Wishlist,
  Cart
} from './Model/index.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Sync database (alter keeps data while updating schema)
    await sequelize.sync({ alter: true });

    // Create Categories
    const categoriesData = [
      { name: 'Gaming Laptops', description: 'High-performance gaming laptops', isActive: true },
      { name: 'Business Laptops', description: 'Professional business laptops', isActive: true },
      { name: 'Ultrabooks', description: 'Thin and light ultrabooks', isActive: true },
      { name: 'Budget Laptops', description: 'Affordable everyday laptops', isActive: true },
      { name: 'Desktop PCs', description: 'Desktop computers', isActive: true },
      { name: 'Accessories', description: 'Computer accessories', isActive: true }
    ];
    await Category.bulkCreate(categoriesData, { ignoreDuplicates: true });
    console.log('Categories ready');

    // Create Brands
    const brandsData = [
      { name: 'ASUS', logo: null, isActive: true },
      { name: 'HP', logo: null, isActive: true },
      { name: 'Dell', logo: null, isActive: true },
      { name: 'Lenovo', logo: null, isActive: true },
      { name: 'Acer', logo: null, isActive: true },
      { name: 'MSI', logo: null, isActive: true },
      { name: 'Apple', logo: null, isActive: true }
    ];
    await Brand.bulkCreate(brandsData, { ignoreDuplicates: true });
    console.log('Brands ready');

    const allCategories = await Category.findAll();
    const allBrands = await Brand.findAll();

    const getCategoryId = (name) => allCategories.find(c => c.name === name)?.id || allCategories[0]?.id;
    const getBrandId = (name) => allBrands.find(b => b.name === name)?.id || allBrands[0]?.id;

    const productImageMap = {
      'ASUS TUF Gaming F15': 'https://via.placeholder.com/800x600?text=ASUS+TUF+Gaming+F15',
      'HP Pavilion 15': 'https://via.placeholder.com/800x600?text=HP+Pavilion+15',
      'Dell Inspiron 14': 'https://via.placeholder.com/800x600?text=Dell+Inspiron+14',
      'Lenovo IdeaPad 3': 'https://via.placeholder.com/800x600?text=Lenovo+IdeaPad+3',
      'Acer Nitro 5': 'https://via.placeholder.com/800x600?text=Acer+Nitro+5',
      'MSI GF63 Thin': 'https://via.placeholder.com/800x600?text=MSI+GF63+Thin',
      'ASUS ROG Strix G15': 'https://via.placeholder.com/800x600?text=ASUS+ROG+Strix+G15',
      'HP Victus 16': 'https://via.placeholder.com/800x600?text=HP+Victus+16',
      'Dell XPS 13': 'https://via.placeholder.com/800x600?text=Dell+XPS+13',
      'Lenovo ThinkPad X1 Carbon': 'https://via.placeholder.com/800x600?text=ThinkPad+X1+Carbon'
    };

    // Create Products
    const productsData = [
      {
        name: 'ASUS TUF Gaming F15',
        description: 'Powerful gaming laptop with Intel Core i7, RTX 3060, 16GB RAM, 512GB SSD. Perfect for gaming and content creation.',
        price: 145000,
        stock_quantity: 10,
        warranty_months: 24,
        category_id: getCategoryId('Gaming Laptops'),
        brand_id: getBrandId('ASUS'),
        image_url: productImageMap['ASUS TUF Gaming F15'],
        status: 'active'
      },
      {
        name: 'HP Pavilion 15',
        description: 'Versatile laptop with Intel Core i5, 8GB RAM, 256GB SSD. Great for everyday use and productivity.',
        price: 95000,
        stock_quantity: 15,
        warranty_months: 12,
        category_id: getCategoryId('Budget Laptops'),
        brand_id: getBrandId('HP'),
        image_url: productImageMap['HP Pavilion 15'],
        status: 'active'
      },
      {
        name: 'Dell Inspiron 14',
        description: 'Compact and reliable laptop with AMD Ryzen 5, 8GB RAM, 512GB SSD for business and personal use.',
        price: 85000,
        stock_quantity: 8,
        warranty_months: 12,
        category_id: getCategoryId('Business Laptops'),
        brand_id: getBrandId('Dell'),
        image_url: productImageMap['Dell Inspiron 14'],
        status: 'active'
      },
      {
        name: 'Lenovo IdeaPad 3',
        description: 'Budget-friendly laptop with Intel Core i3, 8GB RAM, 256GB SSD. Perfect for students and basic tasks.',
        price: 65000,
        stock_quantity: 20,
        warranty_months: 12,
        category_id: getCategoryId('Budget Laptops'),
        brand_id: getBrandId('Lenovo'),
        image_url: productImageMap['Lenovo IdeaPad 3'],
        status: 'active'
      },
      {
        name: 'Acer Nitro 5',
        description: 'Gaming powerhouse with AMD Ryzen 7, RTX 3050, 16GB RAM, 512GB SSD. Built for serious gamers.',
        price: 125000,
        stock_quantity: 5,
        warranty_months: 24,
        category_id: getCategoryId('Gaming Laptops'),
        brand_id: getBrandId('Acer'),
        image_url: productImageMap['Acer Nitro 5'],
        status: 'active'
      },
      {
        name: 'MSI GF63 Thin',
        description: 'Sleek gaming laptop with Intel Core i5, GTX 1650, 8GB RAM, 256GB SSD. Gaming on the go.',
        price: 105000,
        stock_quantity: 7,
        warranty_months: 24,
        category_id: getCategoryId('Gaming Laptops'),
        brand_id: getBrandId('MSI'),
        image_url: productImageMap['MSI GF63 Thin'],
        status: 'active'
      },
      {
        name: 'ASUS ROG Strix G15',
        description: 'Premium gaming laptop with AMD Ryzen 9, RTX 3070, 32GB RAM, 1TB SSD. Ultimate gaming experience.',
        price: 245000,
        stock_quantity: 3,
        warranty_months: 36,
        category_id: getCategoryId('Gaming Laptops'),
        brand_id: getBrandId('ASUS'),
        image_url: productImageMap['ASUS ROG Strix G15'],
        status: 'active'
      },
      {
        name: 'HP Victus 16',
        description: 'Gaming laptop with Intel Core i7, RTX 3060, 16GB RAM, 512GB SSD. Power meets style.',
        price: 155000,
        stock_quantity: 12,
        warranty_months: 24,
        category_id: getCategoryId('Gaming Laptops'),
        brand_id: getBrandId('HP'),
        image_url: productImageMap['HP Victus 16'],
        status: 'active'
      },
      {
        name: 'Dell XPS 13',
        description: 'Premium ultrabook with Intel Core i7, 16GB RAM, 512GB SSD, stunning 4K display. Elegance redefined.',
        price: 195000,
        stock_quantity: 6,
        warranty_months: 24,
        category_id: getCategoryId('Ultrabooks'),
        brand_id: getBrandId('Dell'),
        image_url: productImageMap['Dell XPS 13'],
        status: 'active'
      },
      {
        name: 'Lenovo ThinkPad X1 Carbon',
        description: 'Business ultrabook with Intel Core i7, 16GB RAM, 512GB SSD. Built for professionals.',
        price: 225000,
        stock_quantity: 4,
        warranty_months: 36,
        category_id: getCategoryId('Business Laptops'),
        brand_id: getBrandId('Lenovo'),
        image_url: productImageMap['Lenovo ThinkPad X1 Carbon'],
        status: 'active'
      }
    ];
    await Product.bulkCreate(productsData, { ignoreDuplicates: true });
    console.log('Products ready');

    const allProducts = await Product.findAll();
    const getProduct = (name) => allProducts.find(p => p.name === name);

    // Ensure product images exist
    for (const [name, imageUrl] of Object.entries(productImageMap)) {
      const product = getProduct(name);
      if (!product) continue;
      const existing = await ProductImage.findOne({ where: { productId: product.id, imageUrl } });
      if (!existing) {
        await ProductImage.create({
          productId: product.id,
          imageUrl,
          isPrimary: true,
          displayOrder: 0
        });
      }
      if (!product.image_url) {
        await product.update({ image_url: imageUrl });
      }
    }
    console.log('Product images ready');

    // Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const techPassword = await bcrypt.hash('tech123', 10);
    const demoPassword = await bcrypt.hash('demo123', 10);

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@electrobyte.com' },
      defaults: {
        username: 'admin',
        email: 'admin@electrobyte.com',
        password: adminPassword,
        role: 'admin',
        isEmailVerified: true,
        profileImage: 'https://i.pravatar.cc/150?img=12'
      }
    });

    const [testUser] = await User.findOrCreate({
      where: { email: 'user@test.com' },
      defaults: {
        username: 'testuser',
        email: 'user@test.com',
        password: userPassword,
        role: 'user',
        isEmailVerified: true,
        phone: '9800000001',
        profileImage: 'https://i.pravatar.cc/150?img=32'
      }
    });

    const [techUser] = await User.findOrCreate({
      where: { email: 'tech@electrobyte.com' },
      defaults: {
        username: 'technician',
        email: 'tech@electrobyte.com',
        password: techPassword,
        phone: '9841234567',
        role: 'technician',
        isEmailVerified: true,
        profileImage: 'https://i.pravatar.cc/150?img=48'
      }
    });

    const [demoUser] = await User.findOrCreate({
      where: { email: 'demo@electrobyte.com' },
      defaults: {
        username: 'demo user',
        email: 'demo@electrobyte.com',
        password: demoPassword,
        phone: '9800000002',
        role: 'user',
        isEmailVerified: true,
        profileImage: 'https://i.pravatar.cc/150?img=52'
      }
    });

    // Technician profile
    await Technician.findOrCreate({
      where: { userId: techUser.id },
      defaults: {
        userId: techUser.id,
        specialization: 'Laptop & Desktop',
        experience: 5,
        isActive: true
      }
    });
    const technician = await Technician.findOne({ where: { userId: techUser.id } });

    console.log('Users ready');

    // Addresses
    const addressSeed = [
      {
        userId: testUser.id,
        label: 'home',
        fullName: 'Test User',
        phone: '9800000001',
        address: 'Ghar No. 20, Balkot',
        city: 'Bhaktapur',
        state: 'Bagmati',
        zipCode: '44600',
        isDefault: true
      },
      {
        userId: demoUser.id,
        label: 'work',
        fullName: 'Demo User',
        phone: '9800000002',
        address: 'New Road, Ward 22',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600',
        isDefault: true
      }
    ];
    for (const addr of addressSeed) {
      const existing = await Address.findOne({ where: { userId: addr.userId, address: addr.address } });
      if (!existing) await Address.create(addr);
    }
    console.log('Addresses ready');

    // Orders + items
    const now = new Date();
    const orderSeed = [
      {
        orderId: 'EB-DEMO-1001',
        userId: testUser.id,
        status: 'shipped',
        paymentMethod: 'cod',
        contactPhone: '9800000001',
        shippingAddress: 'Balkot, Bhaktapur, Bagmati',
        notes: 'Call before delivery',
        estimatedDeliveryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        items: [
          { productName: 'Lenovo ThinkPad X1 Carbon', quantity: 1 },
          { productName: 'HP Pavilion 15', quantity: 1 }
        ]
      },
      {
        orderId: 'EB-DEMO-1002',
        userId: demoUser.id,
        status: 'pending',
        paymentMethod: 'cod',
        contactPhone: '9800000002',
        shippingAddress: 'New Road, Kathmandu, Bagmati',
        notes: 'Deliver in evening',
        estimatedDeliveryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        items: [
          { productName: 'ASUS TUF Gaming F15', quantity: 1 }
        ]
      },
      {
        orderId: 'EB-DEMO-1003',
        userId: testUser.id,
        status: 'delivered',
        paymentMethod: 'cod',
        contactPhone: '9800000001',
        shippingAddress: 'Balkot, Bhaktapur, Bagmati',
        notes: 'Leave at reception',
        estimatedDeliveryDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        items: [
          { productName: 'Dell XPS 13', quantity: 1 }
        ]
      }
    ];

    for (const orderData of orderSeed) {
      const existingOrder = await Order.findOne({ where: { orderId: orderData.orderId } });
      if (!existingOrder) {
        let totalAmount = 0;
        for (const item of orderData.items) {
          const product = getProduct(item.productName);
          if (product) {
            totalAmount += Number(product.price) * item.quantity;
          }
        }

        const order = await Order.create({
          orderId: orderData.orderId,
          userId: orderData.userId,
          totalAmount,
          shippingAddress: orderData.shippingAddress,
          contactPhone: orderData.contactPhone,
          notes: orderData.notes,
          status: orderData.status,
          paymentMethod: orderData.paymentMethod,
          estimatedDeliveryDate: orderData.estimatedDeliveryDate
        });

        for (const item of orderData.items) {
          const product = getProduct(item.productName);
          if (!product) continue;
          await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            price: product.price
          });
        }
      }
    }
    console.log('Orders ready');

    const demoOrder = await Order.findOne({ where: { orderId: 'EB-DEMO-1003' } });

    // Appointments + Repairs
    const aptSeed = [
      {
        userId: testUser.id,
        appointmentDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        appointmentTime: '11:00 AM',
        deviceType: 'Laptop',
        deviceBrand: 'Lenovo',
        issueDescription: 'Laptop overheating and shutting down.',
        status: 'confirmed',
        pickupRequired: true,
        pickupAddress: 'Balkot, Bhaktapur'
      },
      {
        userId: demoUser.id,
        appointmentDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        appointmentTime: '02:30 PM',
        deviceType: 'Desktop',
        deviceBrand: 'Dell',
        issueDescription: 'Desktop not booting, beeping on start.',
        status: 'pending',
        pickupRequired: false
      }
    ];

    for (const apt of aptSeed) {
      const existingApt = await Appointment.findOne({
        where: {
          userId: apt.userId,
          appointmentDate: apt.appointmentDate,
          deviceType: apt.deviceType
        }
      });
      if (!existingApt) {
        const created = await Appointment.create(apt);
        await Repair.create({
          repairToken: `R-${Date.now()}-${created.id}`,
          appointmentId: created.id,
          userId: created.userId,
          technicianId: technician?.id || null,
          status: 'received',
          estimatedCost: 3500,
          technicianNotes: 'Initial inspection scheduled.'
        });
      }
    }
    console.log('Appointments ready');

    // Tickets
    const supportTicket = await Ticket.findOne({ where: { ticketNumber: 'TKT-DEMO-1001' } });
    if (!supportTicket) {
      const ticket = await Ticket.create({
        ticketNumber: 'TKT-DEMO-1001',
        userId: testUser.id,
        name: 'Test User',
        email: 'user@test.com',
        subject: 'Order delivery update',
        message: 'Please confirm when my order will be delivered.',
        type: 'support',
        status: 'in_progress'
      });

      await TicketReply.create({
        ticketId: ticket.id,
        userId: admin.id,
        message: 'Your order is scheduled for delivery soon. We will notify you.',
        isAdmin: true
      });

      await TicketReply.create({
        ticketId: ticket.id,
        userId: testUser.id,
        message: 'Thank you for the update!'
      });
    }

    const contactTicket = await Ticket.findOne({ where: { ticketNumber: 'TKT-DEMO-1002' } });
    if (!contactTicket) {
      await Ticket.create({
        ticketNumber: 'TKT-DEMO-1002',
        name: 'Visitor',
        email: 'visitor@example.com',
        subject: 'Business inquiry',
        message: 'Do you offer bulk purchase discounts?',
        type: 'contact',
        status: 'open'
      });
    }
    console.log('Tickets ready');

    // Feedback
    if (demoOrder) {
      const existingFeedback = await Feedback.findOne({
        where: { userId: testUser.id, type: 'order', referenceId: demoOrder.id }
      });
      if (!existingFeedback) {
        await Feedback.create({
          userId: testUser.id,
          type: 'order',
          referenceId: demoOrder.id,
          rating: 5,
          comment: 'Fast delivery and great packaging.'
        });
      }
    }

    const productForReview = getProduct('ASUS TUF Gaming F15');
    if (productForReview) {
      const existingProductFeedback = await Feedback.findOne({
        where: { userId: demoUser.id, type: 'product', referenceId: productForReview.id }
      });
      if (!existingProductFeedback) {
        await Feedback.create({
          userId: demoUser.id,
          type: 'product',
          referenceId: productForReview.id,
          rating: 4,
          comment: 'Solid performance for the price.'
        });
      }
    }
    console.log('Feedback ready');

    // Wishlist
    const wishlistProduct = getProduct('Dell XPS 13');
    if (wishlistProduct) {
      await Wishlist.findOrCreate({
        where: { userId: testUser.id, productId: wishlistProduct.id },
        defaults: { userId: testUser.id, productId: wishlistProduct.id }
      });
    }

    // Cart (demo)
    const cartProduct = getProduct('Lenovo IdeaPad 3');
    if (cartProduct) {
      await Cart.findOrCreate({
        where: { userId: demoUser.id, productId: cartProduct.id },
        defaults: { userId: demoUser.id, productId: cartProduct.id, quantity: 1 }
      });
    }

    // FAQs
    const faqData = [
      { question: 'What types of laptop issues do you fix?', answer: 'We handle both hardware and software problems including slow performance, boot errors, screen issues, keyboard problems, and crashes.', category: 'General', order: 1, isActive: true },
      { question: 'Do you offer home pickup service?', answer: 'Yes, we offer free pickup and delivery service within Kathmandu Valley for repairs.', category: 'Support', order: 2, isActive: true },
      { question: 'How long does a typical repair take?', answer: 'Most repairs are completed within 2-3 business days. Complex issues may take 5-7 days.', category: 'Support', order: 3, isActive: true },
      { question: 'What is your return policy?', answer: 'We offer a 7-day return policy for all products in original condition with receipt.', category: 'Shop', order: 4, isActive: true },
      { question: 'Do you provide warranty on repairs?', answer: 'Yes, all our repairs come with a 30-day warranty on parts and labor.', category: 'General', order: 5, isActive: true },
      { question: 'What payment methods do you accept?', answer: 'We accept cash, bank transfer, eSewa, Khalti, and all major credit/debit cards.', category: 'Shop', order: 6, isActive: true }
    ];
    await FAQ.bulkCreate(faqData, { ignoreDuplicates: true });

    console.log('FAQs ready');

    console.log('\nDatabase seeded successfully.');
    console.log('\nTest Accounts:');
    console.log('  Admin:      admin@electrobyte.com / admin123');
    console.log('  User:       user@test.com / user123');
    console.log('  Technician: tech@electrobyte.com / tech123');
    console.log('  Demo User:  demo@electrobyte.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
