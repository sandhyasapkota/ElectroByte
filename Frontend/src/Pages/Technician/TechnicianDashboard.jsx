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
