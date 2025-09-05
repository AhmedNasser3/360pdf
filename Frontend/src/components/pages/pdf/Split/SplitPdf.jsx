import React, { useState } from "react";
import axios from "axios";
import {
  FaRegFolderOpen,
  FaClipboardList,
  FaTimesCircle,
  FaDownload,
} from "react-icons/fa";
import { FaScissors } from "react-icons/fa6";
import toast from "react-hot-toast";
import "../../../css/ConvertTo.css";

const SplitPdf = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadUrls, setDownloadUrls] = useState([]); // 👈 هنا هنخزن كل روابط الصفحات
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // اختيار الملف
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "pdf") {
        const msg = "Only .pdf files are allowed";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      toast.success(`PDF "${file.name}" added successfully`);
    }
  };

  // إزالة الملف
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setDownloadUrls([]);
    toast.success("File removed");
  };

  // إرسال الملف للـ backend للـ split
  const handleSplit = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file to split.");
      return;
    }

    setLoading(true);
    setDownloadUrls([]);
    setErrorMsg("");
    toast.loading("Splitting your PDF file...", { id: "split" });

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const res = await axios.post("/api/split-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "json",
      });

      let data = res.data;

      if (data && data.download_urls) {
        setDownloadUrls(data.download_urls); // 👈 backend هيرجع array فيه روابط الصفحات
        toast.success("PDF splitted successfully!", { id: "split" });
      } else {
        const msg = "No download links found.";
        setErrorMsg(msg);
        toast.error(msg, { id: "split" });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || "An error occurred during splitting.";
      setErrorMsg(msg);
      toast.error(msg, { id: "split" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="convert_box">
        <div className="convert_box_container">
          <div className="convert_box_content">
            <div className="convert_box_titles">
              <h1>
                <FaScissors /> Split PDF File
              </h1>
              <p>
                Upload a PDF file and we will split it into separate pages. Each
                page will be available for download.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload files */}
      <div className="convert_box_btn">
        <div className="convert_box_btn_convert">
          {/* Uploaded file */}
          {selectedFile && (
            <div className="uploaded-files">
              <h4>
                <FaClipboardList /> Uploaded File:
              </h4>
              <ul>
                <li>
                  {selectedFile.name}
                  <button
                    className="remove-file-btn"
                    onClick={handleRemoveFile}
                    title="Remove file"
                  >
                    <FaTimesCircle />
                  </button>
                </li>
              </ul>
            </div>
          )}

          <label htmlFor="file-upload" className="custom-file-upload">
            <FaRegFolderOpen /> Upload PDF File
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
          />

          {/* Split button */}
          {selectedFile && (
            <div className="convert_box_btn">
              <button onClick={handleSplit} disabled={loading}>
                {loading ? "Splitting..." : "Split PDF"}
              </button>
            </div>
          )}

          {/* Download links */}
          {downloadUrls.length > 0 && (
            <div className="download-link">
              <h4>
                <FaDownload /> Download Pages:
              </h4>
              <ul>
                {downloadUrls.map((url, idx) => (
                  <li key={idx}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Download Page {idx + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="error-msg">
          <FaTimesCircle /> {errorMsg}
        </p>
      )}
    </>
  );
};

export default SplitPdf;
