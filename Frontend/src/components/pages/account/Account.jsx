import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaBell, FaUserCircle, FaFileInvoice, FaHistory,
  FaCrown, FaCreditCard, FaHeadset
} from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import "../../css/xxstrangeAccount.css";
import ProfileTab from "./profile/ProfileTab";

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
const handleUpdateUser = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put("http://localhost:8000/api/users/me", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(response.data); // تحديث الحالة مباشرة بعد الحفظ
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

const handleDeleteUser = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete("http://localhost:8000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.removeItem("token");
    window.location.href = "/login"; // إعادة التوجيه بعد الحذف
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

  // جلب بيانات المستخدم
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get("http://localhost:8000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // تحديث بيانات المستخدم
  const handleUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:8000/api/users/me",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // حذف الحساب
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("http://localhost:8000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const menuItems = [
    { key: "profile", label: "My Account" },
    { key: "history", label: "History" },
    { key: "invoices", label: "Invoices" },
    { key: "plans", label: "Plans & Packages" },
    { key: "notifications", label: "Notifications" },
    { key: "support", label: "Support" },
  ];

  const invoices = [
    { id: 1, date: "2025-07-12", status: "Paid", details: "Premium Monthly Subscription", amount: "$15.00", method: "Visa **** 1234" },
    { id: 2, date: "2025-06-12", status: "Canceled", details: "Premium Monthly Subscription", amount: "$15.00", method: "PayPal" },
    { id: 3, date: "2025-05-12", status: "Pending", details: "Premium Monthly Subscription", amount: "$15.00", method: "Visa **** 4321" },
  ];

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (!user) return <div>No user data found.</div>;

    switch (activeTab) {
      case "profile":
        return (
<ProfileTab
  user={user}
  onUpdate={handleUpdateUser}
  onDelete={handleDeleteUser}
/>

        );
case "history":
  return (
    <motion.div
      className="xxsct_history xxsct_card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2><FaHistory /> Recent History</h2>
      <ul>
        {user.topics && user.topics.length > 0 ? (
          user.topics.map((topic) => (
            <li key={topic.id}>
              {topic.title} - {new Date(topic.created_at).toLocaleDateString()}
<button
  className="primary"
  onClick={() => window.open(`http://localhost:8000/storage/${topic.file_path}`, "_blank")}
>
  <AiOutlineDownload /> Download
</button>

            </li>
          ))
        ) : (
          <li>No topics found.</li>
        )}
      </ul>
    </motion.div>
  );

      case "invoices":
        return (
          <motion.div
            className="xxsct_invoices xxsct_card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="invoice-header">
              <h2><FaFileInvoice /> Invoice History</h2>
              <button className="btn-upgrade gold">
                <FaCrown className="crown-icon" /> Upgrade to Premium
              </button>
            </div>
            <h3 className="invoice-subtitle">All Invoices</h3>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Invoice Date</th>
                  <th>Status</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.date}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          inv.status === "Paid"
                            ? "paid"
                            : inv.status === "Pending"
                            ? "pending"
                            : "canceled"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td>{inv.details}</td>
                    <td>{inv.amount}</td>
                    <td>{inv.method}</td>
                    <td>
                      <button className="btn-download">
                        <AiOutlineDownload size={18} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        );
      case "plans":
        return (
          <motion.div
            className="xxsct_plans"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="upgrade-btn">
              <button className="gold">
                <FaCrown className="crown-icon" /> Upgrade to Premium
              </button>
            </div>
            <div className="plans-header">
              <h2>Plans and packages</h2>
              <p>
                Get full access to all MySite features. Enjoy simple and fast PDF
                tools to convert, edit and e-sign your documents.
              </p>
            </div>
            <div className="plans-grid">
              <div className="plan-card">
                <h3>Subscription details</h3>
                <p className="note">
                  Get full access to all MySite features. Enjoy simple and fast PDF tools to convert, edit and e-sign your documents.
                </p>
              </div>
              <div className="plan-card">
                <h3>Packages</h3>
                <ul>
                  <li>
                    Signatures: 0 <span className="add-more">Add more</span>
                  </li>
                  <li>
                    SMS: 0 <span className="add-more">Add more</span>
                  </li>
                </ul>
                <p className="note">Packages do not expire.</p>
              </div>
            </div>
          </motion.div>
        );
      case "notifications":
        return (
          <div className="xxsct_notifications xxsct_card">
            <h2><FaBell /> Notifications</h2>
            <p className="xxsct_notifications_text">No new notifications.</p>
          </div>
        );
      case "support":
        return (
          <div className="xxsct_support xxsct_card">
            <h2><FaHeadset /> Support</h2>
            <p className="xxsct_support_text">Contact us: support@example.com</p>
            <p className="xxsct_support_text">Live chat available Mon-Fri 9AM - 5PM</p>
          </div>
        );
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="xxsct_container">
      <aside className="xxsct_sidebar">
        <div className="xxsct_logo">MySite</div>
        <nav className="xxsct_nav">
          {menuItems.map((item) => (
            <motion.div
              key={item.key}
              className={`xxsct_menu_item ${activeTab === item.key ? "active" : ""}`}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              onClick={() => setActiveTab(item.key)}
            >
              {item.label}
            </motion.div>
          ))}
        </nav>
        <div className="xxsct_sidebar_footer">
          <FaUserCircle size={30} />
          <div>
            <strong>{user ? user.name : "Guest"}</strong>
            <p className="xxsct_sidebar_email">{user ? user.email : ""}</p>
          </div>
          <FaBell className="xxsct_bell" />
        </div>
      </aside>
      <main className="xxsct_content">{renderContent()}</main>
    </div>
  );
};

export default Account;
