require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Offer = require('./models/Offer');
const Coupon = require('./models/Coupon');

const seedData = async () => {
    try {
        await connectDB();
        console.log('Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            Offer.deleteMany({}),
            Coupon.deleteMany({})
        ]);

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@krishnamarketing.com',
            phone: '9999999999',
            password: 'Admin@123',
            role: 'superadmin',
            isVerified: true
        });
        console.log('Admin created: admin@krishnamarketing.com / Admin@123');

        // Create test customer
        const customer = await User.create({
            name: 'Test Customer',
            email: 'customer@test.com',
            phone: '8888888888',
            password: 'Customer@123',
            role: 'customer',
            isVerified: true,
            loyaltyPoints: 500
        });
        console.log('Customer created: customer@test.com / Customer@123');

        // Create Categories
        const categoriesList = [
            { name: 'Fruits & Vegetables', description: 'Fresh fruits and vegetables', icon: '🥬', sortOrder: 1 },
            { name: 'Dairy & Bread', description: 'Milk, cheese, bread and more', icon: '🥛', sortOrder: 2 },
            { name: 'Snacks & Beverages', description: 'Chips, drinks, juices', icon: '🍿', sortOrder: 3 },
            { name: 'Staples', description: 'Rice, dal, oil, flour', icon: '🌾', sortOrder: 4 },
            { name: 'Personal Care', description: 'Soaps, shampoo, skincare', icon: '🧴', sortOrder: 5 },
            { name: 'Cleaning', description: 'Detergent, cleaners, mops', icon: '🧹', sortOrder: 6 },
            { name: 'Masala & Spices', description: 'All cooking spices', icon: '🌶️', sortOrder: 7 },
            { name: 'Frozen Foods', description: 'Frozen items and ice cream', icon: '🧊', sortOrder: 8 }
        ].map(c => ({ ...c, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));

        const categories = await Category.insertMany(categoriesList);
        console.log(`${categories.length} categories created`);

        // Create Subcategories
        const subcategoriesList = [
            { name: 'Fresh Vegetables', parent: categories[0]._id, sortOrder: 1 },
            { name: 'Fresh Fruits', parent: categories[0]._id, sortOrder: 2 },
            { name: 'Exotic Fruits', parent: categories[0]._id, sortOrder: 3 },
            { name: 'Milk', parent: categories[1]._id, sortOrder: 1 },
            { name: 'Bread & Bakery', parent: categories[1]._id, sortOrder: 2 },
            { name: 'Cheese & Butter', parent: categories[1]._id, sortOrder: 3 },
            { name: 'Chips & Namkeen', parent: categories[2]._id, sortOrder: 1 },
            { name: 'Cold Drinks', parent: categories[2]._id, sortOrder: 2 },
            { name: 'Rice & Flour', parent: categories[3]._id, sortOrder: 1 },
            { name: 'Dal & Pulses', parent: categories[3]._id, sortOrder: 2 },
            { name: 'Cooking Oil', parent: categories[3]._id, sortOrder: 3 }
        ].map(c => ({ ...c, slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));

        const subcategories = await Category.insertMany(subcategoriesList);

        // Create Products
        const productsList = [
            {
                name: 'Fresh Tomato', category: categories[0]._id, subcategory: subcategories[0]._id,
                price: 30, mrp: 40, unit: 'kg', unitValue: '1', stock: 100, brand: 'Farm Fresh',
                description: 'Fresh red tomatoes sourced directly from local farms',
                images: [{ url: '/uploads/tomato.jpg', alt: 'Tomato', isPrimary: true }],
                isFeatured: true, isPopular: true, tags: ['vegetable', 'fresh', 'tomato']
            },
            {
                name: 'Onion', category: categories[0]._id, subcategory: subcategories[0]._id,
                price: 25, mrp: 35, unit: 'kg', unitValue: '1', stock: 150, brand: 'Farm Fresh',
                description: 'Fresh onions, essential for every kitchen',
                images: [{ url: '/uploads/onion.jpg', alt: 'Onion', isPrimary: true }],
                isPopular: true, tags: ['vegetable', 'onion']
            },
            {
                name: 'Potato', category: categories[0]._id, subcategory: subcategories[0]._id,
                price: 20, mrp: 30, unit: 'kg', unitValue: '1', stock: 200, brand: 'Farm Fresh',
                description: 'Fresh potatoes, perfect for curries and fries',
                images: [{ url: '/uploads/potato.jpg', alt: 'Potato', isPrimary: true }],
                isPopular: true, tags: ['vegetable', 'potato']
            },
            {
                name: 'Fresh Banana', category: categories[0]._id, subcategory: subcategories[1]._id,
                price: 40, mrp: 50, unit: 'dozen', unitValue: '1', stock: 80, brand: 'Farm Fresh',
                description: 'Sweet and fresh bananas',
                images: [{ url: '/uploads/banana.jpg', alt: 'Banana', isPrimary: true }],
                isFeatured: true, tags: ['fruit', 'banana']
            },
            {
                name: 'Apple (Shimla)', category: categories[0]._id, subcategory: subcategories[1]._id,
                price: 120, mrp: 150, unit: 'kg', unitValue: '1', stock: 60, brand: 'Himachal Fresh',
                description: 'Premium Shimla apples',
                images: [{ url: '/uploads/apple.jpg', alt: 'Apple', isPrimary: true }],
                isFeatured: true, tags: ['fruit', 'apple']
            },
            {
                name: 'Amul Taza Milk', category: categories[1]._id, subcategory: subcategories[3]._id,
                price: 25, mrp: 25, unit: 'l', unitValue: '0.5', stock: 200, brand: 'Amul',
                description: 'Amul Taza homogenized toned milk',
                images: [{ url: '/uploads/amul-milk.jpg', alt: 'Amul Milk', isPrimary: true }],
                isPopular: true, isFeatured: true,
                variants: [
                    { name: 'Size', value: '500ml', price: 25, mrp: 25, stock: 100, sku: 'AMUL-500' },
                    { name: 'Size', value: '1L', price: 48, mrp: 48, stock: 100, sku: 'AMUL-1L' }
                ],
                tags: ['milk', 'dairy', 'amul']
            },
            {
                name: 'Britannia Bread', category: categories[1]._id, subcategory: subcategories[4]._id,
                price: 40, mrp: 45, unit: 'pack', unitValue: '1', stock: 100, brand: 'Britannia',
                description: 'Soft and fresh white bread',
                images: [{ url: '/uploads/bread.jpg', alt: 'Bread', isPrimary: true }],
                isPopular: true, tags: ['bread', 'bakery']
            },
            {
                name: 'Amul Butter', category: categories[1]._id, subcategory: subcategories[5]._id,
                price: 52, mrp: 56, unit: 'pack', unitValue: '100g', stock: 80, brand: 'Amul',
                description: 'Utterly butterly delicious',
                images: [{ url: '/uploads/butter.jpg', alt: 'Amul Butter', isPrimary: true }],
                isFeatured: true, tags: ['butter', 'dairy', 'amul']
            },
            {
                name: 'Lays Classic Salted', category: categories[2]._id, subcategory: subcategories[6]._id,
                price: 20, mrp: 20, unit: 'pack', unitValue: '52g', stock: 150, brand: 'Lays',
                description: 'Lays classic salted potato chips',
                images: [{ url: '/uploads/lays.jpg', alt: 'Lays', isPrimary: true }],
                isPopular: true,
                variants: [
                    { name: 'Size', value: 'Small (52g)', price: 20, mrp: 20, stock: 100, sku: 'LAYS-S' },
                    { name: 'Size', value: 'Large (115g)', price: 40, mrp: 40, stock: 50, sku: 'LAYS-L' }
                ],
                tags: ['chips', 'snacks', 'lays']
            },
            {
                name: 'Coca-Cola', category: categories[2]._id, subcategory: subcategories[7]._id,
                price: 40, mrp: 40, unit: 'l', unitValue: '750ml', stock: 120, brand: 'Coca-Cola',
                description: 'Refreshing Coca-Cola',
                images: [{ url: '/uploads/coke.jpg', alt: 'Coca-Cola', isPrimary: true }],
                isPopular: true, tags: ['cold drink', 'beverage', 'coca-cola']
            },
            {
                name: 'India Gate Basmati Rice', category: categories[3]._id, subcategory: subcategories[8]._id,
                price: 180, mrp: 210, unit: 'kg', unitValue: '1', stock: 50, brand: 'India Gate',
                description: 'Premium basmati rice',
                images: [{ url: '/uploads/rice.jpg', alt: 'Rice', isPrimary: true }],
                isFeatured: true,
                variants: [
                    { name: 'Weight', value: '1 Kg', price: 180, mrp: 210, stock: 30, sku: 'IG-1KG' },
                    { name: 'Weight', value: '5 Kg', price: 850, mrp: 1000, stock: 20, sku: 'IG-5KG' }
                ],
                tags: ['rice', 'basmati', 'staples']
            },
            {
                name: 'Toor Dal', category: categories[3]._id, subcategory: subcategories[9]._id,
                price: 120, mrp: 140, unit: 'kg', unitValue: '1', stock: 70, brand: 'Tata Sampann',
                description: 'Premium unpolished toor dal',
                images: [{ url: '/uploads/toordal.jpg', alt: 'Toor Dal', isPrimary: true }],
                isPopular: true, tags: ['dal', 'pulses', 'staples']
            },
            {
                name: 'Fortune Sunflower Oil', category: categories[3]._id, subcategory: subcategories[10]._id,
                price: 150, mrp: 175, unit: 'l', unitValue: '1', stock: 45, brand: 'Fortune',
                description: 'Refined sunflower oil',
                images: [{ url: '/uploads/oil.jpg', alt: 'Sunflower Oil', isPrimary: true }],
                isFeatured: true, tags: ['oil', 'cooking oil', 'staples']
            },
            {
                name: 'Dettol Soap', category: categories[4]._id,
                price: 42, mrp: 48, unit: 'pack', unitValue: '75g', stock: 100, brand: 'Dettol',
                description: 'Dettol original antibacterial soap',
                images: [{ url: '/uploads/dettol.jpg', alt: 'Dettol', isPrimary: true }],
                tags: ['soap', 'personal care', 'dettol']
            },
            {
                name: 'MDH Chana Masala', category: categories[6]._id,
                price: 65, mrp: 72, unit: 'pack', unitValue: '100g', stock: 90, brand: 'MDH',
                description: 'MDH chana masala for perfect chana',
                images: [{ url: '/uploads/mdh.jpg', alt: 'MDH Masala', isPrimary: true }],
                isPopular: true, tags: ['masala', 'spices', 'mdh']
            }
        ].map(p => {
            const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const discount = (p.mrp > 0 && p.price < p.mrp) ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
            return { ...p, slug, discount };
        });

        const products = await Product.insertMany(productsList);
        console.log(`${products.length} products created`);

        // Create Offers
        const now = new Date();
        const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        await Offer.insertMany([
            {
                title: 'Fresh Vegetables Sale!',
                description: 'Get 20% off on all fresh vegetables',
                type: 'percentage', value: 20, minOrderAmount: 200,
                startDate: now, endDate: monthLater, isActive: true, isBanner: true,
                bannerImage: '/uploads/banner-veggies.jpg', sortOrder: 1
            },
            {
                title: 'Free Delivery',
                description: 'Free delivery on orders above ₹500',
                type: 'freeDelivery', value: 0, minOrderAmount: 500,
                startDate: now, endDate: monthLater, isActive: true, isBanner: true,
                bannerImage: '/uploads/banner-delivery.jpg', sortOrder: 2
            },
            {
                title: 'Dairy Bonanza',
                description: 'Flat ₹50 off on dairy products',
                type: 'flat', value: 50, minOrderAmount: 300,
                startDate: now, endDate: monthLater, isActive: true, isBanner: true,
                bannerImage: '/uploads/banner-dairy.jpg', sortOrder: 3
            }
        ]);
        console.log('3 offers created');

        // Create Coupons
        await Coupon.insertMany([
            {
                code: 'WELCOME50',
                description: 'Get ₹50 off on your first order',
                type: 'flat', value: 50, minOrderAmount: 200, maxUsagePerUser: 1,
                startDate: now, endDate: monthLater, isActive: true
            },
            {
                code: 'SAVE20',
                description: 'Get 20% off up to ₹100',
                type: 'percentage', value: 20, maxDiscount: 100, minOrderAmount: 300,
                startDate: now, endDate: monthLater, isActive: true
            },
            {
                code: 'KRISHNA100',
                description: 'Flat ₹100 off on orders above ₹500',
                type: 'flat', value: 100, minOrderAmount: 500,
                startDate: now, endDate: monthLater, isActive: true
            }
        ]);
        console.log('3 coupons created');

        console.log('\n✅ Database seeded successfully!');
        console.log('Admin created: admin@krishnamarketing.com / Admin@123');

        console.log('\nAdmin Login: admin@krishnamarketing.com / Admin@123');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        if (error.errors) console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

seedData();
