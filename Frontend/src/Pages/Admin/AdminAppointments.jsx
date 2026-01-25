import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEye, FaUserCog, FaTimes, FaTools, FaSync } from "react-icons/fa";
import { appointmentAPI, adminAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import Pagination, { usePagination } from "../../Component/Pagination";
import AdminSidebar from "./AdminSidebar";

const AdminAppointments = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApt, setSelectedApt] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchData();
    
    // Auto-refresh every 30 seconds to get technician updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
    }
  };

  const fetchData = async (showRefreshState = false) => {
    if (showRefreshState) setRefreshing(true);
    try {
      const [aptRes, techRes] = await Promise.all([
        appointmentAPI.getAllAppointments(),
        adminAPI.getAllTechnicians()
      ]);
      if (aptRes.data) setAppointments(aptRes.data);
      if (techRes.data) setTechnicians(techRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleAssignTechnician = async (appointmentId, technicianId) => {
    try {
      // Find the repair ID for this appointment
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment?.Repair?.id) {
        toast.error("No repair record found for this appointment");
        return;
      }
      await appointmentAPI.assignTechnician(appointment.Repair.id, technicianId);
      fetchData();
      setShowModal(false);
      toast.success("Technician assigned successfully!");
    } catch (error) {
      console.error("Error assigning technician:", error);
      toast.error("Failed to assign technician: " + error.message);
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, status);
      fetchData();
      // Update local selected appointment
      setSelectedApt(prev => ({ ...prev, status }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.deviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.User?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Check both appointment status and repair status
    const repairStatuses = ['ready_pickup', 'in_progress', 'waiting_parts', 'diagnosing', 'received'];
    let matchesStatus = filterStatus === "all";
    
    if (repairStatuses.includes(filterStatus)) {
      // Filter by repair status
      matchesStatus = apt.Repair?.status === filterStatus;
    } else if (filterStatus !== "all") {
      // Filter by appointment status
      matchesStatus = apt.status === filterStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedAppointments,
    goToPage
  } = usePagination(filteredAppointments, 10);
    


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'confirmed': return 'bg-blue-100 text-blue-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRepairStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-600';
      case 'diagnosing': return 'bg-yellow-100 text-yellow-600';
      case 'in_progress': return 'bg-orange-100 text-orange-600';
      case 'waiting_parts': return 'bg-purple-100 text-purple-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'ready_pickup': return 'bg-teal-100 text-teal-600 font-semibold';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatRepairStatus = (status) => {
    switch (status) {
      case 'received': return 'Received';
      case 'diagnosing': return 'Diagnosing';
      case 'in_progress': return 'In Progress';
      case 'waiting_parts': return 'Waiting Parts';
      case 'completed': return 'Completed';
      case 'ready_pickup': return '✅ Ready for Pickup';
      default: return status || 'Not Started';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <AdminSidebar active="Appointments" />
      
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Appointment Management</h1>
            <p className="text-gray-500 mt-2">View and manage repair appointments</p>
          </div>
          <div className="text-right">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 ${refreshing ? 'opacity-50' : ''}`}
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Repair Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div 
            onClick={() => setFilterStatus('ready_pickup')}
            className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="text-3xl font-bold text-teal-600">
              {appointments.filter(apt => apt.Repair?.status === 'ready_pickup').length}
            </div>
            <div className="text-sm text-teal-700 font-medium">✅ Ready for Pickup</div>
          </div>
          <div 
            onClick={() => setFilterStatus('in_progress')}
            className="bg-orange-50 border border-orange-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="text-3xl font-bold text-orange-600">
              {appointments.filter(apt => apt.Repair?.status === 'in_progress').length}
            </div>
            <div className="text-sm text-orange-700">In Progress</div>
          </div>
          <div 
            onClick={() => setFilterStatus('waiting_parts')}
            className="bg-purple-50 border border-purple-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="text-3xl font-bold text-purple-600">
              {appointments.filter(apt => apt.Repair?.status === 'waiting_parts').length}
            </div>
            <div className="text-sm text-purple-700">Waiting Parts</div>
          </div>
          <div 
            onClick={() => setFilterStatus('all')}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="text-3xl font-bold text-gray-600">
              {appointments.length}
            </div>
            <div className="text-sm text-gray-700">Total Appointments</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
          <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by device or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Appointment Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filterStatus === 'ready_pickup' || filterStatus === 'in_progress' ? filterStatus : ''}
            onChange={(e) => e.target.value && setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50"
          >
            <option value="">Filter by Repair Status</option>
            <option value="ready_pickup">🔔 Ready for Pickup</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_parts">Waiting Parts</option>
          </select>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appt Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repair Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <FaTools className="mx-auto text-4xl mb-2 text-gray-300" />
                    No appointments found
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{apt.User?.username || 'User'}</p>
                      <p className="text-sm text-gray-500">{apt.User?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{apt.deviceType}</p>
                      <p className="text-sm text-gray-500">{apt.deviceBrand}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{apt.appointmentTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {apt.Repair ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${getRepairStatusColor(apt.Repair.status)}`}>
                          {formatRepairStatus(apt.Repair.status)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No repair</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {apt.Repair?.Technician?.User?.username || (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedApt(apt); setShowModal(true); }}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        <FaEye className="inline mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          itemsPerPage={10}
          itemName="appointments"
        />

        {/* Appointment Detail Modal */}
        {showModal && selectedApt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Appointment Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">{selectedApt.User?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedApt.User?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Device</p>
                    <p className="font-medium">{selectedApt.deviceType} - {selectedApt.deviceBrand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium">
                      {new Date(selectedApt.appointmentDate).toLocaleDateString()} at {selectedApt.appointmentTime}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Issue Description</p>
                  <p className="font-medium">{selectedApt.issueDescription}</p>
                </div>

                {selectedApt.pickupRequired && (
                  <div>
                    <p className="text-sm text-gray-500">Pickup Address</p>
                    <p className="font-medium">{selectedApt.pickupAddress}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Assign Technician</p>
                  <select
                    value={selectedApt.Repair?.technicianId || ""}
                    onChange={(e) => handleAssignTechnician(selectedApt.id, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select technician...</option>
                    {technicians.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.User?.username} - {tech.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Repair Status Section - Shows technician updates */}
                {selectedApt.Repair && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <FaTools className="text-purple-600" /> Repair Status (Updated by Technician)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Current Status</p>
                        <span className={`inline-block mt-1 px-3 py-1 text-sm rounded-full ${getRepairStatusColor(selectedApt.Repair.status)}`}>
                          {formatRepairStatus(selectedApt.Repair.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Technician</p>
                        <p className="font-medium">{selectedApt.Repair.Technician?.User?.username || 'Not assigned'}</p>
                      </div>
                      {selectedApt.Repair.estimatedCost && (
                        <div>
                          <p className="text-sm text-gray-500">Estimated Cost</p>
                          <p className="font-medium text-green-600">Rs. {selectedApt.Repair.estimatedCost}</p>
                        </div>
                      )}
                      {selectedApt.Repair.finalCost && (
                        <div>
                          <p className="text-sm text-gray-500">Final Cost</p>
                          <p className="font-medium text-green-600">Rs. {selectedApt.Repair.finalCost}</p>
                        </div>
                      )}
                      {selectedApt.Repair.technicianNotes && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Technician Notes</p>
                          <p className="font-medium bg-white p-2 rounded mt-1">{selectedApt.Repair.technicianNotes}</p>
                        </div>
                      )}
                      {selectedApt.Repair.completedAt && (
                        <div>
                          <p className="text-sm text-gray-500">Completed At</p>
                          <p className="font-medium">{new Date(selectedApt.Repair.completedAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-2">Update Appointment Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedApt.id, status)}
                        className={`px-4 py-2 rounded-lg capitalize ${
                          selectedApt.status === status 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAppointments;
