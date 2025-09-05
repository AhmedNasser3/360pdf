import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/Register.css'; // ✅ نربط ملف الستايل

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setFormData({ name: response.data.name, email: response.data.email });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setEditing(false);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف الحساب؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${user.id}/force`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  if (!user) return <div className="loading">تحميل البيانات...</div>;

  return (
    <div className="dashboard-container">
      <h2>حسابك</h2>

      {editing ? (
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="الاسم"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="btn-group">
            <button className="btn primary" onClick={handleUpdate}>💾 حفظ</button>
            <button className="btn" onClick={() => setEditing(false)}>❌ إلغاء</button>
          </div>
        </div>
      ) : (
        <div className="info">
          <p><strong>الاسم:</strong> {user.name}</p>
          <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
          <button className="btn primary" onClick={() => setEditing(true)}>✏️ تعديل</button>
        </div>
      )}

      <button className="btn danger" onClick={handleDelete}>🗑️ حذف الحساب نهائيًا</button>
    </div>
  );
};

export default Dashboard;
