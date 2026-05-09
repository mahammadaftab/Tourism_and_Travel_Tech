import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { hotelAPI } from '../services/api';
import { Calendar, Users, MapPin, Star, Filter, Bed, Heart } from 'lucide-react';

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

const HotelBookingPage: React.FC = () => {
  const { preferences } = useTrip();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    destination: preferences.destination || '',
    checkIn: '',
    checkOut: '',
    guests: 2,
  });

  useEffect(() => {
    // Set default dates (today + 1 day and + 4 days)
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1);
    const checkOut = new Date(today);
    checkOut.setDate(today.getDate() + 4);

    setFilters(prev => ({
      ...prev,
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      destination: preferences.destination || prev.destination
    }));
  }, [preferences.destination]);

  // Auto-search when destination changes
  useEffect(() => {
    if (preferences.destination && preferences.destination.trim() !== '') {
      searchHotels();
    }
  }, [preferences.destination]);

  const searchHotels = async () => {
    setLoading(true);
    try {
      // Use destination from trip context if available
      const searchParams = {
        ...filters,
        destination: preferences.destination || filters.destination
      };
      
      const response = await hotelAPI.search(searchParams);
      setHotels(response.data.hotels);
    } catch (error) {
      console.error('Error searching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.destination && filters.checkIn && filters.checkOut) {
      searchHotels();
    }
  }, [filters]);

  const handleBook = async (hotel: Hotel) => {
    try {
      const bookingData = {
        hotelId: hotel.id,
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
        guests: filters.guests,
        rooms: 1,
      };
      
      const response = await hotelAPI.book(bookingData);
      alert(`Successfully booked ${hotel.name}! Confirmation: ${response.data.booking.confirmationNumber}`);
    } catch (error) {
      console.error('Error booking hotel:', error);
      alert('Failed to book hotel. Please try again.');
    }
  };

  return (
    <div className="w-full p-4 sm:p-6">
      <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Find & Book Your Stay</h1>
        <p className="text-lg text-gray-600">Discover perfect accommodations for your journey</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.destination || preferences.destination || ''}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
                placeholder={preferences.destination ? `Searching hotels in ${preferences.destination}` : "Where are you going?"}
                className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => setFilters({...filters, checkIn: e.target.value})}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => setFilters({...filters, checkOut: e.target.value})}
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                value={filters.guests}
                onChange={(e) => setFilters({...filters, guests: parseInt(e.target.value)})}
                className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-lg"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <motion.button
            onClick={searchHotels}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Searching...
              </>
            ) : (
              <>
                <Filter className="w-5 h-5" />
                Search Hotels
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Hotel Results */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            {hotels.length} {hotels.length === 1 ? 'Property' : 'Properties'} Available
          </h2>
          <div className="text-base text-gray-600">
            Showing results for {filters.destination}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative">
                  <img 
                    src={hotel.imageUrl} 
                    alt={hotel.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=250&fit=crop';
                    }}
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-lg shadow-md">
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {hotel.rating}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                    <span className="text-2xl font-bold text-blue-600">${hotel.price}<span className="text-base font-normal text-gray-500">/night</span></span>
                  </div>
                  
                  <p className="text-gray-600 text-base mb-3">{hotel.location}</p>
                  
                  <p className="text-gray-700 text-base mb-4 line-clamp-2">{hotel.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.slice(0, 4).map((amenity, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize"
                      >
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{hotel.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{hotel.distanceFromCenter}</span>
                    <motion.button
                      onClick={() => handleBook(hotel)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Book Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or destination</p>
          </div>
        )}
      </div>

      {/* Recommended Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-500" />
          Recommended for You
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div>
              <h4 className="font-semibold">Last Minute Deals</h4>
              <p className="text-sm text-gray-600">Up to 50% off</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div>
              <h4 className="font-semibold">Family Friendly</h4>
              <p className="text-sm text-gray-600">Kid-friendly amenities</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div>
              <h4 className="font-semibold">Business Travel</h4>
              <p className="text-sm text-gray-600">WiFi & workspace</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default HotelBookingPage;