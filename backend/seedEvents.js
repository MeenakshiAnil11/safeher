import mongoose from 'mongoose';
import Event from './models/Event.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function seedEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/safeher');

    const events = [
      {
        title: 'Women\'s Safety Workshop',
        description: 'Learn essential self-defense techniques and safety strategies in this interactive workshop.',
        date: new Date('2024-12-15'),
        time: '14:00',
        location: 'Community Center, Downtown',
        url: 'https://example.com/register-workshop',
        published: true
      },
      {
        title: 'Mental Health Awareness Webinar',
        description: 'Join our experts for a discussion on mental health challenges and coping strategies.',
        date: new Date('2024-12-20'),
        time: '18:00',
        location: 'Online',
        url: 'https://zoom.us/webinar/mental-health',
        published: true
      },
      {
        title: 'Period Health & Wellness Seminar',
        description: 'Comprehensive session on menstrual health, cycle tracking, and wellness practices.',
        date: new Date('2025-01-10'),
        time: '10:00',
        location: 'Women\'s Health Clinic',
        url: 'https://example.com/period-seminar',
        published: true
      },
      {
        title: 'Emergency Preparedness Training',
        description: 'Learn how to prepare for and respond to emergency situations effectively.',
        date: new Date('2025-01-25'),
        time: '16:00',
        location: 'City Hall Auditorium',
        url: 'https://example.com/emergency-training',
        published: true
      }
    ];

    for (const eventData of events) {
      const existing = await Event.findOne({ title: eventData.title });
      if (!existing) {
        await Event.create(eventData);
        console.log('Created event:', eventData.title);
      } else {
        console.log('Event already exists:', eventData.title);
      }
    }

    console.log('Events seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

seedEvents();
