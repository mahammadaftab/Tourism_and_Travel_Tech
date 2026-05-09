import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Heart, Bed, Wifi, Car, Coffee, Utensils, Waves, TreePine, Mountain, ConciergeBell, Sun } from 'lucide-react';
import { hotelAPI } from '../services/api';

interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  price: number;
  imageUrl: string;
  amenities: string[];
  distanceFromCenter: string;
  description: string;
  availability: boolean;
}

interface HotelBookingProps {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  onBook?: (hotel: Hotel) => void;
}

const HotelBooking: React.FC<HotelBookingProps> = ({ 
  destination = '', 
  checkIn, 
  checkOut, 
  guests = 1,
  onBook 
}) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('rating');

  // Fetch real hotels based on destination
  useEffect(() => {
    const fetchHotels = async () => {
      if (!destination) return;
      
      setLoading(true);
      try {
        const searchParams = {
          destination: destination,
          checkIn: checkIn,
          checkOut: checkOut,
          guests: guests,
        };
        
        const response = await hotelAPI.search(searchParams);
        setHotels(response.data.hotels);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        // Fallback to some default data if API fails
        setHotels([
          {
            id: '1',
            name: `${destination} Grand Hotel`,
            location: destination,
            rating: 4.5,
            price: 150,
            imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop',
            amenities: ['wifi', 'parking', 'restaurant'],
            distanceFromCenter: '1.0 km',
            description: `Comfortable accommodation in the heart of ${destination}.`,
            availability: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
  }, [destination, checkIn, checkOut, guests]);

  const filteredHotels = hotels
    .filter(hotel => 
      hotel.price >= priceRange[0] && 
      hotel.price <= priceRange[1] &&
      (selectedFilters.length === 0 || 
       selectedFilters.every(filter => hotel.amenities.includes(filter)))
    )
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return parseFloat(a.distanceFromCenter) - parseFloat(b.distanceFromCenter);
    });

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleBook = (hotel: Hotel) => {
    if (onBook) {
      onBook(hotel);
    } else {
      alert(`Booking ${hotel.name} for your stay!`);
    }
  };

  const amenitiesIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi className="w-4 h-4" />,
    parking: <Car className="w-4 h-4" />,
    pool: <Waves className="w-4 h-4" />,
    spa: <Sun className="w-4 h-4" />,
    breakfast: <Utensils className="w-4 h-4" />,
    garden: <TreePine className="w-4 h-4" />,
    beach: <Waves className="w-4 h-4" />,
    restaurant: <Utensils className="w-4 h-4" />,
    kitchen: <Utensils className="w-4 h-4" />,
    lounge: <Bed className="w-4 h-4" />,
    fireplace: <Sun className="w-4 h-4" />,
    hiking: <Mountain className="w-4 h-4" />,
    concierge: <ConciergeBell className="w-4 h-4" />
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bed className="w-6 h-6" />
          Find & Book Your Stay
        </h2>
        <p className="text-blue-100 mt-1">Discover perfect accommodations for your journey</p>
      </div>

      {/* Filters */}
      <div className="p-6 border-b">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'distance')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Highest Rating</option>
              <option value="price">Lowest Price</option>
              <option value="distance">Closest to Center</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">${priceRange[0]}</span>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
              <span className="text-sm text-gray-600">${priceRange[1]}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {['wifi', 'parking', 'pool', 'spa', 'breakfast'].map(amenity => (
              <button
                key={amenity}
                onClick={() => toggleFilter(amenity)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                  selectedFilters.includes(amenity)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {amenitiesIcons[amenity] || <Coffee className="w-4 h-4" />}
                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Hotels List */}
      <div className="p-6">
        <AnimatePresence>
          {filteredHotels.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No hotels match your filters</div>
              <button 
                onClick={() => {
                  setSelectedFilters([]);
                  setPriceRange([0, 500]);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img 
                      src={hotel.imageUrl} 
                      alt={hotel.name}
                      className="w-full h-48 object-cover"
                    />
                    <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">
                      ${hotel.price}/night
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{hotel.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{hotel.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{hotel.location}</span>
                      <span className="mx-2">•</span>
                      <span className="text-sm">{hotel.distanceFromCenter} from center</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{hotel.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hotel.amenities.slice(0, 4).map(amenity => (
                        <span 
                          key={amenity} 
                          className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {amenitiesIcons[amenity] || <Coffee className="w-3 h-3" />}
                          {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                        </span>
                      ))}
                      {hotel.amenities.length > 4 && (
                        <span className="text-xs text-gray-500">+{hotel.amenities.length - 4} more</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleBook(hotel)}
                      disabled={!hotel.availability}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        hotel.availability
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {hotel.availability ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HotelBooking;