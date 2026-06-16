const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const dotenv = require('dotenv');

dotenv.config();

const employees = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@traveltech.com',
    phone: '+1-555-0123',
    role: 'Senior Travel Consultant',
    department: 'Travel Planning',
    specialties: ['Europe', 'Luxury Travel', 'Cruises'],
    languages: ['English', 'Spanish', 'French'],
    experience: 8,
    rating: 4.9,
    totalReviews: 127,
    availability: 'Mon-Fri 9AM-6PM EST',
    status: 'available',
    responseTime: 'Instant',
    bio: 'Specialized in European luxury travel with 8 years of experience crafting unforgettable journeys.'
  },
  {
    name: 'Michael Chen',
    email: 'michael.c@traveltech.com',
    phone: '+1-555-0124',
    role: 'Destination Specialist',
    department: 'Destinations',
    specialties: ['Asia', 'Adventure Travel', 'Cultural Tours'],
    languages: ['English', 'Mandarin', 'Japanese'],
    experience: 6,
    rating: 4.8,
    totalReviews: 94,
    availability: 'Mon-Sat 8AM-8PM EST',
    status: 'available',
    responseTime: 'Under 2 min',
    bio: 'Asia expert with passion for adventure travel and cultural immersion experiences.'
  },
  {
    name: 'Emma Rodriguez',
    email: 'emma.r@traveltech.com',
    phone: '+1-555-0125',
    role: 'Customer Support Lead',
    department: 'Support',
    specialties: ['Problem Resolution', 'Emergency Support', 'Booking Issues'],
    languages: ['English', 'Spanish'],
    experience: 5,
    rating: 4.95,
    totalReviews: 203,
    availability: '24/7',
    status: 'busy',
    responseTime: 'Under 5 min',
    bio: 'Dedicated to resolving customer issues quickly and efficiently with 24/7 availability.'
  },
  {
    name: 'David Kim',
    email: 'david.k@traveltech.com',
    phone: '+1-555-0126',
    role: 'Hotel & Accommodation Expert',
    department: 'Accommodations',
    specialties: ['Hotels', 'Resorts', 'Vacation Rentals'],
    languages: ['English', 'Korean'],
    experience: 7,
    rating: 4.7,
    totalReviews: 86,
    availability: 'Mon-Fri 9AM-7PM EST',
    status: 'available',
    responseTime: 'Instant',
    bio: 'Hotel specialist helping travelers find perfect accommodations worldwide.'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.s@traveltech.com',
    phone: '+1-555-0127',
    role: 'Flight & Transportation Specialist',
    department: 'Transportation',
    specialties: ['Flights', 'Car Rentals', 'Rail Passes'],
    languages: ['English', 'Hindi'],
    experience: 4,
    rating: 4.85,
    totalReviews: 67,
    availability: 'Mon-Sun 6AM-10PM EST',
    status: 'offline',
    responseTime: 'Under 10 min',
    bio: 'Transportation expert ensuring smooth travel from airport to destination.'
  },
  {
    name: 'James Wilson',
    email: 'james.w@traveltech.com',
    phone: '+1-555-0128',
    role: 'Family Travel Specialist',
    department: 'Travel Planning',
    specialties: ['Family Vacations', 'Theme Parks', 'Kid-Friendly Destinations'],
    languages: ['English'],
    experience: 9,
    rating: 4.92,
    totalReviews: 156,
    availability: 'Mon-Fri 8AM-5PM EST',
    status: 'available',
    responseTime: 'Under 3 min',
    bio: 'Creating magical family memories with tailored vacation experiences.'
  },
  {
    name: 'Maria Santos',
    email: 'maria.s@traveltech.com',
    phone: '+1-555-0129',
    role: 'Budget Travel Advisor',
    department: 'Travel Planning',
    specialties: ['Budget Travel', 'Backpacking', 'Group Discounts'],
    languages: ['English', 'Portuguese', 'Spanish'],
    experience: 5,
    rating: 4.88,
    totalReviews: 78,
    availability: 'Tue-Sat 10AM-6PM EST',
    status: 'available',
    responseTime: 'Under 5 min',
    bio: 'Helping travelers explore the world affordably without compromising quality.'
  },
  {
    name: 'Robert Taylor',
    email: 'robert.t@traveltech.com',
    phone: '+1-555-0130',
    role: 'Business Travel Coordinator',
    department: 'Travel Planning',
    specialties: ['Corporate Travel', 'Business Meetings', 'Conference Planning'],
    languages: ['English', 'German'],
    experience: 12,
    rating: 4.95,
    totalReviews: 234,
    availability: 'Mon-Fri 7AM-8PM EST',
    status: 'busy',
    responseTime: 'Under 1 min',
    bio: 'Streamlining business travel with efficient booking and coordination services.'
  }
];

const seedEmployees = async () => {
  try {
    const dbUri = process.env.MONGODB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-travel-assistant';
    const maskedUri = dbUri.replace(/\/\/([^:]+):([^@]+)@/, '//xxxx:xxxx@');
    console.log(`Connecting to MongoDB at: ${maskedUri}`);
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Clear existing employees
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    // Insert new employees
    await Employee.insertMany(employees);
    console.log('Employees seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
};

seedEmployees();