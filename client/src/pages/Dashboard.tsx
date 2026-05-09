import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Compass, 
  Sparkles, Menu, X, Map as MapIcon, MessageCircle, User, Bed, Headphones, Shield
} from 'lucide-react';
import TripPlanner from '../components/TripPlanner';
import ItineraryView from '../components/ItineraryView';
import WeatherWidget from '../components/WeatherWidget';
import EventsWidget from '../components/EventsWidget';
import MapView from '../components/MapView';
import AdvancedAssistant from '../components/AdvancedAssistant';
import Profile from '../components/Profile';
import Home from '../components/Home';
import DestinationShowcase from '../components/DestinationShowcase';
import HotelBookingPage from '../components/HotelBookingPage';
import SecurityContacts from '../components/SecurityContacts';
import EmployeeGuide from '../components/EmployeeGuide';
import AdminPanel from '../components/AdminPanel';

const Dashboard: React.FC = () => {
  const { preferences } = useTrip();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'planner' | 'itinerary' | 'map' | 'assistant' | 'hotels' | 'guide' | 'profile' | 'admin'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Mock admin check - in real app, this would come from user role
  const isAdmin = user?.email === 'admin@traveltech.com' || user?.email?.includes('admin');

  const tabs = [
    { id: 'home', label: 'Home', icon: Sparkles, color: 'from-amber-500 to-orange-500' },
    { id: 'planner', label: 'Trip Planner', icon: Compass, color: 'from-blue-500 to-cyan-500' },
    { id: 'itinerary', label: 'My Itinerary', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { id: 'map', label: 'Map View', icon: MapIcon, color: 'from-emerald-500 to-teal-500' },
    { id: 'assistant', label: 'Assistant', icon: MessageCircle, color: 'from-amber-500 to-orange-500' },
    { id: 'hotels', label: 'Hotels', icon: Bed, color: 'from-indigo-500 to-purple-500' },
    { id: 'guide', label: 'Tourist Guide', icon: Headphones, color: 'from-green-500 to-teal-500' },
    { id: 'profile', label: 'Profile', icon: User, color: 'from-rose-500 to-red-500' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Shield, color: 'from-gray-600 to-gray-800' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh w-full">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-secondary-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Glass Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 w-full">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setActiveTab('home')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src="/logo.png" 
                alt="Tourism & Travel Tech" 
                className="h-[120px] w-auto object-contain hover:opacity-90 transition-opacity" 
              />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="navbar-nav hidden md:flex items-center gap-2 lg:gap-3">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`nav-item relative flex items-center justify-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'nav-item-active text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-xl`}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="nav-item-content relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1">
                    <tab.icon className="w-5 h-5" />
                    <span className="nav-item-label text-sm lg:text-base">{tab.label}</span>
                  </span>
                </motion.button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <SecurityContacts destination={preferences.destination} />
              {isAdmin && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdminPanel(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md"
                >
                  <Shield size={20} />
                  <span className="font-semibold">Admin Panel</span>
                </motion.button>
              )}
              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/60"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/20"
            >
              <div className="px-4 py-3 space-y-2">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                        : 'text-gray-600 hover:bg-white/60'
                    }`}
                  >
                    <tab.icon className="w-6 h-6" />
                    <span className="text-lg">{tab.label}</span>
                  </motion.button>
                ))}
                {isAdmin && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: tabs.length * 0.05 }}
                    onClick={() => {
                      setShowAdminPanel(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-lg mt-2 hover:from-red-700 hover:to-red-900 transition-all"
                  >
                    <Shield className="w-6 h-6" />
                    <span className="text-lg">Admin Panel</span>
                  </motion.button>
                )}
                <div className="pt-2 border-t border-white/20 px-4">
                  <SecurityContacts destination={preferences.destination} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Home onStartPlanning={() => setActiveTab('planner')} />
            </motion.div>
          )}

          {activeTab === 'planner' && (
            <motion.div
              key="planner"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                <TripPlanner />
                <DestinationShowcase />
              </div>
              <div className="space-y-6">
                {preferences.lat && preferences.lng && preferences.lat !== 0 && (
                  <>
                    <WeatherWidget lat={preferences.lat as number} lng={preferences.lng as number} />
                    <EventsWidget 
                      lat={preferences.lat as number} 
                      lng={preferences.lng as number} 
                      destination={preferences.destination}
                      interests={preferences.interests}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'itinerary' && (
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <ItineraryView />
            </motion.div>
          )}

          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <MapView />
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="max-w-3xl mx-auto"
            >
              <AdvancedAssistant />
            </motion.div>
          )}

          {activeTab === 'hotels' && (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <HotelBookingPage />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <EmployeeGuide />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Profile />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="w-full"
            >
              <AdminPanel />
            </motion.div>
          )}
        </AnimatePresence>
        </div> {/* Close the max-w-7xl container */}
      </main>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAdminPanel(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full sm:h-[90vh]">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowAdminPanel(false)}
                  className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="h-[90vh] overflow-y-auto">
                <AdminPanel />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
