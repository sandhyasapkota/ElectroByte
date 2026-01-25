import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUsers, FaSearch, FaBan, FaCheck, FaChevronLeft, 
  FaChevronRight, FaUserShield, FaUser, FaTools, FaTimes,
  FaUserCog, FaTrash
} from "react-icons/fa";
import { adminAPI } from "../../services/api";
import { useToast } from "../../Component/Toast";
import { getUser } from "../../lib/storage";
import AdminSidebar from "./AdminSidebar";



        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isBlocked 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openRoleModal(user)}
                        className={`px-3 py-1 rounded-lg text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={user.id === currentUserId}
                        title={user.id === currentUserId ? "Cannot change your own role" : "Change Role"}
                      >
                        <FaUserCog className="inline mr-1" /> Role
                      </button>
                      <button
                        onClick={() => handleBlockUser(user.id, user.isBlocked)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          user.isBlocked
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        } ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={user.id === currentUserId}
                        title={user.id === currentUserId ? "Cannot block yourself" : (user.isBlocked ? "Unblock User" : "Block User")}
                      >
                        {user.isBlocked ? <><FaCheck className="inline mr-1" /> Unblock</> : <><FaBan className="inline mr-1" /> Block</>}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`px-3 py-1 rounded-lg text-sm bg-red-100 text-red-600 hover:bg-red-200 ${user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={user.id === currentUserId}
                        title={user.id === currentUserId ? "Cannot delete yourself" : "Delete User"}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Role Change Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Change User Role</h2>
                <button onClick={() => setShowRoleModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600">
                  Changing role for: <strong>{selectedUser.username}</strong> ({selectedUser.email})
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <div className="flex gap-2">
                  {['user', 'technician', 'admin'].map(role => (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={`flex-1 py-2 px-4 rounded-lg capitalize flex items-center justify-center gap-2 ${
                        newRole === role 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {getRoleIcon(role)}
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show technician fields when promoting to technician */}
              {newRole === 'technician' && selectedUser.role !== 'technician' && (
                <div className="space-y-4 mb-4 p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">Technician Details</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={technicianData.specialization}
                      onChange={(e) => setTechnicianData({ ...technicianData, specialization: e.target.value })}
                      placeholder="e.g., Laptop Repair, Hardware"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      value={technicianData.experience}
                      onChange={(e) => setTechnicianData({ ...technicianData, experience: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  disabled={updating || newRole === selectedUser.role}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
