import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import AdminSidebar from "./AdminSidebar";

const AdminTechnicians = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    specialization: "",
    experience: ""
  });

  useEffect(() => {
    checkAdminAccess();
    fetchData();
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
    }
  };

  const fetchData = async () => {
    try {
      const [techRes, usersRes] = await Promise.all([
        adminAPI.getAllTechnicians(),
        adminAPI.getAllUsers()
      ]);
      if (techRes.data) setTechnicians(techRes.data);
      if (usersRes.data) setUsers(usersRes.data.filter(u => u.role !== 'admin'));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await adminAPI.updateTechnician(selectedTechnician.id, formData);
      } else {
        await adminAPI.createTechnician(formData);
      }
      fetchData();
      setShowModal(false);
      resetForm();
      toast.success(editMode ? "Technician updated successfully!" : "Technician added successfully!");
    } catch (error) {
      console.error("Error saving technician:", error);
      toast.error("Failed to save technician");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this technician?")) {
      try {
        await adminAPI.deleteTechnician(id);
        setTechnicians(technicians.filter(t => t.id !== id));
        toast.success("Technician removed successfully!");
      } catch (error) {
        console.error("Error deleting technician:", error);
        toast.error("Failed to remove technician");
      }
    }
  };

  const openEditModal = (tech) => {
    setSelectedTechnician(tech);
    setFormData({
      userId: tech.userId,
      specialization: tech.specialization || "",
      experience: tech.experience || ""
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ userId: "", specialization: "", experience: "" });
    setSelectedTechnician(null);
    setEditMode(false);
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
      <AdminSidebar active="Technicians" />
      
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Technician Management</h1>
            <p className="text-gray-500 mt-2">Manage repair technicians</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <FaUserPlus /> Add Technician
          </button>
        </div>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-8 text-center text-gray-500 shadow-lg border border-gray-100">
              No technicians found. Add one to get started.
            </div>
          ) : (
            technicians.map((tech) => (
              <div key={tech.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                    {tech.User?.username?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tech.User?.username}</h3>
                    <p className="text-sm text-gray-500">{tech.User?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Specialization</span>
                    <span className="font-medium">{tech.specialization || 'General'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium">{tech.experience || 0} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tech.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {tech.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(tech)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(tech.id)}
                    className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <FaTrash className="inline mr-1" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100">
              <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-bold text-gray-800">{editMode ? 'Edit' : 'Add'} Technician</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!editMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a user...</option>
                      {users.filter(u => !technicians.find(t => t.userId === u.id)).map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Laptop Repair, Desktop Repair"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editMode ? 'Update' : 'Add'} Technician
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTechnicians;
