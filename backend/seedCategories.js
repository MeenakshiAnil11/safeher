import mongoose from 'mongoose';
import Category from './models/Category.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/safeher');

    const categories = [
      { name: 'Basics', description: 'Fundamental menstrual health information' },
      { name: 'Wellness', description: 'Health and wellness tips' },
      { name: 'Advanced', description: 'In-depth menstrual health topics' },
      { name: 'Mental Health', description: 'Mental health and emotional well-being' },
      { name: 'Health', description: 'Medical and health-related content' }
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create(cat);
        console.log('Created category:', cat.name);
      } else {
        console.log('Category already exists:', cat.name);
      }
    }

    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
