import React, { useState } from "react";
// ✅ استبدل axios بالـ instance الخاص بنا
import axios from "axios";
import toast from "react-hot-toast";
import "../../css/Register.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("http://127.0.0.1:8000/api/users/login", formData);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ضبط الـ Authorization header تلقائي بعد تسجيل الدخول
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("تم تسجيل الدخول بنجاح 🔓");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="form-title">تسجيل الدخول</h2>
        <input type="email" name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="كلمة المرور" value={formData.password} onChange={handleChange} required />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "جاري تسجيل الدخول..." : "دخول"}
        </button>
        <p className="login-link">
          لا تمتلك حساب؟ <a href="/register">سجّل الآن</a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
