// src/components/auth/Register.js
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "../../css/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://127.0.0.1:8000/api/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });

      const { token, user } = response.data;

      // تخزين البيانات في localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // ضبط التوكن في كل ريكوست axios بعد التسجيل
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success("تم التسجيل بنجاح 🎉");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "فشل في التسجيل");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2 className="form-title">إنشاء حساب</h2>
        <input
          type="text"
          name="name"
          placeholder="الاسم الكامل"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="البريد الإلكتروني"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="كلمة المرور"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="تأكيد كلمة المرور"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "جاري التسجيل..." : "تسجيل"}
        </button>
        <p className="login-link">
          لديك حساب بالفعل؟ <a href="/login">تسجيل الدخول</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
