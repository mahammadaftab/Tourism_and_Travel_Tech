import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { 
  Clock, MapPin, Leaf, Users, 
  Sparkles, Star, ChevronDown, ChevronUp,
  Phone, Navigation, X, Map as MapIcon, ExternalLink
} from 'lucide-react';

interface ActivityDetailsProps {
  activity: any;
  onClose: () => void;
}

const ActivityDetails: React.FC<ActivityDetailsProps> = ({ activity, onClose }) => {
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [estimatedDistance, setEstimatedDistance] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<string>('');

  // Get activity coordinates - use activity's exact location if available
  const getActivityCoords = () => {
    // First try to use the activity's own coordinates
    if (activity.location?.lat && activity.location?.lng) {
      return { lat: activity.location.lat, lng: activity.location.lng };
    }
    // Fallback to coordinates stored directly on activity
    if (activity.lat && activity.lng) {
      return { lat: activity.lat, lng: activity.lng };
    }
    return null;
  };

  const activityCoords = getActivityCoords();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userLoc);
          setLoadingLocation(false);
          
          // Calculate estimated distance and time
          if (activityCoords) {
            const distance = calculateDistance(userLoc.lat, userLoc.lng, activityCoords.lat, activityCoords.lng);
            setEstimatedDistance(distance);
            setEstimatedTime(estimateTravelTime(distance));
          }
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('Unable to get your location. Please enable location services for accurate directions.');
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationError('Geolocation not supported by your browser.');
      setLoadingLocation(false);
    }
  }, [activityCoords]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  // Estimate travel time based on distance
  const estimateTravelTime = (distance: string): string => {
    const km = parseFloat(distance.replace(/[^0-9.]/g, ''));
    if (distance.includes('m')) {
      return '1 min';
    }
    // Average speed: 30 km/h in city
    const minutes = Math.ceil((km / 30) * 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getDirectionsUrl = () => {
    if (!userLocation || !activityCoords) return '#';
    
    const destinationName = encodeURIComponent(activity.name);
    
    // Use exact coordinates for precise directions
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activityCoords.lat},${activityCoords.lng}&destination_place_id=${destinationName}&travelmode=driving&dir_action=navigate`;
  };

  const getAppleMapsUrl = () => {
    if (!userLocation || !activityCoords) return '#';
    return `http://maps.apple.com/?saddr=${userLocation.lat},${userLocation.lng}&daddr=${activityCoords.lat},${activityCoords.lng}&dirflg=d`;
  };

  const getStaticMapUrl = () => {
    if (!userLocation || !activityCoords) return '';
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    // Only return URL if API key is configured and not placeholder
    if (!apiKey || apiKey === 'your-google-maps-api-key' || apiKey.length < 10) {
      return '';
    }
    
    const markers = `markers=color:blue|label:A|${userLocation.lat},${userLocation.lng}&markers=color:red|label:B|${activityCoords.lat},${activityCoords.lng}`;
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x300&maptype=roadmap&${markers}&path=color:0x0000ff|weight:5|${userLocation.lat},${userLocation.lng}|${activityCoords.lat},${activityCoords.lng}&key=${apiKey}`;
  };

  const handleCall = () => {
    if (activity.phoneNumber) {
      window.location.href = `tel:${activity.phoneNumber}`;
    }
  };

  const phoneNumber = activity.phoneNumber || activity.formattedPhone || generatePhoneNumber();

  function generatePhoneNumber(): string {
    // Always return Indian format phone number
    return '+91 98765 43210';
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 bg-gray-50 rounded-lg overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-semibold text-gray-900 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-primary-500" />
            Directions & Contact
          </h5>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Side - Map & Directions */}
          <div className="space-y-3">
            <h6 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Live Directions
            </h6>
            
            {loadingLocation ? (
              <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Getting your location...
                </div>
              </div>
            ) : (
              <>
                {/* Map Display - Using OpenStreetMap as fallback */}
                <div className="bg-gray-200 rounded-lg h-48 relative overflow-hidden">
                  {getStaticMapUrl() ? (
                    <img 
                      src={getStaticMapUrl()} 
                      alt="Route map"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if static map fails
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : userLocation && activityCoords ? (
                    /* OpenStreetMap iframe as free alternative */
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(userLocation.lng, activityCoords.lng) - 0.05},${Math.min(userLocation.lat, activityCoords.lat) - 0.05},${Math.max(userLocation.lng, activityCoords.lng) + 0.05},${Math.max(userLocation.lat, activityCoords.lat) + 0.05}&layer=map&marker=${activityCoords.lat},${activityCoords.lng}`}
                      style={{ filter: 'grayscale(20%)' }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100/90 to-green-100/90 ${getStaticMapUrl() ? '' : 'pointer-events-none'}`}>
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-primary-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">{typeof activity.location === 'string' ? activity.location : activity.location?.address || activity.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        From: {userLocation ? 'Your Location' : 'Destination'}
                      </p>
                      {!getStaticMapUrl() && activityCoords && (
                        <p className="text-xs text-blue-600 mt-2">
                          📍 {activityCoords.lat.toFixed(4)}, {activityCoords.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {locationError && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    {locationError}
                  </p>
                )}

                {/* Distance & Time Estimate */}
                {estimatedDistance && estimatedTime && (
                  <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{estimatedDistance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">~{estimatedTime}</span>
                    </div>
                  </div>
                )}

                {/* Get Directions Buttons */}
                <div className="space-y-2">
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                  >
                    <MapIcon className="w-5 h-5" />
                    Open in Google Maps
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={getAppleMapsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <Navigation className="w-4 h-4" />
                      Apple Maps
                    </a>
                    <button
                      onClick={() => {
                        const coords = activityCoords;
                        if (coords) {
                          window.open(`https://www.openstreetmap.org/directions?from=${userLocation?.lat},${userLocation?.lng}&to=${coords.lat},${coords.lng}#map=15/${coords.lat}/${coords.lng}`, '_blank');
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
                    >
                      <MapPin className="w-4 h-4" />
                      OpenStreetMap
                    </button>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-white p-4 rounded-lg space-y-4">
                  {/* Description Section */}
                  <div>
                    <h6 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <MapIcon className="w-4 h-4 text-primary-500" />
                      About this Place
                    </h6>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {activity.description || `Explore ${activity.name}, a wonderful ${activity.type || 'attraction'} in this area. Discover the local culture and make memorable experiences during your visit.`}
                    </p>
                  </div>

                  {/* Highlights Section */}
                  {(activity.isHiddenGem || activity.rating || activity.popularity || activity.tags) && (
                    <div className="border-t border-gray-100 pt-3">
                      <h6 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Highlights
                      </h6>
                      <div className="flex flex-wrap gap-2">
                        {activity.isHiddenGem && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Hidden Gem
                          </span>
                        )}
                        {activity.rating && activity.rating >= 4.5 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            <Star className="w-3 h-3" />
                            Top Rated
                          </span>
                        )}
                        {activity.popularity === 'high' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <Users className="w-3 h-3" />
                            Popular Spot
                          </span>
                        )}
                        {activity.popularity === 'low' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <Leaf className="w-3 h-3" />
                            Less Crowded
                          </span>
                        )}
                        {activity.type && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                            {activity.type}
                          </span>
                        )}
                        {activity.sustainabilityScore && activity.sustainabilityScore >= 70 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                            <Leaf className="w-3 h-3" />
                            Eco-Friendly
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Coordinates & Address */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">From Your Location</p>
                        <p className="text-gray-500 text-xs">Current position</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">To: {activity.name}</p>
                        <p className="text-gray-500 text-xs">{typeof activity.location === 'string' ? activity.location : activity.location?.address || activity.address || 'Location details available on map'}</p>
                        {activityCoords && (
                          <p className="text-xs text-blue-600 mt-1">
                            📍 {activityCoords.lat.toFixed(5)}, {activityCoords.lng.toFixed(5)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Side - Contact Info */}
          <div className="space-y-3">
            <h6 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information (India)
            </h6>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    Phone Number
                    {activity.hasRealData && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                    )}
                    {!activity.hasRealData && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Estimated</span>
                    )}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{phoneNumber}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
              </div>

              {/* Call Button */}
              <button
                onClick={handleCall}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </button>

              <p className="text-xs text-gray-400 mt-2 text-center">
                {activity.hasRealData 
                  ? 'Click to call this venue directly' 
                  : 'Contact number may vary. Please verify before calling.'}
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-white p-4 rounded-lg space-y-3">
              <h6 className="font-medium text-gray-900">Venue Details</h6>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium text-gray-900">{activity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium text-gray-900 capitalize">{activity.type || 'Attraction'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium text-gray-900">{activity.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost:</span>
                  <span className="font-medium text-gray-900">₹{activity.cost}</span>
                </div>
                {activity.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rating:</span>
                    <span className="font-medium text-yellow-600">★ {activity.rating.toFixed(1)}</span>
                  </div>
                )}
                {activity.website && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Website:</span>
                    <a 
                      href={activity.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      Visit
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {activity.openingHours && activity.openingHours.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-500 block mb-1">Opening Hours:</span>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      {activity.openingHours.slice(0, 3).map((hours: string, idx: number) => (
                        <p key={idx}>{hours}</p>
                      ))}
                      {activity.openingHours.length > 3 && (
                        <p className="text-gray-400">+{activity.openingHours.length - 3} more days...</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ItineraryView: React.FC = () => {
  const { currentItinerary } = useTrip();
  const [expandedActivity, setExpandedActivity] = useState<{day: number; index: number} | null>(null);

  if (!currentItinerary) {
    return (
      <div className="card p-12 text-center">
        <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Yet</h3>
        <p className="text-gray-500">Generate a trip plan to see your personalized itinerary here</p>
      </div>
    );
  }

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case 'low': return <span className="badge-green">Low Crowd</span>;
      case 'medium': return <span className="badge-yellow">Medium Crowd</span>;
      case 'high': return <span className="badge-red">High Crowd</span>;
      default: return null;
    }
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-secondary-500';
    if (score >= 60) return 'bg-secondary-400';
    if (score >= 40) return 'bg-accent-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{currentItinerary.destination.name}</h2>
            <p className="text-gray-500">
              {new Date(currentItinerary.startDate).toLocaleDateString()} - {new Date(currentItinerary.endDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Sustainability</p>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-secondary-500" />
                <span className="text-xl font-bold text-secondary-600">
                  {currentItinerary.totalSustainabilityScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-6">
        {currentItinerary.days.map((day, dayIndex) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.1 }}
            className="card overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Day {day.day}</h3>
                <p className="text-primary-100">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {day.activities.map((activity, actIndex) => (
                <motion.div
                  key={actIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: actIndex * 0.1 }}
                  className="border-l-4 border-primary-400 pl-4 py-2"
                >
                  <div 
                    className="flex flex-col md:flex-row md:items-start justify-between gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => setExpandedActivity(
                      expandedActivity?.day === day.day && expandedActivity?.index === actIndex 
                        ? null 
                        : { day: day.day, index: actIndex }
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium text-primary-600">{activity.timeSlot}</span>
                        {activity.isHiddenGem && (
                          <span className="badge-blue">Hidden Gem</span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">{activity.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {getCrowdBadge(activity.crowdLevel)}
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">₹{activity.cost}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{activity.duration} min</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">Click for directions & contact</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-secondary-500" />
                        <div className="w-24 sustainability-bar">
                          <div 
                            className={`sustainability-fill ${getSustainabilityColor(activity.sustainabilityScore)}`}
                            style={{ width: `${activity.sustainabilityScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-secondary-600">{activity.sustainabilityScore}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        {expandedActivity?.day === day.day && expandedActivity?.index === actIndex ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedActivity?.day === day.day && expandedActivity?.index === actIndex && (
                      <ActivityDetails
                        activity={activity}
                        onClose={() => setExpandedActivity(null)}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
};

export default ItineraryView;
