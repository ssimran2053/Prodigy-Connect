import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@prodigyconnect.com',
        password: 'password123',
        role: 'admin',
        location: 'Sacramento, CA',
        bio: 'Platform administrator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'provider',
        location: 'Sacramento, CA',
        bio: 'Experienced math tutor with 10+ years helping students excel',
        phone: '+1 (555) 123-4567',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        rating: 4.8,
        totalReviews: 24,
        completedJobs: 45
      },
      {
        name: 'Mike Chen',
        email: 'mike@example.com',
        password: 'password123',
        role: 'provider',
        location: 'Sacramento, CA',
        bio: 'Professional plumber - residential and commercial services',
        phone: '+1 (555) 234-5678',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        rating: 4.9,
        totalReviews: 67,
        completedJobs: 120
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily@example.com',
        password: 'password123',
        role: 'seeker',
        location: 'Sacramento, CA',
        phone: '+1 (555) 345-6789',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily'
      },
      {
        name: 'James Wilson',
        email: 'james@example.com',
        password: 'password123',
        role: 'seeker',
        location: 'Sacramento, CA',
        phone: '+1 (555) 456-7890',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'
      }
    ]);

    console.log('✅ Created users');

    // Create services
    const services = await Service.create([
      {
        title: 'Mathematics Tutoring - Algebra to Calculus',
        description: 'Personalized one-on-one math tutoring for high school and college students. Specializing in Algebra, Geometry, Trigonometry, and Calculus.',
        category: 'Tutoring',
        subcategory: 'Math',
        provider: users[1]._id,
        price: { amount: 45, type: 'hourly' },
        location: {
          address: '123 Main St',
          city: 'Sacramento',
          state: 'CA',
          zipCode: '95814',
          coordinates: { lat: 38.5816, lng: -121.4944 }
        },
        availability: 'available',
        tags: ['math', 'tutoring', 'algebra', 'calculus', 'homework help'],
        images: ['https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800'],
        rating: 4.8,
        totalReviews: 24,
        totalBookings: 45,
        isActive: true
      },
      {
        title: 'Plumbing Repair & Installation',
        description: 'Professional plumbing services for homes and businesses. Emergency repairs, fixture installation, drain cleaning, and water heater services.',
        category: 'Home Services',
        subcategory: 'Plumbing',
        provider: users[2]._id,
        price: { amount: 85, type: 'hourly' },
        location: {
          address: '456 Oak Ave',
          city: 'Sacramento',
          state: 'CA',
          zipCode: '95814',
          coordinates: { lat: 38.5816, lng: -121.4944 }
        },
        availability: 'available',
        tags: ['plumbing', 'repair', 'emergency', 'installation'],
        images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800'],
        rating: 4.9,
        totalReviews: 67,
        totalBookings: 120,
        isActive: true,
        isFeatured: true
      }
    ]);

    console.log('✅ Created services');

    // Create bookings
    const bookings = await Booking.create([
      {
        service: services[0]._id,
        seeker: users[3]._id,
        provider: users[1]._id,
        scheduledDate: new Date('2024-12-20'),
        scheduledTime: '14:00',
        duration: 2,
        status: 'confirmed',
        price: { amount: 90 },
        payment: { status: 'paid', method: 'card' },
        notes: 'Need help with calculus homework',
        location: {
          address: '789 Elm St',
          city: 'Sacramento',
          state: 'CA',
          type: 'seeker-location'
        }
      },
      {
        service: services[1]._id,
        seeker: users[4]._id,
        provider: users[2]._id,
        scheduledDate: new Date('2024-11-15'),
        scheduledTime: '10:00',
        duration: 3,
        status: 'completed',
        price: { amount: 255 },
        payment: { status: 'paid', method: 'card', paidAt: new Date('2024-11-15') },
        notes: 'Kitchen sink leak repair',
        completedAt: new Date('2024-11-15'),
        location: {
          address: '321 Pine St',
          city: 'Sacramento',
          state: 'CA',
          type: 'seeker-location'
        }
      }
    ]);

    console.log('✅ Created bookings');

    // Create reviews
    const reviews = await Review.create([
      {
        service: services[1]._id,
        provider: users[2]._id,
        seeker: users[4]._id,
        booking: bookings[1]._id,
        rating: 5,
        comment: 'Mike was professional, on time, and fixed the issue quickly. Highly recommend!',
        isVerified: true
      }
    ]);

    console.log('✅ Created reviews');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Test Accounts:');
    console.log('   Admin:    admin@prodigyconnect.com / password123');
    console.log('   Provider: sarah@example.com / password123');
    console.log('   Provider: mike@example.com / password123');
    console.log('   Seeker:   emily@example.com / password123');
    console.log('   Seeker:   james@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
