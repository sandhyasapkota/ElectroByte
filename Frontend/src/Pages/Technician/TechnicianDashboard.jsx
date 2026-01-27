import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaTools, FaClipboardList, FaClock, FaCheckCircle, 
  FaSpinner, FaUser, FaPhone, FaEnvelope, FaCalendar,
  FaLaptop, FaMobile, FaDesktop, FaSave, FaTimes,
  FaSignOutAlt
} from "react-icons/fa";
import { appointmentAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { getUser } from "../../lib/storage";

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const [updateData, setUpdateData] = useState({
    status: "",
    technicianNotes: "",
    estimatedCost: "",
    finalCost: ""
  });

  useEffect(() => {
    checkTechnicianAccess();
    fetchJobs();
  }, []);

  const checkTechnicianAccess = () => {
    const user = getUser() || {};
    if (user.role !== "technician" && user.role !== "admin") {
      navigate("/login");
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await appointmentAPI.getTechnicianJobs();
      if (response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setUpdateData({
      status: job.status || "received",
      technicianNotes: job.technicianNotes || "",
      estimatedCost: job.estimatedCost || "",
      finalCost: job.finalCost || ""
    });
    setShowModal(true);
  };

  const handleUpdateJob = async () => {
    if (!selectedJob) return;
    
    setUpdating(true);
    try {
      const response = await appointmentAPI.updateRepairStatus(selectedJob.id, updateData);
      console.log("Update response:", response);
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === selectedJob.id ? { ...job, ...updateData } : job
      ));
      
      setShowModal(false);
      setSelectedJob(null);
      toast.success("Repair status updated successfully!");
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-600';
      case 'diagnosing': return 'bg-yellow-100 text-yellow-600';
      case 'in_progress': return 'bg-orange-100 text-orange-600';
      case 'waiting_parts': return 'bg-purple-100 text-purple-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'ready_pickup': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received': return <FaClipboardList />;
      case 'diagnosing': return <FaSpinner className="animate-spin" />;
      case 'in_progress': return <FaTools />;
      case 'completed': return <FaCheckCircle />;
      default: return <FaClock />;
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'laptop': return <FaLaptop className="text-2xl" />;
      case 'mobile': case 'phone': return <FaMobile className="text-2xl" />;
      case 'desktop': return <FaDesktop className="text-2xl" />;
      default: return <FaTools className="text-2xl" />;
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filterStatus === "all") return true;
    return job.status === filterStatus;
  });

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => ['received', 'diagnosing'].includes(j.status)).length,
    inProgress: jobs.filter(j => ['in_progress', 'waiting_parts'].includes(j.status)).length,
    completed: jobs.filter(j => ['completed', 'ready_pickup'].includes(j.status)).length
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaTools className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Technician Dashboard</h1>
              <p className="text-sm text-gray-500">Manage your repair jobs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaTools className="text-orange-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Jobs' },
              { value: 'received', label: 'Received' },
              { value: 'diagnosing', label: 'Diagnosing' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'waiting_parts', label: 'Waiting Parts' },
              { value: 'completed', label: 'Completed' },
              { value: 'ready_pickup', label: 'Ready for Pickup' }
            ].map(status => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  filterStatus === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FaTools className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No jobs found</h3>
            <p className="text-gray-500">Check back later for assigned repairs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => openJobModal(job)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                      {getDeviceIcon(job.Appointment?.deviceType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {job.Appointment?.deviceType} - {job.Appointment?.deviceBrand}
                      </h3>
                      <p className="text-sm text-gray-500">Token: {job.repairToken}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)} {job.status?.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {job.Appointment?.issueDescription}
                </p>
                
                <div className="border-t pt-4 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <FaCalendar />
                    <span>{new Date(job.Appointment?.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  {job.estimatedCost && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Est. Cost:</span>
                      <span>Rs. {job.estimatedCost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Update Job Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Update Repair Status</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Job Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">
                  {selectedJob.Appointment?.deviceType} - {selectedJob.Appointment?.deviceBrand}
                </h3>
                <p className="text-sm text-gray-600">{selectedJob.Appointment?.issueDescription}</p>
                <p className="text-sm text-gray-500 mt-2">Token: {selectedJob.repairToken}</p>
              </div>

              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'received', label: 'Received' },
                    { value: 'diagnosing', label: 'Diagnosing' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'waiting_parts', label: 'Waiting Parts' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'ready_pickup', label: 'Ready for Pickup' }
                  ].map(status => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setUpdateData({ ...updateData, status: status.value })}
                      className={`px-4 py-2 rounded-lg transition-all text-sm ${
                        updateData.status === status.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician Notes</label>
                <textarea
                  value={updateData.technicianNotes}
                  onChange={(e) => setUpdateData({ ...updateData, technicianNotes: e.target.value })}
                  placeholder="Add notes about the repair..."
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Costs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                  <input
                    type="number"
                    value={updateData.estimatedCost}
                    onChange={(e) => setUpdateData({ ...updateData, estimatedCost: e.target.value })}
                    placeholder="Rs. 0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Cost</label>
                  <input
                    type="number"
                    value={updateData.finalCost}
                    onChange={(e) => setUpdateData({ ...updateData, finalCost: e.target.value })}
                    placeholder="Rs. 0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateJob}
                disabled={updating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FaSave /> {updating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
