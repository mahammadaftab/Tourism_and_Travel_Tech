import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationSettings from './NotificationSettings';
import { 
  User, Mail, Phone, MapPin, 
  Camera, Save, Edit2, X, CheckCircle, LogOut 
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile, uploadProfileImage: updateProfileImage, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    age: user?.age || '',
    gender: user?.gender || 'prefer-not-to-say',
    phoneNumber: user?.phoneNumber || '',
    email: user?.email || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
      zipCode: user?.address?.zipCode || '',
    },
    profileImage: user?.profileImage || '',
  });

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Update the UI immediately with the preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData({ ...formData, profileImage: reader.result as string });
        };
        reader.readAsDataURL(file);
        
        // Upload to Cloudinary
        await updateProfileImage(file);
      } catch (error) {
        console.error('Failed to upload profile image:', error);
        // Revert to previous image if upload fails
        setFormData({ ...formData, profileImage: user?.profileImage || '' });
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name,
        lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age as string) : undefined,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        profileImage: formData.profileImage,
      });
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      lastName: user?.lastName || '',
      age: user?.age || '',
      gender: user?.gender || 'prefer-not-to-say',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        country: user?.address?.country || '',
        zipCode: user?.address?.zipCode || '',
      },
      profileImage: user?.profileImage || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="card p-12 text-center">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Logged In</h3>
        <p className="text-gray-500">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto w-full">
      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-6 glass bg-green-50/90 border border-green-200/50 rounded-2xl p-4 flex items-center gap-3 shadow-lg"
          >
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-green-800 font-semibold">Profile updated successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card overflow-hidden relative"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/50 pointer-events-none" />
        
        {/* Header with Gradient */}
        <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 p-8 overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white font-[family-name:var(--font-family-display)]">
                  My Profile
                </h2>
                <p className="text-white/80 text-base mt-1">Manage your personal information</p>
              </div>
            </div>
            
            {!isEditing ? (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Exit
                </motion.button>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white text-primary-600 hover:bg-gray-50 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 font-semibold"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </motion.button>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 relative">
          {/* Profile Image Section */}
          <div className="flex justify-center mb-10">
            <motion.div 
              className="relative"
              whileHover={isEditing ? { scale: 1.02 } : {}}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full blur-xl opacity-30 animate-pulse-soft" />
              
              <div 
                onClick={handleImageClick}
                className={`relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl ${
                  isEditing ? 'cursor-pointer' : ''
                }`}
              >
                {formData.profileImage ? (
                  <img 
                    src={formData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              {isEditing && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                  onClick={handleImageClick}
                >
                  <Camera className="w-5 h-5" />
                </motion.div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </motion.div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-8">
            {/* Personal Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      disabled={!isEditing}
                      min={1}
                      max={120}
                      className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      disabled={!isEditing}
                      className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <Mail className="w-5 h-5 text-secondary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="input-field bg-gray-100/50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Phone Number (India)
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                    placeholder="+91 98765 43210"
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Address Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 pt-8 border-t border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-100 rounded-lg">
                <MapPin className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Address</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value }
                  })}
                  disabled={!isEditing}
                  placeholder="Enter street address"
                  className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, city: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Enter city"
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Enter state"
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, country: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Enter country"
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, zipCode: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Enter ZIP code"
                    className="input-field disabled:bg-gray-50/50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <NotificationSettings />
      </motion.div>
    </div>
  </div>
);
};

export default Profile;
