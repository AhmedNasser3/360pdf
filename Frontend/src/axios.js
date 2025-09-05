// axios.js
import axios from 'axios';

// =======================
// ✅ إعداد الـ axios instance
// =======================
const instance = axios.create({
  baseURL: 'https://pdf360.ne',
  withCredentials: true, // مهم لو تستخدم Laravel Sanctum session
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

// =======================
// ✅ إضافة التوكن لو موجود
// =======================
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =======================
// ✅ تعديل الـ response interceptor
// =======================
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;

      // هنسجّل خروج بس لو الريكويست كان خاص بـ check-auth
      if (originalRequest?.url?.includes('/check-auth')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// =======================
// ✅ إضافات PayPal Helpers
// =======================

// إنشاء طلب دفع (يرجع orderId و approve link)
async function createPaypalOrder(amount = 10.0, currency = 'USD') {
  try {
    const { data } = await instance.post('/api/paypal/create-order', {
      amount,
      currency,
    });
    return data; // المتوقع: { id, status, links: [...] }
  } catch (error) {
    console.error('PayPal create order error:', error);
    throw error;
  }
}

// تأكيد/التقاط الدفع بعد رجوع المستخدم من PayPal
async function capturePaypalOrder(orderId) {
  try {
    const { data } = await instance.post(`/api/paypal/capture-order/${orderId}`, {
      orderId,
    });
    return data; // المتوقع: بيانات الدفع النهائية
  } catch (error) {
    console.error('PayPal capture order error:', error);
    throw error;
  }
}

// =======================
// ✅ ربط الـ helpers بالـ instance
// =======================
instance.paypal = {
  createOrder: createPaypalOrder,
  captureOrder: capturePaypalOrder,
};

// =======================
// ✅ تصدير افتراضي + الدوال بالاسم
// =======================
export default instance;
export { createPaypalOrder, capturePaypalOrder };
