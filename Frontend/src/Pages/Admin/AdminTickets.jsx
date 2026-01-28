import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaReply, FaTimes, FaEnvelope, FaHeadset, FaPaperPlane, FaComments, FaExclamationTriangle, FaUser, FaUserSlash } from "react-icons/fa";
import { ticketAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import Pagination, { usePagination } from "../../Component/Pagination";
import AdminSidebar from "./AdminSidebar";

const AdminTickets = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const isAdmin = checkAdminAccess();
    if (isAdmin) fetchTickets();
  }, []);

  const checkAdminAccess = () => {
    const user = getUser() || {};
    if (user.role !== "admin") {
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getAllTickets();
      if (response.data) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e?.preventDefault();
    const trimmed = replyText.trim();
    if (sending) return;
    if (!trimmed) return;
    
    setSending(true);
    try {
      // Use addReply (POST) for chat-style replies - backend detects admin from token
      await ticketAPI.addReply(selectedTicket.id, trimmed);
      // Fetch the updated ticket with replies
      const response = await ticketAPI.getById(selectedTicket.id);
      if (response.data) {
        setSelectedTicket(response.data);
        // Update in list too
        setTickets(prev => prev.map(t => t.id === response.data.id ? response.data : t));
      }
      setReplyText("");
      toast.success("Reply sent successfully!");
    } catch (error) {
      console.error("Error replying to ticket:", error);
      toast.error(error?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const openTicketChat = async (ticket) => {
    try {
      // Fetch full ticket with replies
      const response = await ticketAPI.getById(ticket.id);
      if (response.data) {
        setSelectedTicket(response.data);
      } else {
        setSelectedTicket(ticket);
      }
    } catch (error) {
      setSelectedTicket(ticket);
    }
    setShowModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketAPI.updateStatus(selectedTicket.id, newStatus);
      // Update selected ticket
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      // Update in list
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: newStatus } : t));
      toast.success(`Ticket status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update ticket status");
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesType = filterType === "all" || ticket.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedTickets,
    goToPage
  } = usePagination(filteredTickets, 10);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-600';
      case 'open': return 'bg-yellow-100 text-yellow-600';
      case 'in_progress': return 'bg-blue-100 text-blue-600';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
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
      <AdminSidebar active="Tickets" />
      
      <main className="flex-1 ml-0 lg:ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Support Tickets</h1>
          <p className="text-gray-500 mt-2">Manage customer support tickets and contact inquiries</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1.5 text-orange-600">
              <FaHeadset /> <span className="font-medium">Support:</span> <span className="text-gray-500">From registered users (can chat)</span>
            </span>
            <span className="flex items-center gap-1.5 text-purple-600">
              <FaEnvelope /> <span className="font-medium">Contact:</span> <span className="text-gray-500">From guests (reply via email)</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 flex flex-wrap gap-4 items-center border border-gray-100">
          <div className="flex-1 min-w-[200px] relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ticket #, name, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="contact">Contact</option>
            <option value="support">Support</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-lg border border-gray-100">
              <FaEnvelope className="mx-auto text-4xl mb-2 text-gray-300" />
              No tickets found
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">#{ticket.ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.type === 'contact' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {ticket.type === 'contact' ? <><FaEnvelope className="inline mr-1" /> Contact</> : <><FaHeadset className="inline mr-1" /> Support</>}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{ticket.subject}</h3>
                    <p className="text-gray-600 text-sm mb-1 flex items-center gap-2">
                      From: {ticket.name} ({ticket.email})
                      {ticket.userId ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <FaUser className="text-[10px]" /> Registered
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <FaUserSlash className="text-[10px]" /> Guest
                        </span>
                      )}
                    </p>
                    <p className="text-gray-500 text-sm line-clamp-2">{ticket.message}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => openTicketChat(ticket)}
                      className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                    >
                      <FaComments /> Chat
                    </button>
                  </div>
                </div>
                
                {ticket.adminReply && (
                  <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <p className="text-sm text-gray-500 mb-1">Admin Reply ({new Date(ticket.repliedAt).toLocaleDateString()}):</p>
                    <p className="text-gray-700">{ticket.adminReply}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={goToPage}
          totalItems={totalItems}
          itemsPerPage={10}
          itemName="tickets"
        />

        {/* Chat Modal */}
        {showModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{selectedTicket.subject}</h2>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      selectedTicket.type === 'contact' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {selectedTicket.type === 'contact' ? 'Contact Inquiry' : 'Support Ticket'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    #{selectedTicket.ticketNumber} • {selectedTicket.name} ({selectedTicket.email})
                  </p>
                  {/* User registration status */}
                  <p className={`text-xs mt-1 flex items-center gap-1 ${selectedTicket.userId ? 'text-green-600' : 'text-amber-600'}`}>
                    {selectedTicket.userId ? (
                      <><FaUser className="text-xs" /> Registered User - Can view replies in Support Center</>
                    ) : (
                      <><FaUserSlash className="text-xs" /> Guest - Reply will be sent via email only</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg border-0 font-medium cursor-pointer focus:ring-2 focus:ring-blue-500 ${getStatusColor(selectedTicket.status)}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={() => { setShowModal(false); setReplyText(""); }} className="text-gray-500 hover:text-gray-700">
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[300px]">
                {/* Original Message from User */}
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm p-4 rounded-2xl rounded-bl-none max-w-[80%]">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Customer</p>
                    <p className="text-gray-800">{selectedTicket.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Ticket Replies */}
                {(selectedTicket.TicketReplies || []).map((reply) => (
                  <div
                    key={reply.id}
                    className={`flex ${reply.isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`p-4 rounded-2xl max-w-[80%] ${
                      reply.isAdmin 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white border shadow-sm rounded-bl-none'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${reply.isAdmin ? 'text-blue-200' : 'text-blue-600'}`}>
                        {reply.isAdmin ? 'You (Admin)' : 'Customer'}
                      </p>
                      <p>{reply.message}</p>
                      <p className={`text-xs mt-2 ${reply.isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Legacy admin reply (old system) */}
                {selectedTicket.adminReply && !selectedTicket.TicketReplies?.length && (
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-br-none max-w-[80%]">
                      <p className="text-xs text-blue-200 font-semibold mb-1">You (Admin)</p>
                      <p>{selectedTicket.adminReply}</p>
                      <p className="text-xs text-blue-200 mt-2">
                        {selectedTicket.repliedAt && new Date(selectedTicket.repliedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reply Input */}
              <div className="border-t">
                {/* Warning for contact/guest tickets */}
                {selectedTicket.type === 'contact' && !selectedTicket.userId && (
                  <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-amber-700 text-sm">
                    <FaExclamationTriangle />
                    <span>This is a guest inquiry. Your reply will only be visible here and should be sent via email manually to <strong>{selectedTicket.email}</strong></span>
                  </div>
                )}
                <form onSubmit={handleReply} className="p-4 flex gap-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={selectedTicket.userId ? "Type your reply..." : "Add internal note or reply..."}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <FaPaperPlane /> {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTickets;
