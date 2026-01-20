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
