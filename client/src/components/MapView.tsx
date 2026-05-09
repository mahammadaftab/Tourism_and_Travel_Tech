import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTrip } from '../context/TripContext';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Clock, MapPin, Star, Sparkles, Users, Leaf, 
  Phone, Navigation, ExternalLink, Compass, Thermometer, 
  Calendar, TrendingUp, Camera, Info, Building2, Utensils,
  Mountain, Palmtree, Landmark, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataAPI } from '../services/api';

// Fix for default markers
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface SelectedActivity {
  activity: any;
  index: number;
}

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
}

const MapView: React.FC = () => {
  const { currentItinerary, preferences } = useTrip();
  const [selectedActivity, setSelectedActivity] = useState<SelectedActivity | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState<'overview' | 'attractions' | 'tips'>('overview');

  useEffect(() => {
    const fetchWeather = async () => {
      if (preferences.lat !== undefined && preferences.lng !== undefined && preferences.lat !== 0 && preferences.lng !== 0) {
        try {
          const response = await dataAPI.getWeather(preferences.lat, preferences.lng);
          setWeather(response.data.current);
        } catch (error) {
          console.error('Error fetching weather:', error);
        }
      }
    };
    fetchWeather();
  }, [preferences.lat, preferences.lng]);

  const center = currentItinerary 
    ? [currentItinerary.destination.lat, currentItinerary.destination.lng]
    : preferences.lat !== undefined && preferences.lat !== 0 
      ? [preferences.lat, preferences.lng]
      : [51.505, -0.09]; // Default to London

  const activities = currentItinerary?.days.flatMap((day, dayIndex) => 
    day.activities.map((activity, actIndex) => ({
      ...activity,
      day: day.day,
      dayDate: day.date,
      uniqueId: `${dayIndex}-${actIndex}`
    }))
  ) || [];

  const handleMarkerClick = (activity: any, index: number) => {
    setSelectedActivity({ activity, index });
  };

  const getDirectionsUrl = (activity: any) => {
    const coords = activity.location;
    if (!coords) return '#';
    return `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&destination_place_id=${encodeURIComponent(activity.name)}&travelmode=driving`;
  };

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // Format phone number to Indian format
  const formatIndianNumber = (phone: string): string => {
    if (!phone) return '+91 98765 43210';
    // If already has +91, format it properly
    if (phone.includes('+91')) return phone;
    // If starts with 0, replace with +91
    if (phone.startsWith('0')) return '+91 ' + phone.substring(1);
    // If no country code, add +91
    if (!phone.startsWith('+')) return '+91 ' + phone;
    return phone;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Map and Sidebar Row */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[500px]">
        {/* Map Container */}
        <div className={`card overflow-hidden ${selectedActivity ? 'lg:w-2/3' : 'w-full'}`} style={{ minHeight: '500px' }}>
          <MapContainer
            center={center as [number, number]}
            zoom={13}
            className="w-full h-full"
            style={{ height: '500px', width: '100%' }}
          >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {activities.map((activity, index) => (
            <Marker
              key={activity.uniqueId}
              position={[activity.location.lat, activity.location.lng]}
              icon={defaultIcon}
              eventHandlers={{
                click: () => handleMarkerClick(activity, index),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                  <p className="text-sm text-primary-600 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {activity.timeSlot}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{activity.description}</p>
                  <button 
                    onClick={() => handleMarkerClick(activity, index)}
                    className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Click for details →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Activity Details Sidebar */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="lg:w-1/3 card overflow-hidden"
            style={{ maxHeight: '500px', overflowY: 'auto' }}
          >
            <div>
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-primary-100 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Day {selectedActivity.activity.day} • {selectedActivity.activity.timeSlot}
                    </p>
                    <h3 className="text-xl font-bold text-white mt-1">{selectedActivity.activity.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedActivity(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <span className="text-white text-xl">×</span>
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Description */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    About this Place
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedActivity.activity.description}
                  </p>
                </div>

                {/* Highlights */}
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.activity.isHiddenGem && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        <Sparkles className="w-3 h-3" />
                        Hidden Gem
                      </span>
                    )}
                    {selectedActivity.activity.rating && selectedActivity.activity.rating >= 4.5 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        Top Rated
                      </span>
                    )}
                    {selectedActivity.activity.popularity === 'high' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <Users className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                    {selectedActivity.activity.popularity === 'low' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <Leaf className="w-3 h-3" />
                        Less Crowded
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                      {selectedActivity.activity.type || 'Attraction'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary-500" />
                      {selectedActivity.activity.duration} min
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="font-medium text-gray-900">
                      ₹{selectedActivity.activity.cost}
                    </p>
                  </div>
                  {selectedActivity.activity.rating && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-medium text-yellow-600 flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {selectedActivity.activity.rating.toFixed(1)}
                      </p>
                    </div>
                  )}
                  {selectedActivity.activity.sustainabilityScore && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Sustainability</p>
                      <p className="font-medium text-secondary-600 flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        {selectedActivity.activity.sustainabilityScore}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Location
                  </h4>
                  <p className="text-sm text-gray-600">
                    {typeof selectedActivity.activity.location === 'string' 
                      ? selectedActivity.activity.location 
                      : selectedActivity.activity.location?.address || 'Address available on map'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    📍 {selectedActivity.activity.location.lat.toFixed(5)}, {selectedActivity.activity.location.lng.toFixed(5)}
                  </p>
                </div>

                {/* Contact */}
                {(selectedActivity.activity.phoneNumber || true) && (
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      Contact (India)
                    </h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatIndianNumber(selectedActivity.activity.phoneNumber)}
                    </p>
                    <button
                      onClick={() => handleCall(formatIndianNumber(selectedActivity.activity.phoneNumber))}
                      className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <a
                    href={getDirectionsUrl(selectedActivity.activity)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <Navigation className="w-5 h-5" />
                    Get Directions
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!currentItinerary && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
          <div className="text-center p-8">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Yet</h3>
            <p className="text-gray-500">Generate a trip plan to see locations on the map</p>
          </div>
        </div>
      )}
      </div>

      {/* Bottom Info Panel - Only show when itinerary exists */}
      {currentItinerary && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-3 mt-6"
        >
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'attractions', label: 'Attractions', icon: Camera },
              { id: 'tips', label: 'Travel Tips', icon: Compass },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveInfoTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeInfoTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Destination Info */}
            <motion.div
              key={activeInfoTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {activeInfoTab === 'overview' && (
                <>
                  {/* Destination Header Card */}
                  <div className="card p-6 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {preferences.destination}
                        </h2>
                        <p className="text-gray-500 mt-1">
                          {currentItinerary.days.length} days • {activities.length} activities planned
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-primary-700 text-sm rounded-full shadow-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {weather && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-orange-600 text-sm rounded-full shadow-sm">
                              <Thermometer className="w-4 h-4" />
                              {Math.round(weather.temperature)}°C
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Clock, label: 'Total Duration', value: `${activities.reduce((acc, a) => acc + (a.duration || 0), 0)} min`, color: 'blue' },
                      { icon: TrendingUp, label: 'Total Cost', value: `₹${activities.reduce((acc, a) => acc + (a.cost || 0), 0)}`, color: 'green' },
                      { icon: Star, label: 'Avg Rating', value: '4.5', color: 'yellow' },
                      { icon: Heart, label: 'Hidden Gems', value: `${activities.filter(a => a.isHiddenGem).length}`, color: 'purple' },
                    ].map((stat, idx) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card p-4 text-center hover:shadow-lg transition-shadow"
                      >
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center bg-${stat.color}-100`}>
                          <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Activity Type Distribution */}
                  <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary-500" />
                      Activity Types
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {['Attraction', 'Food', 'Adventure', 'Culture', 'Nature'].map((type) => {
                        const count = activities.filter(a => a.type?.toLowerCase().includes(type.toLowerCase())).length;
                        const icons: any = {
                          'Attraction': Landmark,
                          'Food': Utensils,
                          'Adventure': Mountain,
                          'Culture': Building2,
                          'Nature': Palmtree
                        };
                        const IconComponent = icons[type] || MapPin;
                        return count > 0 ? (
                          <div key={type} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                            <IconComponent className="w-4 h-4 text-primary-500" />
                            <span className="text-sm font-medium text-gray-700">{type}</span>
                            <span className="text-xs text-gray-400">({count})</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </>
              )}

              {activeInfoTab === 'attractions' && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">All Attractions</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.map((activity, idx) => (
                      <motion.div
                        key={activity.uniqueId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors cursor-pointer"
                        onClick={() => handleMarkerClick(activity, idx)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{activity.name}</h4>
                          <p className="text-sm text-gray-500">Day {activity.day} • {activity.timeSlot}</p>
                        </div>
                        {activity.rating && (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium">{activity.rating}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeInfoTab === 'tips' && (
                <div className="space-y-4">
                  {[
                    { icon: Compass, title: 'Best Time to Visit', desc: 'Early morning or late afternoon for fewer crowds' },
                    { icon: Navigation, title: 'Getting Around', desc: 'Use public transport or walking for short distances' },
                    { icon: Camera, title: 'Photo Spots', desc: 'Look for viewpoints marked with camera icons on the map' },
                    { icon: Utensils, title: 'Local Cuisine', desc: 'Try local specialties at recommended restaurants' },
                  ].map((tip, idx) => (
                    <motion.div
                      key={tip.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="card p-4 flex items-start gap-4"
                    >
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <tip.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{tip.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{tip.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right Column - Quick Info */}
            <div className="space-y-6">
              {/* Weather Widget */}
              {weather && (
                <div className="card p-6 bg-gradient-to-br from-orange-50 to-yellow-50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    Current Weather
                  </h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</p>
                    <p className="text-gray-500 mt-1">Wind: {weather.windspeed} km/h</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(preferences.destination)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                  >
                    <Navigation className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700">Open in Google Maps</span>
                  </a>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                    <Camera className="w-5 h-5 text-secondary-500" />
                    <span className="text-sm font-medium text-gray-700">View Photo Gallery</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Save to Favorites</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MapView;
