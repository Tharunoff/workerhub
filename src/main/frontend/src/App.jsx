import React, { useState, createContext, useContext, useEffect } from 'react';
import { Menu, X, Search, MapPin, Star, Clock, DollarSign, Briefcase, Users, FileText, LogOut, Settings, ChevronDown } from 'lucide-react';
import { authService } from './services/authService';

// Mock Data
const initialWorkers = [
  { id: 1, name: "Ravi Kumar", skill: "Welder", rate: 300, experience: 4, availability: "9am-6pm", location: "Chennai", rating: 4.6, status: "online" },
  { id: 2, name: "Imran Khan", skill: "Polisher", rate: 250, experience: 3, availability: "10am-7pm", location: "Hyderabad", rating: 4.3, status: "online" },
  { id: 3, name: "Suresh Babu", skill: "Electrician", rate: 350, experience: 6, availability: "8am-5pm", location: "Chennai", rating: 4.8, status: "online" },
  { id: 4, name: "Vijay Singh", skill: "Carpenter", rate: 400, experience: 5, availability: "10am-8pm", location: "Bangalore", rating: 4.5, status: "offline" },
  { id: 5, name: "Arjun Mehta", skill: "Painter", rate: 280, experience: 4, availability: "9am-6pm", location: "Mumbai", rating: 4.4, status: "online" },
  { id: 6, name: "Ramesh Patil", skill: "Plumber", rate: 320, experience: 7, availability: "8am-6pm", location: "Pune", rating: 4.7, status: "online" }
];

const initialJobs = [
  { id: 101, title: "Machine polishing for stainless sheets", skillRequired: "Polisher", location: "Chennai", budget: 250, hours: 4, status: "Open", postedBy: "ABC Industries" },
  { id: 102, title: "Welding work for metal frames", skillRequired: "Welder", location: "Hyderabad", budget: 300, hours: 6, status: "Open", postedBy: "XYZ Manufacturing" },
  { id: 103, title: "Electrical wiring for new factory", skillRequired: "Electrician", location: "Bangalore", budget: 350, hours: 8, status: "Open", postedBy: "Tech Fabricators" },
  { id: 104, title: "Wooden furniture assembly", skillRequired: "Carpenter", location: "Chennai", budget: 400, hours: 5, status: "Open", postedBy: "Home Decor Ltd" }
];

const skills = ["Welder", "Polisher", "Electrician", "Plumber", "Carpenter", "Painter", "Fabricator", "Machine Operator", "Mechanic"];

// Context
const AppContext = createContext();

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      {message}
    </div>
  );
};

// App Provider
const AppProvider = ({ children }) => {
  const [workers, setWorkers] = useState(() => {
    const saved = localStorage.getItem('workers');
    return saved ? JSON.parse(saved) : initialWorkers;
  });
  
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const login = async (userData) => {
    // For worker, we need to merge the auth user data with the worker profile
    if (userData.type === 'worker') {
      const worker = workers.find(w => w.id === userData.id) || {
        id: userData.id,
        name: userData.name,
        skill: 'Unknown',
        rate: 0,
        experience: 0,
        location: 'Unknown',
        availability: 'Unknown',
        status: 'online'
      };
      setCurrentUser({ ...worker, type: 'worker' });
    } else {
      // For employers, just use the auth data
      setCurrentUser(userData);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    showToast(`Welcome ${userData.name}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
  };

  const addWorker = (worker) => {
    const newWorker = { ...worker, id: Date.now(), rating: 0, status: 'online' };
    setWorkers([...workers, newWorker]);
    showToast('Worker profile created successfully!', 'success');
    return newWorker;
  };

  const updateWorker = (id, updates) => {
    setWorkers(workers.map(w => w.id === id ? { ...w, ...updates } : w));
    showToast('Profile updated successfully!', 'success');
  };

  const addJob = (job) => {
    const newJob = { ...job, id: Date.now(), status: 'Open' };
    setJobs([...jobs, newJob]);
    showToast('Job posted successfully!', 'success');
  };

  const createBooking = (booking) => {
    const newBooking = { ...booking, id: Date.now(), status: 'Requested', createdAt: new Date().toISOString() };
    setBookings([...bookings, newBooking]);
    showToast('Booking request sent!', 'success');
  };

  return (
    <AppContext.Provider value={{
      workers, jobs, currentUser, bookings,
      login, logout, addWorker, updateWorker, addJob, createBooking, showToast
    }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppContext.Provider>
  );
};

// Navbar Component
const Navbar = ({ currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useApp();

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <Briefcase className="w-8 h-8 text-amber-400" />
            <span className="text-xl font-bold">WorkerHub</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setCurrentPage('home')} className="hover:text-amber-400">Home</button>
            <button onClick={() => setCurrentPage('workers')} className="hover:text-amber-400">Find Workers</button>
            <button onClick={() => setCurrentPage('jobs')} className="hover:text-amber-400">Browse Jobs</button>
            <button onClick={() => setCurrentPage('pricing')} className="hover:text-amber-400">Pricing</button>
            
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentPage(currentUser.type === 'worker' ? 'worker-dashboard' : 'employer-dashboard')}
                  className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Dashboard
                </button>
                <button onClick={logout} className="flex items-center space-x-1 hover:text-amber-400">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setCurrentPage('worker-register')}
                  className="bg-amber-500 px-4 py-2 rounded-lg hover:bg-amber-600"
                >
                  Join as Worker
                </button>
                <button 
                  onClick={() => setCurrentPage('employer-register')}
                  className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Post Jobs
                </button>
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-slate-200 hover:text-white"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-700 px-4 py-4 space-y-2">
          <button onClick={() => { setCurrentPage('home'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:text-amber-400">Home</button>
          <button onClick={() => { setCurrentPage('workers'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:text-amber-400">Find Workers</button>
          <button onClick={() => { setCurrentPage('jobs'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:text-amber-400">Browse Jobs</button>
          <button onClick={() => { setCurrentPage('pricing'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:text-amber-400">Pricing</button>
          {currentUser && (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:text-amber-400">Logout</button>
          )}
        </div>
      )}
    </nav>
  );
};

// Footer Component
const Footer = () => (
  <footer className="bg-slate-800 text-white mt-16 py-8">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-bold text-lg mb-4">About WorkerHub</h3>
        <p className="text-slate-300">Connecting skilled industrial workers with employers across India.</p>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
        <ul className="space-y-2 text-slate-300">
          <li>Terms & Conditions</li>
          <li>Privacy Policy</li>
          <li>Contact Us</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-lg mb-4">Contact</h3>
        <p className="text-slate-300">Email: support@workerhub.in</p>
        <p className="text-slate-300">Phone: +91 98765 43210</p>
      </div>
    </div>
    <div className="text-center mt-8 text-slate-400">
      © 2025 WorkerHub. All rights reserved.
    </div>
  </footer>
);

// Home Page
const HomePage = ({ setCurrentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Skilled Industrial Workers</h1>
          <p className="text-xl mb-8">Connect with verified welders, polishers, electricians, and more</p>
          
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-2 flex">
            <input
              type="text"
              placeholder="Search for welders, electricians, carpenters..."
              className="flex-1 px-4 py-3 text-slate-800 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-amber-500 px-6 py-3 rounded-lg hover:bg-amber-600 flex items-center">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Browse by Skill</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skills.map(skill => (
            <div 
              key={skill}
              onClick={() => setCurrentPage('workers')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer border-2 border-slate-200 hover:border-blue-500"
            >
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="font-bold text-lg">{skill}</h3>
              <p className="text-slate-600 text-sm mt-2">Find skilled {skill.toLowerCase()}s</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Get Started Today</h2>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={() => setCurrentPage('worker-register')}
              className="bg-amber-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-amber-600"
            >
              Become a Worker
            </button>
            <button 
              onClick={() => setCurrentPage('employer-register')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              Hire Workers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Worker Registration
const WorkerRegisterPage = ({ setCurrentPage }) => {
  const { addWorker, login } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    skill: 'Welder',
    experience: 1,
    rate: 200,
    location: '',
    availability: '9am-6pm'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        type: 'worker'
      });
      
      if (data.success) {
        const worker = addWorker({
          ...formData,
          id: data.user.id
        });
        login({ ...worker, type: 'worker' });
        setCurrentPage('worker-dashboard');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Register as Worker</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block font-semibold mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Skill</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.skill}
              onChange={(e) => setFormData({...formData, skill: e.target.value})}
            >
              {skills.map(skill => <option key={skill}>{skill}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Years of Experience</label>
            <input
              type="number"
              min="1"
              max="50"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Hourly Rate (₹)</label>
            <input
              type="number"
              min="100"
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.rate}
              onChange={(e) => setFormData({...formData, rate: parseInt(e.target.value)})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Location</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border rounded-lg"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Availability Hours</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="e.g., 9am-6pm"
              value={formData.availability}
              onChange={(e) => setFormData({...formData, availability: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Create Profile
          </button>
        </form>

        <div className="bg-slate-100 p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Profile Preview</h3>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold">{formData.name || 'Your Name'}</h4>
            <p className="text-blue-600 font-semibold">{formData.skill}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <span>₹{formData.rate}/hour</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <span>{formData.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-slate-600" />
                <span>{formData.location || 'Location'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-slate-600" />
                <span>{formData.availability}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employer Registration
const EmployerRegisterPage = ({ setCurrentPage }) => {
  const { login } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    location: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        type: 'employer'
      });
      
      if (data.success) {
        login({
          ...formData,
          id: data.user.id,
          type: 'employer'
        });
        setCurrentPage('employer-dashboard');
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Register as Employer</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-4">
        <div>
          <label className="block font-semibold mb-2">Your Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Company Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Location</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Phone Number</label>
          <input
            type="tel"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          Create Account
        </button>
      </form>
    </div>
  );
};

// Workers Directory
const WorkersPage = ({ setCurrentPage }) => {
  const { workers, currentUser } = useApp();
  const [filteredWorkers, setFilteredWorkers] = useState(workers);
  const [filters, setFilters] = useState({ skill: 'All', location: '', maxRate: 1000 });
  const [selectedWorker, setSelectedWorker] = useState(null);

  // If user isn't logged in, redirect to login
  useEffect(() => {
    if (!currentUser) {
      setCurrentPage('login');
    }
  }, [currentUser, setCurrentPage]);

  useEffect(() => {
    let result = workers;
    if (filters.skill !== 'All') {
      result = result.filter(w => w.skill === filters.skill);
    }
    if (filters.location) {
      result = result.filter(w => w.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    result = result.filter(w => w.rate <= filters.maxRate);
    setFilteredWorkers(result);
  }, [filters, workers]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Find Workers</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block font-semibold mb-2">Skill</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.skill}
              onChange={(e) => setFilters({...filters, skill: e.target.value})}
            >
              <option>All</option>
              {skills.map(skill => <option key={skill}>{skill}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Location</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter city"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block font-semibold mb-2">Max Rate: ₹{filters.maxRate}/hr</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              className="w-full"
              value={filters.maxRate}
              onChange={(e) => setFilters({...filters, maxRate: parseInt(e.target.value)})}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ skill: 'All', location: '', maxRate: 1000 })}
              className="w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filteredWorkers.map(worker => (
          <div key={worker.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition border-2 border-slate-200 hover:border-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">{worker.name}</h3>
                <p className="text-blue-600 font-semibold">{worker.skill}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                worker.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {worker.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-slate-700">
                <DollarSign className="w-4 h-4" />
                <span>₹{worker.rate}/hour</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Clock className="w-4 h-4" />
                <span>{worker.experience} years exp</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <MapPin className="w-4 h-4" />
                <span>{worker.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{worker.rating}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWorker(worker)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>

      {selectedWorker && (
        <WorkerModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
      )}
    </div>
  );
};

// Worker Modal
const WorkerModal = ({ worker, onClose }) => {
  const { currentUser, createBooking, showToast } = useApp();
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    hours: 2
  });

  const handleBooking = () => {
    if (!currentUser) {
      showToast('Please login as employer to book', 'error');
      return;
    }
    if (currentUser.type !== 'employer') {
      showToast('Only employers can book workers', 'error');
      return;
    }
    if (!bookingData.date || !bookingData.startTime) {
      showToast('Please fill all booking details', 'error');
      return;
    }

    createBooking({
      workerId: worker.id,
      workerName: worker.name,
      employerId: currentUser.id,
      employerName: currentUser.name,
      ...bookingData,
      totalCost: worker.rate * bookingData.hours
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold">{worker.name}</h2>
              <p className="text-blue-600 font-semibold text-lg">{worker.skill}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-slate-600" />
                <span className="text-lg">₹{worker.rate}/hour</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-slate-600" />
                <span>{worker.experience} years experience</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-slate-600" />
                <span>{worker.location}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-slate-600" />
                <span>{worker.availability}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{worker.rating} rating</span>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-lg">
              <h3 className="font-bold mb-4">Book This Worker</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={bookingData.hours}
                    onChange={(e) => setBookingData({...bookingData, hours: parseInt(e.target.value)})}
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-600">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-600">₹{worker.rate * bookingData.hours}</p>
                </div>
                <button
                  onClick={handleBooking}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Send Booking Request
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-slate-700">Experienced {worker.skill.toLowerCase()} with {worker.experience} years in the industry. Available {worker.availability} in {worker.location}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Jobs Listing Page
const JobsPage = ({ setCurrentPage }) => {
  const { jobs, currentUser } = useApp();
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  const [filters, setFilters] = useState({ skill: 'All', location: '' });

  // If user isn't logged in, redirect to login
  useEffect(() => {
    if (!currentUser) {
      setCurrentPage('login');
    }
  }, [currentUser, setCurrentPage]);

  useEffect(() => {
    let result = jobs;
    if (filters.skill !== 'All') {
      result = result.filter(j => j.skillRequired === filters.skill);
    }
    if (filters.location) {
      result = result.filter(j => j.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    setFilteredJobs(result);
  }, [filters, jobs]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Browse Jobs</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-2">Skill Required</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={filters.skill}
              onChange={(e) => setFilters({...filters, skill: e.target.value})}
            >
              <option>All</option>
              {skills.map(skill => <option key={skill}>{skill}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2">Location</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter city"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ skill: 'All', location: '' })}
              className="w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredJobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition border-2 border-slate-200 hover:border-blue-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{job.title}</h3>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                {job.status}
              </span>
            </div>

            <p className="text-slate-600 mb-4">{job.postedBy}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-slate-700">
                <Briefcase className="w-4 h-4" />
                <span>{job.skillRequired}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <DollarSign className="w-4 h-4" />
                <span>₹{job.budget}/hour</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700">
                <Clock className="w-4 h-4" />
                <span>{job.hours} hours</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-slate-600">Estimated Total</p>
              <p className="text-xl font-bold text-blue-600">₹{job.budget * job.hours}</p>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Worker Dashboard
const WorkerDashboard = () => {
  const { currentUser, updateWorker, bookings } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(currentUser);

  const workerBookings = bookings.filter(b => b.workerId === currentUser.id);

  const handleUpdate = () => {
    updateWorker(currentUser.id, formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Worker Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold">{workerBookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <Star className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-sm text-slate-600">Rating</p>
              <p className="text-2xl font-bold">{currentUser.rating || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Hourly Rate</p>
              <p className="text-2xl font-bold">₹{currentUser.rate}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">My Profile</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Hourly Rate (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Availability</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                />
              </div>
              <button
                onClick={handleUpdate}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Name</p>
                <p className="font-semibold">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Skill</p>
                <p className="font-semibold">{currentUser.skill}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Experience</p>
                <p className="font-semibold">{currentUser.experience} years</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Location</p>
                <p className="font-semibold">{currentUser.location}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Availability</p>
                <p className="font-semibold">{currentUser.availability}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                  currentUser.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {currentUser.status}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
          <div className="space-y-3">
            {workerBookings.length === 0 ? (
              <p className="text-slate-600">No bookings yet</p>
            ) : (
              workerBookings.map(booking => (
                <div key={booking.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{booking.employerName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'Requested' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{booking.date} at {booking.startTime}</p>
                  <p className="text-sm text-slate-600">{booking.hours} hours - ₹{booking.totalCost}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Employer Dashboard
const EmployerDashboard = ({ setCurrentPage }) => {
  const { currentUser, jobs, addJob, bookings } = useApp();
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    skillRequired: 'Welder',
    location: '',
    budget: 200,
    hours: 4
  });

  const employerJobs = jobs.filter(j => j.postedBy === currentUser.company);
  const employerBookings = bookings.filter(b => b.employerId === currentUser.id);

  const handlePostJob = (e) => {
    e.preventDefault();
    addJob({ ...jobData, postedBy: currentUser.company });
    setJobData({ title: '', skillRequired: 'Welder', location: '', budget: 200, hours: 4 });
    setShowJobForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Employer Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Posted Jobs</p>
              <p className="text-2xl font-bold">{employerJobs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Active Bookings</p>
              <p className="text-2xl font-bold">{employerBookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <button
            onClick={() => setShowJobForm(!showJobForm)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Post New Job
          </button>
        </div>
      </div>

      {showJobForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
          <form onSubmit={handlePostJob} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={jobData.title}
                  onChange={(e) => setJobData({...jobData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Skill Required</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={jobData.skillRequired}
                  onChange={(e) => setJobData({...jobData, skillRequired: e.target.value})}
                >
                  {skills.map(skill => <option key={skill}>{skill}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">Location</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  value={jobData.location}
                  onChange={(e) => setJobData({...jobData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Hourly Budget (₹)</label>
                <input
                  type="number"
                  min="100"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={jobData.budget}
                  onChange={(e) => setJobData({...jobData, budget: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Estimated Hours</label>
                <input
                  type="number"
                  min="2"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={jobData.hours}
                  onChange={(e) => setJobData({...jobData, hours: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Post Job
              </button>
              <button
                type="button"
                onClick={() => setShowJobForm(false)}
                className="bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">My Posted Jobs</h2>
          <div className="space-y-3">
            {employerJobs.length === 0 ? (
              <p className="text-slate-600">No jobs posted yet</p>
            ) : (
              employerJobs.map(job => (
                <div key={job.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{job.title}</h3>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{job.skillRequired} - {job.location}</p>
                  <p className="text-sm text-slate-600">₹{job.budget}/hr × {job.hours}hrs = ₹{job.budget * job.hours}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
          <div className="space-y-3">
            {employerBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">No bookings yet</p>
                <button
                  onClick={() => setCurrentPage('workers')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Find Workers
                </button>
              </div>
            ) : (
              employerBookings.map(booking => (
                <div key={booking.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{booking.workerName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'Requested' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{booking.date} at {booking.startTime}</p>
                  <p className="text-sm text-slate-600">{booking.hours} hours - ₹{booking.totalCost}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pricing Page
const PricingPage = () => {
  const pricingData = [
    { skill: 'Welder', min: 200, max: 500 },
    { skill: 'Polisher', min: 150, max: 300 },
    { skill: 'Electrician', min: 250, max: 400 },
    { skill: 'Carpenter', min: 300, max: 600 },
    { skill: 'Painter', min: 250, max: 450 },
    { skill: 'Plumber', min: 250, max: 400 },
    { skill: 'Fabricator', min: 300, max: 500 },
    { skill: 'Machine Operator', min: 200, max: 400 },
    { skill: 'Mechanic', min: 250, max: 450 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Pricing Guide</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left">Skill</th>
              <th className="px-6 py-4 text-left">Minimum Rate</th>
              <th className="px-6 py-4 text-left">Maximum Rate</th>
              <th className="px-6 py-4 text-left">Average</th>
            </tr>
          </thead>
          <tbody>
            {pricingData.map((item, idx) => (
              <tr key={item.skill} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                <td className="px-6 py-4 font-semibold">{item.skill}</td>
                <td className="px-6 py-4">₹{item.min}/hr</td>
                <td className="px-6 py-4">₹{item.max}/hr</td>
                <td className="px-6 py-4 text-blue-600 font-bold">₹{Math.round((item.min + item.max) / 2)}/hr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Booking Terms</h2>
          <ul className="space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Minimum booking: 2 hours</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Overtime rate: 1.5× after 8 hours/day</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Rates may vary by experience and location</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Payment due upon job completion</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">FAQs</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">How is pricing calculated?</p>
              <p className="text-sm text-slate-700">Total cost = Hourly rate × Number of hours. Overtime applies after 8 hours.</p>
            </div>
            <div>
              <p className="font-semibold">Can I negotiate rates?</p>
              <p className="text-sm text-slate-700">Yes, rates are flexible based on job complexity and duration.</p>
            </div>
            <div>
              <p className="font-semibold">What about materials?</p>
              <p className="text-sm text-slate-700">Material costs are separate and should be discussed before work begins.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Page
const LoginPage = ({ setCurrentPage }) => {
  const { login } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await authService.login(formData.email, formData.password);
      
      if (data.success) {
        login(data.user);
        setCurrentPage(data.user.type === 'worker' ? 'worker-dashboard' : 'employer-dashboard');
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Login</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-4">
        <div>
          <label className="block font-semibold mb-2">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block font-semibold mb-2">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2 border rounded-lg"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          Login
        </button>

        <div className="text-center text-slate-600">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => setCurrentPage('worker-register')}
            className="text-blue-600 hover:underline"
          >
            Register as Worker
          </button>
          {' '}or{' '}
          <button
            type="button"
            onClick={() => setCurrentPage('employer-register')}
            className="text-blue-600 hover:underline"
          >
            Register as Employer
          </button>
        </div>
      </form>
    </div>
  );
};

// Admin Page
const AdminPage = () => {
  const { workers, jobs, bookings } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Users className="w-10 h-10 text-blue-600 mb-2" />
          <p className="text-sm text-slate-600">Total Workers</p>
          <p className="text-3xl font-bold">{workers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Briefcase className="w-10 h-10 text-green-600 mb-2" />
          <p className="text-sm text-slate-600">Total Jobs</p>
          <p className="text-3xl font-bold">{jobs.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FileText className="w-10 h-10 text-amber-600 mb-2" />
          <p className="text-sm text-slate-600">Total Bookings</p>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <DollarSign className="w-10 h-10 text-purple-600 mb-2" />
          <p className="text-sm text-slate-600">Revenue (Mock)</p>
          <p className="text-3xl font-bold">₹{bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Workers by Skill</h2>
          <div className="space-y-2">
            {skills.map(skill => {
              const count = workers.filter(w => w.skill === skill).length;
              return (
                <div key={skill} className="flex justify-between items-center">
                  <span>{skill}</span>
                  <span className="font-bold text-blue-600">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {bookings.slice(-5).reverse().map(booking => (
              <div key={booking.id} className="border-l-4 border-blue-600 pl-3">
                <p className="font-semibold text-sm">{booking.workerName} booked by {booking.employerName}</p>
                <p className="text-xs text-slate-600">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-slate-600">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'workers':
        return <WorkersPage setCurrentPage={setCurrentPage} />;
      case 'jobs':
        return <JobsPage setCurrentPage={setCurrentPage} />;
      case 'worker-register':
        return <WorkerRegisterPage setCurrentPage={setCurrentPage} />;
      case 'employer-register':
        return <EmployerRegisterPage setCurrentPage={setCurrentPage} />;
      case 'worker-dashboard':
        return <WorkerDashboard />;
      case 'employer-dashboard':
        return <EmployerDashboard setCurrentPage={setCurrentPage} />;
      case 'pricing':
        return <PricingPage />;
      case 'admin':
        return <AdminPage />;
      case 'login':
        return <LoginPage setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100">
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        {renderPage()}
        <Footer />
      </div>
    </AppProvider>
  );
};

export default App;