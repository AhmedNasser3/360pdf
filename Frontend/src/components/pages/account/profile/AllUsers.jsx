import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaUserCircle, FaEdit, FaPlus, FaMinus, FaTrash } from "react-icons/fa";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    points: 0,
  });

  useEffect(() => {
    axios
      .get("/api/users/all")
      .then((res) => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API error:", err);
        setLoading(false);
      });
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      points: user.points,
    });
  };

  const handleSave = () => {
    axios
      .put(`/api/users/${editUser.id}`, formData)
      .then((res) => {
        setUsers((prev) =>
          prev.map((u) => (u.id === editUser.id ? res.data : u))
        );
        setEditUser(null);
      })
      .catch((err) => console.error("Update error:", err));
  };

  const handleDelete = (id) => {
    axios
      .delete(`/api/users/${id}`)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setDeleteUser(null);
      })
      .catch((err) => console.error("Delete error:", err));
  };

  const incrementPoints = (user) => {
    const updatedPoints = user.points + 1;
    axios
      .put(`/api/users/${user.id}`, { points: updatedPoints })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, points: updatedPoints } : u))
        );
      })
      .catch((err) => console.error("Increment error:", err));
  };

  const decrementPoints = (user) => {
    const updatedPoints = user.points - 1;
    axios
      .put(`/api/users/${user.id}`, { points: updatedPoints })
      .then(() => {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, points: updatedPoints } : u))
        );
      })
      .catch((err) => console.error("Decrement error:", err));
  };

  return (
    <motion.div
      className="xxsct_allusers xxsct_card alienTable123"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2>All Users</h2>

      <div className="xxsct_search_bar funkySearch987">
        <FaSearch />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="xxsct_table_wrapper cosmicTable456">
          <table className="xxsct_table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Points</th>
                <th>Actions</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="xxsct_user_cell">
                        <FaUserCircle /> {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td>
                      {user.points}
                      <button className="mini-btn" onClick={() => incrementPoints(user)}>
                        <FaPlus />
                      </button>
                      <button className="mini-btn" onClick={() => decrementPoints(user)}>
                        <FaMinus />
                      </button>
                    </td>
                    <td>
                      <button className="mini-btn" onClick={() => handleEdit(user)}>
                        <FaEdit />
                      </button>
                      <button className="mini-btn danger" onClick={() => setDeleteUser(user)}>
                        <FaTrash />
                      </button>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* نافذة تعديل المستخدم */}
      <AnimatePresence>
        {editUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content small"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3>Edit User</h3>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Name"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email"
              />
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="suspend">Suspend</option>
              </select>
              <input
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({ ...formData, points: parseInt(e.target.value) })
                }
                placeholder="Points"
              />
              <div className="modal-actions">
                <button className="primary small-btn" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="secondary small-btn"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* نافذة تأكيد الحذف */}
      <AnimatePresence>
        {deleteUser && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content small"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h4>Are you sure you want to delete {deleteUser.name}?</h4>
              <div className="modal-actions">
                <button
                  className="danger small-btn"
                  onClick={() => handleDelete(deleteUser.id)}
                >
                  Delete
                </button>
                <button
                  className="secondary small-btn"
                  onClick={() => setDeleteUser(null)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AllUsers;
