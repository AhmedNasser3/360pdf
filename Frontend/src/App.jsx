import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/includes/Header";
import Home from "./components/pages/HomePage";
import Boxes from "./components/pages/main/Boxes";
import Register from "./components/pages/auth/Register";
import LoginForm from "./components/pages/auth/LoginForm";
import Dashboard from "./components/pages/auth/Dashboard";
import PdfMerge from "./components/pages/pdf/PdfMerge";
import ConvertTo from "./components/pages/main/ConvertTo";
import Footer from "./components/includes/Footer";
import Account from "./components/pages/account/Account";
import Merge from "./components/pages/pdf/merge/Merge";
import Optimize from "./components/pages/pdf/optimize/Optimize";
import Watermark from "./components/pages/pdf/watermark/Watermark";

// 👇 متنساش تستورد الكومبوننت
import ScrollToHashElement from "./components/utils/ScrollToHashElement";
import SplitPdf from "./components/pages/pdf/Split/SplitPDF";
import OCR from "./components/pages/pdf/OCR/ocr";
import Archive from "./components/pages/pdf/archive/archive";

const App = () => {
  return (
    <Router>
      <Header />
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToHashElement /> {/* 👈 هنا */}
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Home />
              <Boxes />
              <div id="convert-to">
                <ConvertTo />
              </div>
            </div>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/merge-pdf" element={<PdfMerge />} />
        <Route path="/account" element={<Account />} />
        <Route path="/merge" element={<Merge />} />
        <Route path="/optimize" element={<Optimize />} />
        <Route path="/watermark" element={<Watermark />} />
        <Route path="/splitpdf" element={<SplitPdf />} />
        <Route path="/ocrpdf" element={<OCR />} />
        <Route path="/archivepdf" element={<Archive />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
