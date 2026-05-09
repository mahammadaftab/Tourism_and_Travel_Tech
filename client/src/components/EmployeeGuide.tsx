import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, MapPin, Star, ChevronRight, Headphones, Calendar, Users, Award, Shield, Mic, Zap, Globe, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { employeeAPI } from '../services/api';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  rating: number;
  languages: string[];
  availability: string;
  specialties: string[];
  experience: number;
  image?: string;
  status: 'available' | 'busy' | 'offline';
  responseTime: string;
}

const EmployeeGuide: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'directory' | 'quick-help' | 'emergency'>('directory');
  const [voiceActive, setVoiceActive] = useState<boolean>(false);

  // Mock data - in real app, this would come from API
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Travel Consultant',
      department: 'Travel Planning',
      phone: '+1-555-0123',
      email: 'sarah.j@traveltech.com',
      rating: 4.9,
      languages: ['English', 'Spanish', 'French'],
      availability: 'Mon-Fri 9AM-6PM EST',
      specialties: ['Europe', 'Luxury Travel', 'Cruises'],
      experience: 8,
      status: 'available',
      responseTime: 'Instant'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Destination Specialist',
      department: 'Destinations',
      phone: '+1-555-0124',
      email: 'michael.c@traveltech.com',
      rating: 4.8,
      languages: ['English', 'Mandarin', 'Japanese'],
      availability: 'Mon-Sat 8AM-8PM EST',
      specialties: ['Asia', 'Adventure Travel', 'Cultural Tours'],
      experience: 6,
      status: 'available',
      responseTime: 'Under 2 min'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      role: 'Customer Support Lead',
      department: 'Support',
      phone: '+1-555-0125',
      email: 'emma.r@traveltech.com',
      rating: 4.95,
      languages: ['English', 'Spanish'],
      availability: '24/7',
      specialties: ['Problem Resolution', 'Emergency Support', 'Booking Issues'],
      experience: 5,
      status: 'busy',
      responseTime: 'Under 5 min'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Hotel & Accommodation Expert',
      department: 'Accommodations',
      phone: '+1-555-0126',
      email: 'david.k@traveltech.com',
      rating: 4.7,
      languages: ['English', 'Korean'],
      availability: 'Mon-Fri 9AM-7PM EST',
      specialties: ['Hotels', 'Resorts', 'Vacation Rentals'],
      experience: 7,
      status: 'available',
      responseTime: 'Instant'
    },
    {
      id: '5',
      name: 'Priya Sharma',
      role: 'Flight & Transportation Specialist',
      department: 'Transportation',
      phone: '+1-555-0127',
      email: 'priya.s@traveltech.com',
      rating: 4.85,
      languages: ['English', 'Hindi'],
      availability: 'Mon-Sun 6AM-10PM EST',
      specialties: ['Flights', 'Car Rentals', 'Rail Passes'],
      experience: 4,
      status: 'offline',
      responseTime: 'Under 10 min'
    }
  ];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await employeeAPI.getAll();
        if (response.data.success) {
          // Transform API response to match our interface
          const transformedEmployees = response.data.data.map((emp: any) => ({
            id: emp._id,
            name: emp.name,
            role: emp.role,
            department: emp.department,
            phone: emp.phone,
            email: emp.email,
            rating: emp.rating,
            languages: emp.languages,
            availability: emp.availability,
            specialties: emp.specialties,
            experience: emp.experience,
            status: emp.status || 'available',
            responseTime: emp.responseTime || 'Under 10 min'
          }));
          setEmployees(transformedEmployees);
          setFilteredEmployees(transformedEmployees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Fallback to mock data if API fails
        setEmployees(mockEmployees);
        setFilteredEmployees(mockEmployees);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const filterAndSearchEmployees = async () => {
      let filtered = [...employees];

      if (selectedDepartment !== 'all') {
        filtered = filtered.filter(emp => emp.department === selectedDepartment);
      }

      if (searchTerm) {
        // Try API search first
        try {
          const response = await employeeAPI.search(searchTerm);
          if (response.data.success) {
            const transformedResults = response.data.data.map((emp: any) => ({
              id: emp._id,
              name: emp.name,
              role: emp.role,
              department: emp.department,
              phone: emp.phone,
              email: emp.email,
              rating: emp.rating,
              languages: emp.languages,
              availability: emp.availability,
              specialties: emp.specialties,
              experience: emp.experience,
              status: emp.status || 'available',
              responseTime: emp.responseTime || 'Under 10 min'
            }));
            setFilteredEmployees(transformedResults);
            return;
          }
        } catch (error) {
          console.error('API search failed, using client-side filtering:', error);
        }
        
        // Fallback to client-side filtering
        filtered = filtered.filter(emp => 
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setFilteredEmployees(filtered);
    };

    filterAndSearchEmployees();
  }, [employees, selectedDepartment, searchTerm]);

  const departments = ['all', 'Travel Planning', 'Destinations', 'Support', 'Accommodations', 'Transportation'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'busy': return 'Currently Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleCallEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowCallModal(true);
  };

  const initiateCall = async () => {
    if (selectedEmployee) {
      try {
        const response = await employeeAPI.initiateCall(selectedEmployee.id);
        if (response.data.success) {
          alert(`Calling ${selectedEmployee.name}...\nPhone: ${selectedEmployee.phone}\nEstimated Wait Time: ${response.data.data.estimatedWaitTime}`);
          setShowCallModal(false);
        }
      } catch (error) {
        console.error('Error initiating call:', error);
        // Fallback to simple alert
        alert(`Calling ${selectedEmployee.name}...\nPhone: ${selectedEmployee.phone}`);
        setShowCallModal(false);
      }
    }
  };

  const toggleVoiceRecognition = () => {
    if (!voiceActive) {
      // Start voice recognition
      setVoiceActive(true);
      // Voice recognition implementation would go here
    } else {
      setVoiceActive(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Employee Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 w-full">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Headphones className="text-indigo-600" size={36} />
                Employee Guidance Center
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Connect with our travel experts for personalized assistance
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="text-green-800 font-semibold">{employees.filter(e => e.status === 'available').length} Online</div>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <div className="text-blue-800 font-semibold">{employees.length} Experts</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-md">
            {[
              { id: 'directory', label: 'Directory', icon: Users },
              { id: 'quick-help', label: 'Quick Help', icon: Zap },
              { id: 'emergency', label: 'Emergency', icon: AlertCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'directory' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees, specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>

                <button
                  onClick={toggleVoiceRecognition}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    voiceActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  <Mic size={20} />
                  {voiceActive ? 'Stop Listening' : 'Voice Search'}
                </button>
              </div>
            </div>

            {/* Employees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(employee.status)}`}></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{employee.name}</h3>
                          <p className="text-indigo-600 font-medium">{employee.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-current" size={16} />
                        <span className="text-sm font-semibold text-gray-700">{employee.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield size={16} className="text-green-500" />
                        <span className="text-sm">{employee.department}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-blue-500" />
                        <span className="text-sm">{employee.availability}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award size={16} className="text-purple-500" />
                        <span className="text-sm">{employee.experience} years experience</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe size={16} className="text-indigo-500" />
                        <span className="text-sm">{employee.languages.join(', ')}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {employee.specialties.map((spec, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCallEmployee(employee)}
                        disabled={employee.status === 'offline'}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                          employee.status === 'offline'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : employee.status === 'busy'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Phone size={18} />
                        {employee.status === 'offline' ? 'Unavailable' : employee.status === 'busy' ? 'Busy' : 'Call Now'}
                      </button>
                      
                      <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                        <Mail size={18} className="text-gray-600" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Status: {getStatusText(employee.status)}</span>
                        <span>Response: {employee.responseTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'quick-help' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500" size={24} />
                Quick Assistance
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Booking Issues', desc: 'Problems with reservations or confirmations', icon: AlertCircle },
                  { title: 'Travel Changes', desc: 'Modify dates, destinations, or itineraries', icon: Calendar },
                  { title: 'Payment Questions', desc: 'Billing, refunds, and payment methods', icon: CreditCard },
                  { title: 'Destination Info', desc: 'Learn about places you want to visit', icon: MapPin }
                ].map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <item.icon size={20} className="text-indigo-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-500" size={24} />
                Popular Topics
              </h3>
              <div className="space-y-3">
                {[
                  'Best time to visit Europe',
                  'Budget travel tips',
                  'Family-friendly destinations',
                  'Solo traveler safety',
                  'Visa requirements guide'
                ].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-800">{topic}</span>
                    <ChevronRight size={16} className="text-blue-600" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">24/7 Emergency Support</h3>
            <p className="text-gray-600 mb-6">Immediate assistance for urgent travel situations</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { title: 'Medical Emergencies', phone: '911' },
                { title: 'Lost Documents', phone: '+1-555-EMERGENCY' },
                { title: 'Travel Insurance', phone: '+1-555-INSURANCE' }
              ].map((service, index) => (
                <div key={index} className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800">{service.title}</h4>
                  <p className="text-red-600 font-mono text-lg">{service.phone}</p>
                </div>
              ))}
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors">
              Call Emergency Support Now
            </button>
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCallModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedEmployee.name}</h3>
              <p className="text-indigo-600 font-medium mb-4">{selectedEmployee.role}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-700 mb-2">📞 {selectedEmployee.phone}</p>
                <p className="text-gray-700">✉️ {selectedEmployee.email}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={initiateCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  Call Now
                </button>
                <button
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeGuide;