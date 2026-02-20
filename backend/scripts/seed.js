const { loadEnv } = require('../src/config/loadEnv');
loadEnv();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const Category = require('../src/models/Category');
const Cart = require('../src/models/Cart');
const Address = require('../src/models/Address');
const AuditLog = require('../src/models/AuditLog');
const buildSampleProducts = require('../src/data/sampleProducts');

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Cart.deleteMany({}),
      Address.deleteMany({}),
      Order.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    const [menCategory, womenCategory] = await Category.create([
      {
        name: 'Men',
        slug: 'men',
        parentCategory: null,
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Women',
        slug: 'women',
        parentCategory: null,
        isActive: true,
        sortOrder: 2
      }
    ]);

    const [admin, shopper] = await User.create([
      {
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@fashionnova.local',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        profile: { firstName: 'Admin', lastName: 'User', phone: '' },
        address: 'New York, USA',
        isActive: true,
        isDeleted: false
      },
      {
        name: 'Demo Shopper',
        email: process.env.DEMO_USER_EMAIL || 'user@fashionnova.local',
        password: process.env.DEMO_USER_PASSWORD || 'User@123',
        role: 'user',
        profile: { firstName: 'Demo', lastName: 'Shopper', phone: '' },
        address: 'California, USA',
        isActive: true,
        isDeleted: false
      }
    ]);

    await Address.create([
      {
        userId: admin._id,
        label: 'Primary',
        name: admin.name,
        line1: 'New York, USA',
        country: 'USA',
        isDefault: true,
        isActive: true,
        isDeleted: false
      },
      {
        userId: shopper._id,
        label: 'Primary',
        name: shopper.name,
        line1: 'California, USA',
        country: 'USA',
        isDefault: true,
        isActive: true,
        isDeleted: false
      }
    ]);

    await Cart.create([
      { userId: admin._id, items: [], isActive: true },
      { userId: shopper._id, items: [], isActive: true }
    ]);

    const categoryIdMap = {
      men: menCategory._id,
      women: womenCategory._id
    };

    const products = buildSampleProducts().map((product) => ({
      ...product,
      categoryRef: categoryIdMap[product.category] || null,
      categoryPath: [product.category]
    }));

    await Product.insertMany(products);

    console.log('Seed completed successfully');
    console.log(`Admin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log(`User login: ${shopper.email} / ${process.env.DEMO_USER_PASSWORD || 'User@123'}`);
    console.log('Collections seeded: users, products, categories, carts, orders, addresses, audit_logs');

    await mongoose.connection.close();
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();
