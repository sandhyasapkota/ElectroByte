import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaCalendar, FaClock, FaLaptop, FaWrench, FaTimes, FaCheck, FaArrowLeft, FaHome } from "react-icons/fa";
import { appointmentAPI } from "../services/api";
import { useToast } from "../Component/Toast";

const BookRepair = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slotAvailability, setSlotAvailability] = useState({});
  const [maxPerSlot, setMaxPerSlot] = useState(5);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    deviceType: "",
    deviceBrand: "",
    issueDescription: "",
    pickupRequired: false,
    pickupAddress: ""
  });

  const deviceTypes = ["Laptop", "Desktop", "Mobile Phone", "Tablet", "Monitor", "Printer", "Other"];
  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch slot availability when date changes
  useEffect(() => {
    if (formData.appointmentDate) {
      fetchSlotAvailability(formData.appointmentDate);
    } else {
      setSlotAvailability({});
    }
  }, [formData.appointmentDate]);

  const fetchSlotAvailability = async (date) => {
    setLoadingSlots(true);
    try {
      const response = await appointmentAPI.getSlotAvailability(date);
      setSlotAvailability(response.data || {});
      setMaxPerSlot(response.maxPerSlot || 5);
    } catch (err) {
      console.error("Failed to fetch slot availability:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const isSlotFull = (slot) => {
    return (slotAvailability[slot] || 0) >= maxPerSlot;
  };

  const getSlotStatus = (slot) => {
    const count = slotAvailability[slot] || 0;
    const remaining = maxPerSlot - count;
    if (remaining <= 0) return { text: "Full", color: "text-red-500" };
    if (remaining <= 2) return { text: `${remaining} left`, color: "text-orange-500" };
    return { text: `${remaining} available`, color: "text-green-500" };
  };

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getMyAppointments();
      setAppointments(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      const response = await appointmentAPI.book(formData);
      setSuccess(`Appointment booked! Repair Token: ${response.data.repairToken}`);
      setShowModal(false);
      setFormData({
        appointmentDate: "",
        appointmentTime: "",
        deviceType: "",
        deviceBrand: "",
        issueDescription: "",
        pickupRequired: false,
        pickupAddress: ""
      });
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      await appointmentAPI.cancel(id);
      fetchAppointments();
      toast.success("Appointment cancelled successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <FaWrench className="text-3xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">Repair Service</h1>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">Professional repair services for all your devices. Fast, reliable, and affordable.</p>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
                <FaHome className="text-xs" /> Home
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium">Repair Service</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 -mt-8 relative z-10">
          {/* Book Button Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 border border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Need a repair?</h2>
              <p className="text-gray-600">Book an appointment with our expert technicians</p>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <FaWrench /> Book Appointment
            </button>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <FaCheck className="text-green-500" />
              {success}
            </div>
          )}

          {/* My Appointments */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              My Appointments
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
                <FaCalendar className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No appointments yet. Book your first repair!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <FaLaptop className="text-xl text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{apt.deviceType}</h3>
                          <p className="text-sm text-gray-500">{apt.deviceBrand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.status === 'pending' && (
                          <button 
                            onClick={() => cancelAppointment(apt.id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{apt.issueDescription}</p>
                    
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendar className="text-blue-500" /> {new Date(apt.appointmentDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock className="text-purple-500" /> {apt.appointmentTime}
                      </span>
                    </div>
                    
                    {apt.Repair && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm">
                          <span className="text-gray-500">Repair Token: </span>
                          <span className="font-mono font-semibold text-blue-600">{apt.Repair.repairToken}</span>
                        </p>
                        {apt.Repair.estimatedCost && (
                          <p className="text-sm">
                            <span className="text-gray-500">Estimated Cost: </span>
                            <span className="font-semibold">NPR {apt.Repair.estimatedCost}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Track Repair */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              Track Repair
            </h2>
            <TrackRepair />
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Book Repair Appointment</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                  <FaTimes />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({...formData, appointmentDate: e.target.value, appointmentTime: ""})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                    <select
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={!formData.appointmentDate || loadingSlots}
                    >
                      <option value="">{loadingSlots ? "Loading slots..." : "Select time"}</option>
                      {timeSlots.map(slot => {
                        const isFull = isSlotFull(slot);
                        const status = getSlotStatus(slot);
                        return (
                          <option 
                            key={slot} 
                            value={slot} 
                            disabled={isFull}
                          >
                            {slot} {formData.appointmentDate ? `- ${status.text}` : ""}
                          </option>
                        );
                      })}
                    </select>
                    {formData.appointmentDate && !loadingSlots && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {timeSlots.map(slot => {
                          const isFull = isSlotFull(slot);
                          const status = getSlotStatus(slot);
                          return (
                            <span 
                              key={slot} 
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                isFull 
                                  ? "bg-red-100 text-red-600 line-through" 
                                  : status.color.includes("orange") 
                                    ? "bg-orange-100 text-orange-600"
                                    : "bg-green-100 text-green-600"
                              }`}
                            >
                              {slot.replace(" AM", "").replace(" PM", "")}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type *</label>
                    <select
                      value={formData.deviceType}
                      onChange={(e) => setFormData({...formData, deviceType: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select device</option>
                      {deviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      value={formData.deviceBrand}
                      onChange={(e) => setFormData({...formData, deviceBrand: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Dell, HP, Apple"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description *</label>
                  <textarea
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({...formData, issueDescription: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    placeholder="Describe the issue with your device..."
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.pickupRequired}
                      onChange={(e) => setFormData({...formData, pickupRequired: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">I need pickup service</span>
                  </label>
                </div>

                {formData.pickupRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
                    <textarea
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows="2"
                      placeholder="Enter pickup address..."
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Book Appointment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Track Repair Component
const TrackRepair = () => {
  const [token, setToken] = useState("");
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setLoading(true);
    setError("");
    setRepair(null);
    
    try {
      const response = await appointmentAPI.getRepairStatus(token);
      setRepair(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['received', 'diagnosing', 'in_progress', 'completed', 'ready_pickup'];
  
  const getStepIndex = (status) => {
    const index = statusSteps.indexOf(status);
    return index >= 0 ? index : 0;
  };

  return (
    <div>
      <form onSubmit={handleTrack} className="flex gap-2 mb-4">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter Repair Token (e.g., RPR-XXXXX)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium shadow-md hover:shadow-lg transition-all"
        >
          {loading ? "..." : "Track"}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl border border-red-200">{error}</div>
      )}

      {repair && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
          <div className="mb-4">
            <span className="text-gray-500">Token: </span>
            <span className="font-mono font-semibold text-blue-600">{repair.repairToken}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex justify-between mb-2">
            {statusSteps.map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  index <= getStepIndex(repair.status) 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index <= getStepIndex(repair.status) ? <FaCheck /> : index + 1}
                </div>
                <span className="text-xs mt-1 text-center capitalize text-gray-600">
                  {step.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>

          {repair.estimatedCost && (
            <p className="mt-4 text-sm">
              <span className="text-gray-500">Estimated Cost: </span>
              <span className="font-semibold text-gray-800">NPR {repair.estimatedCost}</span>
            </p>
          )}
          
          {repair.technicianNotes && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Technician Notes:</p>
              <p className="text-sm text-gray-800">{repair.technicianNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookRepair;
