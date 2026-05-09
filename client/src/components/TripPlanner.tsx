import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../App.css'; // Import global styles for animations
import { useTrip } from '../context/TripContext';
import { dataAPI, itineraryAPI, hotelAPI } from '../services/api';
import { 
  MapPin, Calendar, DollarSign, Sparkles, Search, 
  Loader2, Globe, CheckCircle, X, Bed, Star
} from 'lucide-react';

// Declare Google Translate types
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

const INTERESTS = [
  { id: 'culture', label: 'Culture', icon: '🎭' },
  { id: 'food', label: 'Food', icon: '🍽️' },
  { id: 'nature', label: 'Nature', icon: '🌲' },
  { id: 'adventure', label: 'Adventure', icon: '🏔️' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { id: 'history', label: 'History', icon: '🏛️' },
  { id: 'art', label: 'Art', icon: '🎨' },
];

// Currency data by country
const CURRENCY_DATA: Record<string, { code: string; symbol: string; name: string; rates: { low: number; medium: number; high: number } }> = {
  'united states': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 100, medium: 250, high: 500 } },
  'usa': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 100, medium: 250, high: 500 } },
  'new york': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'los angeles': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 120, medium: 300, high: 600 } },
  'chicago': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 110, medium: 280, high: 550 } },
  'san francisco': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'las vegas': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 120, medium: 300, high: 600 } },
  'miami': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 130, medium: 320, high: 650 } },
  'boston': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 140, medium: 340, high: 680 } },
  'seattle': { code: 'USD', symbol: '$', name: 'US Dollar', rates: { low: 120, medium: 300, high: 600 } },
  'united kingdom': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 80, medium: 200, high: 400 } },
  'uk': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 80, medium: 200, high: 400 } },
  'london': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 100, medium: 250, high: 500 } },
  'manchester': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 70, medium: 180, high: 350 } },
  'edinburgh': { code: 'GBP', symbol: '£', name: 'British Pound', rates: { low: 75, medium: 190, high: 380 } },
  'european union': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'france': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'paris': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 100, medium: 250, high: 500 } },
  'nice': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 85, medium: 210, high: 420 } },
  'lyon': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 75, medium: 190, high: 380 } },
  'germany': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'berlin': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 80, medium: 200, high: 400 } },
  'munich': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 85, medium: 210, high: 420 } },
  'italy': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 80, medium: 200, high: 400 } },
  'rome': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 85, medium: 210, high: 420 } },
  'milan': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'venice': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 95, medium: 240, high: 480 } },
  'spain': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 70, medium: 180, high: 350 } },
  'barcelona': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 75, medium: 190, high: 380 } },
  'madrid': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 70, medium: 180, high: 350 } },
  'netherlands': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 90, medium: 220, high: 450 } },
  'amsterdam': { code: 'EUR', symbol: '€', name: 'Euro', rates: { low: 95, medium: 240, high: 480 } },
  'japan': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 10000, medium: 25000, high: 50000 } },
  'tokyo': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 12000, medium: 30000, high: 60000 } },
  'osaka': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 10000, medium: 25000, high: 50000 } },
  'kyoto': { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rates: { low: 10000, medium: 25000, high: 50000 } },
  'china': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rates: { low: 500, medium: 1200, high: 2500 } },
  'beijing': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rates: { low: 500, medium: 1200, high: 2500 } },
  'shanghai': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rates: { low: 550, medium: 1300, high: 2700 } },
  'india': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'mumbai': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'delhi': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'bangalore': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'bengaluru': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'hyderabad': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'chennai': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'kolkata': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'pune': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'jaipur': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'agra': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'goa': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'kerala': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'varanasi': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'udaipur': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'jodhpur': { code: 'INR', symbol: '₹', name: 'Indian Rupee', rates: { low: 3000, medium: 8000, high: 15000 } },
  'australia': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'canada': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rates: { low: 130, medium: 320, high: 650 } },
  'brazil': { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rates: { low: 300, medium: 750, high: 1500 } },
  'mexico': { code: 'MXN', symbol: '$', name: 'Mexican Peso', rates: { low: 1500, medium: 4000, high: 8000 } },
  'thailand': { code: 'THB', symbol: '฿', name: 'Thai Baht', rates: { low: 2500, medium: 6000, high: 12000 } },
  'singapore': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rates: { low: 130, medium: 320, high: 650 } },
  'south korea': { code: 'KRW', symbol: '₩', name: 'South Korean Won', rates: { low: 100000, medium: 250000, high: 500000 } },
  'switzerland': { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', rates: { low: 100, medium: 250, high: 500 } },
  'sweden': { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rates: { low: 900, medium: 2200, high: 4500 } },
  'norway': { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rates: { low: 900, medium: 2200, high: 4500 } },
  'denmark': { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rates: { low: 600, medium: 1500, high: 3000 } },
  'poland': { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rates: { low: 350, medium: 900, high: 1800 } },
  'turkey': { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rates: { low: 2000, medium: 5000, high: 10000 } },
  'russia': { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rates: { low: 6000, medium: 15000, high: 30000 } },
  'south africa': { code: 'ZAR', symbol: 'R', name: 'South African Rand', rates: { low: 1500, medium: 4000, high: 8000 } },
  'uae': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rates: { low: 350, medium: 900, high: 1800 } },
  'dubai': { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rates: { low: 350, medium: 900, high: 1800 } },
  'egypt': { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rates: { low: 2000, medium: 5000, high: 10000 } },
  'indonesia': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rates: { low: 1000000, medium: 2500000, high: 5000000 } },
  'malaysia': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rates: { low: 400, medium: 1000, high: 2000 } },
  'vietnam': { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rates: { low: 2000000, medium: 5000000, high: 10000000 } },
  'philippines': { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rates: { low: 4000, medium: 10000, high: 20000 } },
  'new zealand': { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', rates: { low: 150, medium: 350, high: 700 } },
  'argentina': { code: 'ARS', symbol: '$', name: 'Argentine Peso', rates: { low: 50000, medium: 125000, high: 250000 } },
  'chile': { code: 'CLP', symbol: '$', name: 'Chilean Peso', rates: { low: 70000, medium: 175000, high: 350000 } },
  'colombia': { code: 'COP', symbol: '$', name: 'Colombian Peso', rates: { low: 300000, medium: 750000, high: 1500000 } },
  'peru': { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', rates: { low: 300, medium: 750, high: 1500 } },
  'morocco': { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', rates: { low: 800, medium: 2000, high: 4000 } },
  'kenya': { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rates: { low: 10000, medium: 25000, high: 50000 } },
  'nigeria': { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rates: { low: 50000, medium: 125000, high: 250000 } },
  'israel': { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', rates: { low: 350, medium: 900, high: 1800 } },
  'saudi arabia': { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rates: { low: 350, medium: 900, high: 1800 } },
  'pakistan': { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rates: { low: 20000, medium: 50000, high: 100000 } },
  'bangladesh': { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rates: { low: 8000, medium: 20000, high: 40000 } },
  'sri lanka': { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', rates: { low: 25000, medium: 60000, high: 120000 } },
};

const getCurrencyForDestination = (destination: string) => {
  if (!destination) return null;
  const destLower = destination.toLowerCase();
  
  // Priority 1: Check for major cities first (more specific)
  const cityMappings: Record<string, string> = {
    // China cities
    'beijing': 'CNY', 'shanghai': 'CNY', 'guangzhou': 'CNY', 'shenzhen': 'CNY',
    'chengdu': 'CNY', 'hangzhou': 'CNY', 'xian': 'CNY', 'xi\'an': 'CNY',
    'nanjing': 'CNY', 'wuhan': 'CNY', 'tianjin': 'CNY', 'chongqing': 'CNY',
    'suzhou': 'CNY', 'dalian': 'CNY', 'qingdao': 'CNY', 'xiamen': 'CNY',
    // India cities
    'mumbai': 'INR', 'delhi': 'INR', 'bangalore': 'INR', 'bengaluru': 'INR',
    'hyderabad': 'INR', 'chennai': 'INR', 'kolkata': 'INR', 'pune': 'INR',
    'jaipur': 'INR', 'agra': 'INR', 'goa': 'INR', 'kerala': 'INR',
    'varanasi': 'INR', 'udaipur': 'INR', 'jodhpur': 'INR', 'amritsar': 'INR',
    // Japan cities
    'tokyo': 'JPY', 'osaka': 'JPY', 'kyoto': 'JPY', 'yokohama': 'JPY',
    'nagoya': 'JPY', 'sapporo': 'JPY', 'fukuoka': 'JPY', 'kobe': 'JPY',
    // UK cities
    'london': 'GBP', 'manchester': 'GBP', 'edinburgh': 'GBP', 'birmingham': 'GBP',
    'glasgow': 'GBP', 'liverpool': 'GBP', 'bristol': 'GBP', 'leeds': 'GBP',
    // US cities
    'new york': 'USD', 'los angeles': 'USD', 'chicago': 'USD', 'san francisco': 'USD',
    'las vegas': 'USD', 'miami': 'USD', 'boston': 'USD', 'seattle': 'USD',
    'washington': 'USD', 'philadelphia': 'USD', 'atlanta': 'USD', 'houston': 'USD',
    // France cities
    'paris': 'EUR', 'nice': 'EUR', 'lyon': 'EUR', 'marseille': 'EUR',
    'toulouse': 'EUR', 'bordeaux': 'EUR', 'strasbourg': 'EUR',
    // Germany cities
    'berlin': 'EUR', 'munich': 'EUR', 'hamburg': 'EUR', 'cologne': 'EUR',
    'frankfurt': 'EUR', 'stuttgart': 'EUR', 'dusseldorf': 'EUR',
    // Italy cities
    'rome': 'EUR', 'milan': 'EUR', 'venice': 'EUR', 'florence': 'EUR',
    'naples': 'EUR', 'turin': 'EUR', 'bologna': 'EUR',
    // Spain cities
    'barcelona': 'EUR', 'madrid': 'EUR', 'seville': 'EUR', 'valencia': 'EUR',
    'granada': 'EUR', 'malaga': 'EUR',
    // Netherlands cities
    'amsterdam': 'EUR', 'rotterdam': 'EUR', 'the hague': 'EUR',
    // Switzerland cities
    'zurich': 'CHF', 'geneva': 'CHF', 'basel': 'CHF', 'bern': 'CHF',
    'lausanne': 'CHF', 'lucerne': 'CHF',
    // Australia cities
    'sydney': 'AUD', 'melbourne': 'AUD', 'brisbane': 'AUD', 'perth': 'AUD',
    'adelaide': 'AUD', 'gold coast': 'AUD', 'cairns': 'AUD',
    // Canada cities
    'toronto': 'CAD', 'vancouver': 'CAD', 'montreal': 'CAD', 'calgary': 'CAD',
    'ottawa': 'CAD', 'quebec': 'CAD', 'edmonton': 'CAD',
    // Brazil cities
    'rio de janeiro': 'BRL', 'sao paulo': 'BRL', 'brasilia': 'BRL',
    'salvador': 'BRL', 'fortaleza': 'BRL',
    // Mexico cities
    'mexico city': 'MXN', 'cancun': 'MXN', 'guadalajara': 'MXN',
    'tijuana': 'MXN', 'puerto vallarta': 'MXN',
    // Thailand cities
    'bangkok': 'THB', 'phuket': 'THB', 'chiang mai': 'THB', 'pattaya': 'THB',
    // Singapore
    'singapore': 'SGD',
    // South Korea cities
    'seoul': 'KRW', 'busan': 'KRW', 'incheon': 'KRW', 'jeju': 'KRW',
    // UAE cities
    'dubai': 'AED', 'abu dhabi': 'AED', 'sharjah': 'AED',
    // Saudi Arabia cities
    'riyadh': 'SAR', 'jeddah': 'SAR', 'mecca': 'SAR', 'medina': 'SAR',
    // Turkey cities
    'istanbul': 'TRY', 'ankara': 'TRY', 'izmir': 'TRY', 'antalya': 'TRY',
    // Russia cities
    'moscow': 'RUB', 'saint petersburg': 'RUB', 'novosibirsk': 'RUB',
    // South Africa cities
    'cape town': 'ZAR', 'johannesburg': 'ZAR', 'durban': 'ZAR',
    'pretoria': 'ZAR',
    // Egypt cities
    'cairo': 'EGP', 'alexandria': 'EGP', 'luxor': 'EGP', 'aswan': 'EGP',
    'sharm el sheikh': 'EGP', 'hurghada': 'EGP',
    // Morocco cities
    'casablanca': 'MAD', 'marrakech': 'MAD', 'rabat': 'MAD', 'fes': 'MAD',
    'tangier': 'MAD', 'agadir': 'MAD',
    // Kenya cities
    'nairobi': 'KES', 'mombasa': 'KES', 'kisumu': 'KES',
    // Israel cities
    'jerusalem': 'ILS', 'tel aviv': 'ILS', 'haifa': 'ILS',
    // Indonesia cities
    'jakarta': 'IDR', 'bali': 'IDR', 'surabaya': 'IDR', 'yogyakarta': 'IDR',
    'bandung': 'IDR', 'lombok': 'IDR',
    // Malaysia cities
    'kuala lumpur': 'MYR', 'penang': 'MYR', 'langkawi': 'MYR', 'malacca': 'MYR',
    // Vietnam cities
    'ho chi minh': 'VND', 'hanoi': 'VND', 'da nang': 'VND', 'nha trang': 'VND',
    'phu quoc': 'VND',
    // Philippines cities
    'manila': 'PHP', 'cebu': 'PHP', 'boracay': 'PHP', 'palawan': 'PHP',
    // New Zealand cities
    'auckland': 'NZD', 'wellington': 'NZD', 'christchurch': 'NZD',
    'queenstown': 'NZD',
    // Argentina cities
    'buenos aires': 'ARS', 'cordoba': 'ARS', 'mendoza': 'ARS',
    'bariloche': 'ARS',
    // Chile cities
    'santiago': 'CLP', 'valparaiso': 'CLP', 'san pedro': 'CLP',
    // Colombia cities
    'bogota': 'COP', 'medellin': 'COP', 'cartagena': 'COP', 'cali': 'COP',
    // Peru cities
    'lima': 'PEN', 'cusco': 'PEN', 'arequipa': 'PEN', 'machu picchu': 'PEN',
    // Pakistan cities
    'karachi': 'PKR', 'lahore': 'PKR', 'islamabad': 'PKR',
    // Bangladesh cities
    'dhaka': 'BDT', 'chittagong': 'BDT', 'sylhet': 'BDT',
    // Sri Lanka cities
    'colombo': 'LKR', 'kandy': 'LKR', 'galle': 'LKR', 'negombo': 'LKR',
    // Poland cities
    'warsaw': 'PLN', 'krakow': 'PLN', 'gdansk': 'PLN', 'wroclaw': 'PLN',
    // Czech Republic cities
    'prague': 'CZK', 'brno': 'CZK', 'karlovy vary': 'CZK',
    // Hungary cities
    'budapest': 'HUF', 'debrecen': 'HUF',
    // Romania cities
    'bucharest': 'RON', 'cluj': 'RON', 'brasov': 'RON',
    // Bulgaria cities
    'sofia': 'BGN', 'plovdiv': 'BGN', 'varna': 'BGN',
    // Croatia cities
    'zagreb': 'HRK', 'dubrovnik': 'HRK', 'split': 'HRK',
    // Norway cities
    'oslo': 'NOK', 'bergen': 'NOK', 'trondheim': 'NOK',
    // Sweden cities
    'stockholm': 'SEK', 'gothenburg': 'SEK', 'malmo': 'SEK',
    // Denmark cities
    'copenhagen': 'DKK', 'aarhus': 'DKK', 'odense': 'DKK',
    // Finland cities
    'helsinki': 'EUR', 'espoo': 'EUR', 'tampere': 'EUR',
    // Austria cities
    'vienna': 'EUR', 'salzburg': 'EUR', 'innsbruck': 'EUR',
    // Belgium cities
    'brussels': 'EUR', 'bruges': 'EUR', 'antwerp': 'EUR', 'ghent': 'EUR',
    // Portugal cities
    'lisbon': 'EUR', 'porto': 'EUR', 'faro': 'EUR', 'madeira': 'EUR',
    // Greece cities
    'athens': 'EUR', 'santorini': 'EUR', 'mykonos': 'EUR', 'crete': 'EUR',
    'rhodes': 'EUR',
  };
  
  // Check for city match first
  for (const [city, currencyCode] of Object.entries(cityMappings)) {
    if (destLower.includes(city)) {
      // Find the full currency data
      for (const [, data] of Object.entries(CURRENCY_DATA)) {
        if (data.code === currencyCode) {
          return data;
        }
      }
    }
  }
  
  // Priority 2: Check for country match
  for (const [country, data] of Object.entries(CURRENCY_DATA)) {
    if (destLower.includes(country)) {
      return data;
    }
  }
  
  // Default to USD only if it's clearly a US location
  if (destLower.includes('united states') || destLower.includes('usa') || 
      destLower.includes(', us') || destLower.includes(', us ')) {
    return CURRENCY_DATA['united states'];
  }
  
  // Try to detect from common patterns
  // If destination has comma, check the part after comma (usually country/state)
  if (destLower.includes(',')) {
    const parts = destLower.split(',').map(p => p.trim());
    for (const part of parts) {
      for (const [country, data] of Object.entries(CURRENCY_DATA)) {
        if (part.includes(country) || country.includes(part)) {
          return data;
        }
      }
    }
  }
  
  // Last resort: return USD with a flag that it's unknown
  return CURRENCY_DATA['united states'];
};

const TripPlanner: React.FC = () => {
  const { preferences, setPreferences, setCurrentItinerary, isGenerating, setIsGenerating } = useTrip();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [customInterests, setCustomInterests] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);
  
  // Import hotelAPI for triggering hotel search
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelResults, setHotelResults] = useState<any[]>([]);

  // Fetch real-time exchange rates when destination changes
  useEffect(() => {
    const fetchExchangeRates = async () => {
      if (!preferences.destination) return;
      
      const currency = getCurrencyForDestination(preferences.destination);
      if (!currency || currency.code === 'USD') {
        setExchangeRates({});
        return;
      }

      setLoadingRates(true);
      try {
        // Using exchangerate-api.com (free tier available)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await response.json();
        setExchangeRates(data.rates);
      } catch (err) {
        console.error('Exchange rate fetch error:', err);
        setExchangeRates({});
      } finally {
        setLoadingRates(false);
      }
    };

    fetchExchangeRates();
  }, [preferences.destination]);

  // Trigger hotel search when destination is selected
  useEffect(() => {
    const searchHotelsForDestination = async () => {
      if (preferences.destination && preferences.destination.trim() !== '') {
        try {
          setLoadingHotels(true);
          console.log('Triggering hotel search for:', preferences.destination);
          
          // Prepare search parameters
          const searchParams = {
            destination: preferences.destination,
            checkIn: preferences.startDate || '',
            checkOut: preferences.startDate ? new Date(new Date(preferences.startDate).setDate(new Date(preferences.startDate).getDate() + (preferences.duration || 3))).toISOString().split('T')[0] : '',
            guests: 2, // Default to 2 guests
            lat: (preferences.lat && !isNaN(preferences.lat)) ? preferences.lat : undefined,
            lng: (preferences.lng && !isNaN(preferences.lng)) ? preferences.lng : undefined
          };
          
          // Perform the hotel search
          const response = await hotelAPI.search(searchParams);
          console.log('Hotel search results:', response.data);
          setHotelResults(response.data.hotels || []);
          
        } catch (error) {
          console.error('Error searching hotels:', error);
        } finally {
          setLoadingHotels(false);
        }
      }
    };
    
    searchHotelsForDestination();
  }, [preferences.destination, preferences.startDate, preferences.duration]);

  const getExchangeRateDisplay = () => {
    const currency = getCurrencyForDestination(preferences.destination);
    if (!currency || currency.code === 'USD' || !exchangeRates[currency.code]) {
      return null;
    }
    return null; // Removed exchange rate display
  };
  useEffect(() => {
    const initGoogleTranslate = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        // Check if already initialized
        const existingWidget = document.getElementById('google_translate_element');
        if (existingWidget && !existingWidget.querySelector('.goog-te-gadget')) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,it,pt,zh-CN,zh-TW,ja,ko,ar,hi,kn,te,ta,bn,mr,gu,ml,pa,ru,tr,nl,pl,sv,no,da,fi,th,vi,id',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
          console.log('Google Translate widget initialized in TripPlanner');
        }
      }
    };

    // Try to initialize immediately
    initGoogleTranslate();

    // Also try after a delay in case script loads slowly
    const timer = setTimeout(initGoogleTranslate, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 2) {
        handleSearch();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await dataAPI.searchPlaces(searchQuery);
      setSearchResults(response.data.places);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectDestination = (place: any) => {
    setPreferences({
      destination: place.fullName,
      lat: place.lat,
      lng: place.lng,
    });
    setSearchQuery(place.name);
    setSearchResults([]);
    
    // Automatically trigger hotel search for the selected destination
    setTimeout(async () => {
      try {
        setLoadingHotels(true);
        console.log('Triggering hotel search for:', place.fullName);
        
        // Prepare search parameters
        const searchParams = {
          destination: place.fullName,
          checkIn: preferences.startDate || '',
          checkOut: preferences.startDate ? new Date(new Date(preferences.startDate).setDate(new Date(preferences.startDate).getDate() + (preferences.duration || 3))).toISOString().split('T')[0] : '',
          guests: 2, // Default to 2 guests
          lat: (place.lat && !isNaN(place.lat)) ? place.lat : undefined,
          lng: (place.lng && !isNaN(place.lng)) ? place.lng : undefined
        };
        
        // Perform the hotel search
        const response = await hotelAPI.search(searchParams);
        console.log('Hotel search results:', response.data);
        setHotelResults(response.data.hotels || []);
        
      } catch (error) {
        console.error('Error searching hotels:', error);
      } finally {
        setLoadingHotels(false);
      }
    }, 100); // Small delay to ensure state is updated
  };

  const toggleInterest = (interestId: string) => {
    const newInterests = preferences.interests.includes(interestId)
      ? preferences.interests.filter((i) => i !== interestId)
      : [...preferences.interests, interestId];
    setPreferences({ interests: newInterests });
  };

  const handleAddCustomInterest = () => {
    if (customInterestInput.trim()) {
      const newInterest = customInterestInput.trim().toLowerCase().replace(/\s+/g, '-');
      if (!customInterests.includes(newInterest)) {
        setCustomInterests([...customInterests, newInterest]);
        setPreferences({ interests: [...preferences.interests, newInterest] });
      }
      setCustomInterestInput('');
    }
  };

  const handleRemoveCustomInterest = (interest: string) => {
    setCustomInterests(customInterests.filter(i => i !== interest));
    setPreferences({ interests: preferences.interests.filter(i => i !== interest) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomInterest();
    }
  };

  const generateItinerary = async () => {
    if (!preferences.destination || preferences.interests.length === 0) {
      setError('Please select a destination and at least one interest');
      return;
    }

    if (!preferences.duration || preferences.duration < 1) {
      setError('Please enter the number of days for your trip');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const itineraryData: any = {
        destination: preferences.destination,
        interests: preferences.interests,
        budget: preferences.budget,
        duration: preferences.duration,
        startDate: preferences.startDate,
      };
      
      // Only include coordinates if they are valid numbers
      if (preferences.lat && !isNaN(preferences.lat) && preferences.lng && !isNaN(preferences.lng)) {
        itineraryData.lat = preferences.lat;
        itineraryData.lng = preferences.lng;
      }
      
      const response = await itineraryAPI.generate(itineraryData);

      setCurrentItinerary(response.data.itinerary);
      
      // Show success notification
      setNotificationMessage(`Itinerary generated for ${preferences.destination.split(',')[0]}!`);
      setShowNotification(true);
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 4000);
      
      // Trigger hotel search after itinerary generation
      setTimeout(async () => {
        try {
          setLoadingHotels(true);
          console.log('Triggering hotel search after itinerary generation for:', preferences.destination);
          
          // Prepare search parameters
          const searchParams = {
            destination: preferences.destination,
            checkIn: preferences.startDate || '',
            checkOut: preferences.startDate ? new Date(new Date(preferences.startDate).setDate(new Date(preferences.startDate).getDate() + (preferences.duration || 3))).toISOString().split('T')[0] : '',
            guests: 2, // Default to 2 guests
            lat: (preferences.lat && !isNaN(preferences.lat)) ? preferences.lat : undefined,
            lng: (preferences.lng && !isNaN(preferences.lng)) ? preferences.lng : undefined
          };
          
          // Perform the hotel search
          const hotelResponse = await hotelAPI.search(searchParams);
          console.log('Hotel search results after itinerary:', hotelResponse.data);
          setHotelResults(hotelResponse.data.hotels || []);
          
        } catch (error) {
          console.error('Error searching hotels after itinerary:', error);
        } finally {
          setLoadingHotels(false);
        }
      }, 1000); // Delay to ensure everything is settled after itinerary generation
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Advanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Travel-themed gradient spheres */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/30 via-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-300/30 via-teal-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-amber-300/20 via-orange-300/20 to-red-300/20 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Travel-themed floating elements */}
        <div className="absolute top-16 left-12 animate-float">
          <svg className="w-10 h-10 text-blue-400/50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
          </svg>
        </div>
        <div className="absolute top-28 right-24 animate-float-delay-1">
          <svg className="w-8 h-8 text-emerald-400/50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute bottom-32 left-24 animate-float-delay-2">
          <svg className="w-9 h-9 text-purple-400/50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>
        <div className="absolute bottom-24 right-20 animate-float-delay-3">
          <svg className="w-8 h-8 text-amber-400/50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
          </svg>
        </div>
        
        {/* Airplane icon moving across the screen */}
        <motion.div 
          className="absolute top-1/4"
          animate={{ x: ["-100%", "100vw"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg className="w-12 h-12 text-sky-400/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </motion.div>
        
        {/* Moving particles with travel themes */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/40 to-purple-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
        
        {/* Subtle wave pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Additional travel-themed elements */}
        <div className="absolute top-1/5 left-1/5 w-8 h-8 text-amber-300/40 rotate-45">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute top-3/4 right-1/3 w-6 h-6 text-blue-300/40">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
          </svg>
        </div>
        <div className="absolute bottom-1/4 left-1/3 w-7 h-7 text-green-300/40 rotate-12">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>
      
      <div className="relative z-10 w-full p-6">
        <div className="max-w-4xl mx-auto w-full">
        {/* Success Notification */}
        {showNotification && (
          <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-4 right-4 z-50 bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-center gap-3 min-w-[300px]"
        >
          <div className="bg-green-100 rounded-full p-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Success!</p>
            <p className="text-sm text-gray-600">{notificationMessage}</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}

      <div className="card p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h2 className="text-4xl font-bold text-gray-900 mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <Sparkles className="w-10 h-10 inline mr-3" />
          Plan Your Dream Trip
        </h2>
        <p className="text-lg text-gray-600 text-center mb-8">Discover the world with personalized itineraries tailored just for you</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Destination Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 text-lg"
              placeholder="Search for a city or destination..."
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            {isSearching && (
              <Loader2 className="w-5 h-5 text-primary-500 absolute right-3 top-3.5 animate-spin" />
            )}
          </div>
          
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {searchResults.map((place, index) => (
                <button
                  key={index}
                  onClick={() => selectDestination(place)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-900">{place.name}</p>
                  <p className="text-sm text-gray-500">{place.fullName}</p>
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Interests
          </label>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  preferences.interests.includes(interest.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{interest.icon}</span>
                <p className="text-xs sm:text-sm font-medium mt-1">{interest.label}</p>
              </button>
            ))}
            {/* Other Button */}
            <button
              onClick={() => setShowCustomInterest(!showCustomInterest)}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                showCustomInterest || customInterests.length > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">✨</span>
              <p className="text-xs sm:text-sm font-medium mt-1">Other</p>
            </button>
          </div>
          
          {/* Custom Interest Input */}
          {showCustomInterest && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Your Own Interests
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInterestInput}
                  onChange={(e) => setCustomInterestInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type interest and press Enter (e.g., Photography, Hiking)"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleAddCustomInterest}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {/* Display Custom Interests */}
              {customInterests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {customInterests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      {interest.replace(/-/g, ' ')}
                      <button
                        onClick={() => handleRemoveCustomInterest(interest)}
                        className="hover:text-primary-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Budget & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget
              {preferences.destination && (
                <span className="ml-2 text-xs text-gray-500">
                  {(() => {
                    const currency = getCurrencyForDestination(preferences.destination);
                    return currency ? `${currency.symbol} ${currency.code}` : '$ USD';
                  })()}
                </span>
              )}
            </label>
            <select
              value={preferences.budget}
              onChange={(e) => setPreferences({ budget: e.target.value as any })}
              className="input-field text-lg"
            >
              <option value="low">Budget Friendly</option>
              <option value="medium">Moderate</option>
              <option value="high">Luxury</option>
            </select>
            {preferences.destination && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  {(() => {
                    const currency = getCurrencyForDestination(preferences.destination);
                    return currency ? `${currency.name}` : 'US Dollar';
                  })()}
                </p>
                {loadingRates ? (
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading rate...
                  </p>
                ) : (
                  getExchangeRateDisplay() && (
                    <p className="text-xs text-primary-600 font-medium">
                      {getExchangeRateDisplay()}
                    </p>
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Duration (days)
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={preferences.duration || ''}
              onChange={(e) => setPreferences({ duration: parseInt(e.target.value) || 0 })}
              placeholder="Enter days"
              className="input-field text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={preferences.startDate}
              onChange={(e) => setPreferences({ startDate: e.target.value })}
              className="input-field text-lg"
            />
          </div>
        </div>

        {/* Google Translate */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Translate Page
          </label>
          <div id="google_translate_element"></div>
        </div>

        {/* Hotel Results Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="w-6 h-6 text-blue-500" />
            Recommended Hotels for {preferences.destination?.split(',')[0] || 'your destination'}
          </h3>
          
          {loadingHotels ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : hotelResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotelResults.slice(0, 6).map((hotel, index) => (
                <div key={hotel.id || index} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 truncate flex-1 text-lg">{hotel.name}</h4>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-base font-medium">{hotel.rating || 'N/A'}</span>
                    </div>
                  </div>
                  <p className="text-base text-gray-600 mb-2 flex items-center gap-1 truncate">
                    <MapPin className="w-4 h-4" />
                    {hotel.location || hotel.distanceFromCenter}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="text-xl font-bold text-blue-600">${hotel.price}/night</span>
                    <span className="text-sm text-gray-500 truncate">{hotel.distanceFromCenter || 'Distance N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : preferences.destination ? (
            <div className="text-center py-8 text-gray-500">
              No hotels found for {preferences.destination}. Try another destination.
            </div>
          ) : null}
        </div>
        
        {/* Generate Button */}
        <button
          onClick={generateItinerary}
          disabled={isGenerating}
          className="w-full btn-primary flex items-center justify-center gap-2 py-5 text-xl"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Smart Itinerary...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Smart Trip
            </>
          )}
        </button>
      </div>
    </div>
  </div>
</div>
</div>
);
};

export default TripPlanner;
