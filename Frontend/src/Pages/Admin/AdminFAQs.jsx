import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaQuestionCircle } from "react-icons/fa";
import { faqAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import AdminSidebar from "./AdminSidebar";

const AdminFAQs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0
  });

  const categories = ["General", "Support", "Payment", "Products", "Shipping", "Returns"];

  useEffect(() => {
    const isAdmin = checkAdminAccess();
    if (isAdmin) fetchFAQs();
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchFAQs = async () => {
    try {
      const response = await faqAPI.getAll();
      if (response.data) {
        setFaqs(response.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await faqAPI.update(selectedFaq.id, formData);
      } else {
        await faqAPI.create(formData);
      }
      fetchFAQs();
      setShowModal(false);
      resetForm();
      toast.success(editMode ? "FAQ updated successfully!" : "FAQ created successfully!");
    } catch (error) {
      console.error("Error saving FAQ:", error);
      toast.error("Failed to save FAQ");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await faqAPI.delete(id);
        setFaqs(faqs.filter(f => f.id !== id));
        toast.success("FAQ deleted successfully!");
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        toast.error("Failed to delete FAQ");
      }
    }
  };

  const openEditModal = (faq) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "General",
      order: faq.order || 0
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "", category: "General", order: 0 });
    setSelectedFaq(null);
    setEditMode(false);
  };

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const category = faq.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:flex-row">
      {/* Sidebar: hidden on mobile, visible on md+ */}
      <AdminSidebar active="FAQs" />
      {/* Main Content */}
      <main className="flex-1 w-full ml-0 lg:ml-64 px-2 sm:px-4 md:px-8 py-4 md:py-8">
        <div className="mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">FAQ Management</h1>
            <p className="text-gray-500 mt-2">Manage frequently asked questions</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg md:rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-md md:shadow-lg hover:shadow-xl transition-all"
          >
            <FaPlus /> Add FAQ
          </button>
        </div>

        {/* FAQs by Category */}
        {Object.keys(groupedFaqs).length === 0 ? (
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-8 text-center text-gray-500 shadow-md md:shadow-lg border border-gray-100">
            <FaQuestionCircle className="mx-auto text-4xl mb-2 text-gray-300" />
            No FAQs yet. Add one to get started.
          </div>
        ) : (
          Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">{category}</h2>
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg divide-y border border-gray-100">
                {categoryFaqs.map((faq) => (
                  <div key={faq.id} className="p-2 md:p-4 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-2 md:gap-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1">{faq.question}</h3>
                        <p className="text-gray-600 text-sm">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0 ml-0 md:ml-4">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-2">
            <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-lg shadow-xl md:shadow-2xl border border-gray-100">
              <div className="p-4 md:p-6 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">{editMode ? 'Edit' : 'Add'} FAQ</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-all">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the answer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    {editMode ? 'Update' : 'Add'} FAQ
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

export default AdminFAQs;
