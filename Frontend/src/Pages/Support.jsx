import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaTicketAlt, FaPlus, FaTimes, FaPaperPlane, 
  FaComments, FaClock, FaCheckCircle, FaSpinner
} from "react-icons/fa";
import { ticketAPI } from "../services/api";
import { getToken, getUser } from "../lib/storage";
import Navbar, { NavbarSpacer } from "../Component/Navbar";
import Pagination, { usePagination } from "../Component/Pagination";

const Support = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  const { currentPage, totalPages, totalItems, paginatedItems: paginatedTickets, goToPage } = usePagination(tickets, 10);
  
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    name: "",
    email: ""
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    fetchTickets();
    loadUserInfo();
  }, []);

  const loadUserInfo = () => {
    const user = getUser() || {};
    setNewTicket(prev => ({
      ...prev,
      name: user.username || "",
      email: user.email || ""
    }));
  };

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getMyTickets();
      if (response.data) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) return;
    
    setCreating(true);
    try {
      const response = await ticketAPI.create(newTicket);
      if (response.data) {
        setTickets([response.data, ...tickets]);
        setShowNewTicketModal(false);
        setNewTicket(prev => ({ ...prev, subject: "", message: "" }));
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreating(false);
    }
  };

  const openChat = async (ticket) => {
    try {
      const response = await ticketAPI.getById(ticket.id);
      if (response.data) {
        setSelectedTicket(response.data);
        setShowChatModal(true);
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      setSelectedTicket(ticket);
      setShowChatModal(true);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    
    setSending(true);
    try {
      const response = await ticketAPI.addReply(selectedTicket.id, newMessage);
      if (response.data) {
        // Add reply to ticket
        setSelectedTicket(prev => ({
          ...prev,
          TicketReplies: [...(prev.TicketReplies || []), response.data]
        }));
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-600';
      case 'in_progress': return 'bg-yellow-100 text-yellow-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      case 'closed': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <FaClock className="text-blue-500" />;
      case 'in_progress': return <FaSpinner className="text-yellow-500" />;
      case 'resolved': return <FaCheckCircle className="text-green-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <NavbarSpacer />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <NavbarSpacer />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
              <p className="text-gray-500 mt-1">Get help from our support team</p>
            </div>
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaPlus /> New Ticket
            </button>
          </div>

          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <FaTicketAlt className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No tickets yet</h3>
              <p className="text-gray-500 mb-6">Create a support ticket if you need help</p>
              <button
                onClick={() => setShowNewTicketModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => openChat(ticket)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ticket.status)}
                      <div>
                        <h3 className="font-semibold text-gray-800">{ticket.subject}</h3>
                        <p className="text-sm text-gray-500">#{ticket.ticketNumber}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor(ticket.status)}`}>
                      {ticket.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ticket.message}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <FaComments /> View Conversation
                    </button>
                  </div>
                </div>
              ))}
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={goToPage}
                itemName="tickets"
              />
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Create Support Ticket</h2>
              <button onClick={() => setShowNewTicketModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Ticket"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="font-bold">{selectedTicket.subject}</h2>
                <p className="text-sm text-gray-500">#{selectedTicket.ticketNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs rounded-full capitalize ${getStatusColor(selectedTicket.status)}`}>
                  {selectedTicket.status?.replace('_', ' ')}
                </span>
                <button onClick={() => setShowChatModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {/* Original Message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-br-none max-w-[80%]">
                  <p>{selectedTicket.message}</p>
                  <p className="text-xs text-blue-200 mt-2">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Replies */}
              {(selectedTicket.TicketReplies || []).map((reply) => (
                <div
                  key={reply.id}
                  className={`flex ${reply.isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`p-4 rounded-2xl max-w-[80%] ${
                    reply.isAdmin 
                      ? 'bg-white border shadow-sm rounded-bl-none' 
                      : 'bg-blue-600 text-white rounded-br-none'
                  }`}>
                    {reply.isAdmin && (
                      <p className="text-xs text-purple-600 font-semibold mb-1">Support Team</p>
                    )}
                    <p>{reply.message}</p>
                    <p className={`text-xs mt-2 ${reply.isAdmin ? 'text-gray-400' : 'text-blue-200'}`}>
                      {new Date(reply.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Legacy admin reply */}
              {selectedTicket.adminReply && !selectedTicket.TicketReplies?.length && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm p-4 rounded-2xl rounded-bl-none max-w-[80%]">
                    <p className="text-xs text-purple-600 font-semibold mb-1">Support Team</p>
                    <p>{selectedTicket.adminReply}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {selectedTicket.repliedAt && new Date(selectedTicket.repliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Reply Input */}
            {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
              <form onSubmit={handleSendReply} className="p-4 border-t flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <FaPaperPlane /> {sending ? "Sending..." : "Send"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Support;
