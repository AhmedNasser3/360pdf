import React, { useState } from "react";
import axios from "axios";
import { FaRegFolderOpen, FaClipboardList, FaTimesCircle, FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import "../../css/ConvertTo.css";

const ConvertTo = () => {
  const [fromFormat, setFromFormat] = useState("");
  const [toFormat, setToFormat] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // خريطة التنسيقات المسموح بها
  const allowedConversions = {
    pdf: ["docx", "html", "xlsx", "pptx", "jpg"], // فقط Word و HTML من PDF
    jpg: ["pdf"],
    png: ["pdf"],
    docx: ["pdf"],
    xlsx: ["pdf"],
    html: ["pdf"],
    pptx: ["pdf"],
  };

  // اختيار الملفات
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const filtered = files.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return ext === fromFormat.toLowerCase();
    });

    if (filtered.length !== files.length) {
      const msg = `Only .${fromFormat} files are allowed`;
      setErrorMsg(msg);
      toast.error(msg);
    } else {
      setErrorMsg("");
      toast.success(`${filtered.length} file(s) selected successfully`);
    }
    setSelectedFiles(filtered);
  };

  // إرسال الملفات للتحويل
  const handleConvert = async () => {
    if (!fromFormat || !toFormat || selectedFiles.length === 0) return;
    setLoading(true);
    setDownloadUrl("");
    setErrorMsg("");
    toast.loading("Converting your file(s)...", { id: "convert" });

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("pdfs[]", file);
    });
    formData.append("output_format", toFormat);

    try {
      const res = await axios.post("/api/pdf/convert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "json",
      });

      let data = res.data;
      if (typeof data === "string") {
        const jsonStart = data.indexOf("\n");
        let jsonStr = data;
        if (jsonStart !== -1) {
          jsonStr = data.substring(jsonStart + 1);
        }
        try {
          data = JSON.parse(jsonStr);
        } catch {
          const msg = "Failed to parse server response.";
          setErrorMsg(msg);
          toast.error(msg, { id: "convert" });
          setLoading(false);
          return;
        }
      }

      if (data && data.download_url) {
        setDownloadUrl(data.download_url);
        toast.success("File converted successfully!", { id: "convert" });
      } else {
        const msg = "No download link found.";
        setErrorMsg(msg);
        toast.error(msg, { id: "convert" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "An error occurred during conversion.";
      setErrorMsg(msg);
      toast.error(msg, { id: "convert" });
    } finally {
      setLoading(false);
    }
  };

  // التحميل المباشر
  const handleDirectDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "converted_file");
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started!");
  };

  // تحديد التنسيقات المسموح بها بناءً على اختيار From
  const availableToFormats = fromFormat ? allowedConversions[fromFormat] || [] : [];

  return (
    <>
      <div className="convert_box">
        <div className="convert_box_container">
          <div className="convert_box_content">
            <div className="convert_box_titles">
              <h1>File Converter</h1>
              <p>
                Choose your formats and upload your file. Conversion will be done online instantly without extra software.
              </p>
            </div>
          </div>
          <div className="convert_box_options">
            <div className="convert_box_options_container">
              <div className="convert_box_option_1">
                <h3>Convert</h3>
                <select
                  value={fromFormat}
                  onChange={(e) => {
                    setFromFormat(e.target.value);
                    setToFormat(""); // إعادة تعيين toFormat عند تغيير fromFormat
                  }}
                >
                  <option value="">Select format</option>
                  <option value="pdf">PDF</option>
                  <option value="jpg">JPG</option>
                  <option value="png">PNG</option>
                  <option value="docx">DOCX</option>
                  <option value="xlsx">XLSX</option>
                  <option value="html">HTML</option>
                  <option value="pptx">PPTX</option>
                </select>
              </div>
              <div className="convert_box_option_1">
                <h3>To</h3>
                <select
                  value={toFormat}
                  onChange={(e) => setToFormat(e.target.value)}
                  disabled={!fromFormat}
                >
                  <option value="">Select format</option>
                  {availableToFormats.map((format) => (
                    <option key={format} value={format}>{format.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* عرض الملفات */}
      <div className="convert_box_btn">
        <div className="convert_box_btn_convert">
          {selectedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4><FaClipboardList /> Uploaded Files:</h4>
              <ul>
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          <label
            htmlFor="file-upload"
            className={`custom-file-upload ${!fromFormat ? "disabled" : ""}`}
          >
            <FaRegFolderOpen /> Upload Files ({fromFormat || "Select a format first"})
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            disabled={!fromFormat}
            onChange={handleFileSelect}
          />

          {fromFormat && toFormat && selectedFiles.length > 0 && (
            <div className="convert_box_btn">
              <button onClick={handleConvert} disabled={loading}>
                {loading ? "Converting..." : "Convert"}
              </button>
            </div>
          )}

          {downloadUrl && (
            <div className="download-link">
              <button onClick={handleDirectDownload}>
                <FaDownload /> Download File
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMsg && <p className="error-msg"><FaTimesCircle /> {errorMsg}</p>}
    </>
  );
};

export default ConvertTo;
