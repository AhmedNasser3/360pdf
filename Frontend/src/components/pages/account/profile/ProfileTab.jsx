import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaCrown } from "react-icons/fa";
import AllUsers from "./AllUsers";
import axios from "axios";

const ProfileTab = ({ user, setUser, onUpdate, onDelete }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    status: user.status || "active",
  });
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [pointsToBuy, setPointsToBuy] = useState(500); // الحد الأدنى من النقاط
  const [price, setPrice] = useState((9 / 500) * 500); // السعر ديناميكي حسب النقاط

  // جلب المستخدم من localStorage عند فتح الصفحة
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && setUser) {
      setUser(storedUser);
      setFormData({
        name: storedUser.name,
        email: storedUser.email,
        status: storedUser.status || "active",
      });
    }
  }, [setUser]);

  // تحديث السعر عند تغيير النقاط
  useEffect(() => {
    const calculatedPrice = ((9 / 500) * pointsToBuy).toFixed(2);
    setPrice(calculatedPrice);
  }, [pointsToBuy]);

  const handleUpdate = () => {
    if (onUpdate) onUpdate(formData);
    setShowEdit(false);
  };

  const handlePayPalPayment = async () => {
    try {
      setLoadingPayment(true);

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        alert("يجب تسجيل الدخول أولاً!");
        setLoadingPayment(false);
        return;
      }

      // إنشاء طلب الدفع في PayPal بالقيم الديناميكية مع إرسال عدد النقاط
      const { data: orderData } = await axios.post(
        "/api/paypal/create-order",
        {
          user_id: storedUser.id,
          amount: price,
          points: pointsToBuy // <- أرسل عدد النقاط هنا
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // الحصول على رابط الموافقة للانتقال إلى PayPal
      const approvalUrl = orderData.links.find(link => link.rel === "approve")?.href;
      if (!approvalUrl) throw new Error("PayPal approve link not found");

      // فتح واجهة الدفع
      window.location.href = approvalUrl;

      // بعد اكتمال الدفع، إضافة النقاط المحددة من الشريط
      setTimeout(async () => {
        try {
          const { data } = await axios.post(
            "/api/add-points",
            { user_id: storedUser.id, points: pointsToBuy },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (data.success && setUser) {
            const updatedUser = { ...storedUser, points: data.points };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.error("Error adding points:", err);
          alert("فشل إضافة النقاط بعد الدفع.");
        }
      }, 3000);

    } catch (error) {
      console.error("Payment error:", error);
      alert("فشل الدفع، حاول مرة أخرى.");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <motion.div
      className="xxsct_profile xxsct_card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="xxsct_profile_pic">
        <FaUserCircle size={80} />
        <h3>{user.name}</h3>
        <p className="xxsct_profile_email">{user.email}</p>
      </div>

      <div className="xxsct_profile_actions">
        <button className="primary" onClick={() => setShowEdit(true)}>
          Edit Profile
        </button>
        <button className="danger" onClick={() => setShowConfirm(true)}>
          Delete Account
        </button>

        <div className="points-purchase">
          <label>
            Points: {pointsToBuy} - Price: ${price}
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={pointsToBuy}
            onChange={(e) => setPointsToBuy(Number(e.target.value))}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>500</span>
            <span>5000</span>
          </div>
          <button
            className="primary"
            onClick={handlePayPalPayment}
            disabled={loadingPayment}
          >
            {loadingPayment ? "Processing..." : `Pay $${price} via PayPal`}
          </button>
        </div>
      </div>

      <div className="xxsct_profile_stats">
        <div className="xxsct_card gold">
          <FaCrown /> Points: {user.points || 0}
        </div>
        <div className="xxsct_card">
          Status:{" "}
          {user?.status === "suspend" || user?.status === "suspended"
            ? "Suspended"
            : "Active"}
        </div>
      </div>

      {/* نافذة التعديل */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2>Edit Profile</h2>
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
              <div className="modal-actions">
                <button className="primary" onClick={handleUpdate}>
                  Save
                </button>
                <button
                  className="secondary"
                  onClick={() => setShowEdit(false)}
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
        {showConfirm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3>Are you sure you want to delete your account?</h3>
              <div className="modal-actions">
                <button className="danger" onClick={onDelete}>
                  Yes, Delete
                </button>
                <button
                  className="secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* عرض قائمة المستخدمين للمسؤول */}
      {user.role === "admin" && <AllUsers currentUser={user} />}
    </motion.div>
  );
};

export default ProfileTab;
