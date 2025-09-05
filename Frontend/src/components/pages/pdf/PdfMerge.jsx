import React, { useState } from 'react';
import axios from 'axios';
import { AiFillCloseCircle } from 'react-icons/ai';

const PdfConvert = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErr('❌ يرجى اختيار ملف PDF فقط');
      return;
    }

    setErr('');
    setSelectedFile(file);
    e.target.value = null;
  };

  const removeFile = () => {
    setSelectedFile(null);
    setErr('');
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setErr('❌ يرجى رفع ملف PDF أولاً');
      return;
    }

    setLoading(true);
    setErr('');
    setDownloadUrl('');

    try {
      const fd = new FormData();
      fd.append('file', selectedFile);

      const res = await axios.post(
        'http://localhost:8000/api/pdf/convert',
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'json'
        }
      );

      let data = res.data;

      if (typeof data === 'string') {
        const jsonStart = data.indexOf('\n');
        let jsonStr = data;
        if (jsonStart !== -1) {
          jsonStr = data.substring(jsonStart + 1);
        }
        try {
          data = JSON.parse(jsonStr);
        } catch {
          setErr('❌ فشل في تحليل بيانات السيرفر.');
          setLoading(false);
          return;
        }
      }

      if (data && data.download_url) {
        setDownloadUrl(data.download_url);
      } else {
        setErr('❌ لم يتم العثور على رابط التحميل');
      }
    } catch (error) {
      setErr(
        error.response?.data?.error ||
        error.message ||
        '❌ حدث خطأ أثناء التحويل'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'converted_file');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <>
      <style>{`
        .container {
          max-width: 900px;
          margin: 50px auto;
          padding: 20px;
          direction: rtl;
          font-family: Arial, sans-serif;
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .left-side {
          flex: 1 1 150px;
          min-width: 150px;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 15px;
          background: #f9f9f9;
        }
        .main-area {
          flex: 3 1 600px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .file-box {
          position: relative;
          width: 120px;
          height: 140px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #fafafa;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }
        .remove-icon {
          position: absolute;
          top: 4px;
          left: 4px;
          color: #d9534f;
          cursor: pointer;
          font-size: 20px;
        }
        .buttons-area {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .btn {
          padding: 10px 18px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          min-width: 160px;
        }
        .btn-upload {
          background-color: #007bff;
          color: white;
        }
        .btn-upload:disabled {
          background-color: #80bfff;
        }
        .btn-download {
          background-color: #28a745;
          color: white;
        }
        .error-message {
          color: #d9534f;
          font-weight: 600;
        }
      `}</style>

      <div className="container">
        <div className="left-side">
          <h3>معلومات أو وصف</h3>
          <p>يمكنك هنا وضع أي نص أو شرح.</p>
        </div>

        <div className="main-area">
          <h2 style={{ textAlign: 'center' }}>📄 تحويل ملف PDF</h2>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleSelect}
            disabled={loading}
          />

          {selectedFile && (
            <div className="file-box" title={selectedFile.name}>
              <AiFillCloseCircle
                className="remove-icon"
                onClick={removeFile}
              />
              <div style={{ fontSize: 48, color: '#d9534f' }}>📄</div>
              <div style={{ fontSize: 12, textAlign: 'center' }}>{selectedFile.name}</div>
            </div>
          )}

          <div className="buttons-area">
            {downloadUrl && (
              <button
                className="btn btn-download"
                onClick={handleDirectDownload}
              >
                ⬇ تحميل الملف مباشرة
              </button>
            )}
            <button
              className="btn btn-upload"
              onClick={handleConvert}
              disabled={loading || !selectedFile}
            >
              {loading ? '⏳ جاري التحويل...' : '⚡ تحويل الملف'}
            </button>
          </div>

          <p className="error-message">{err}</p>
        </div>
      </div>
    </>
  );
};

export default PdfConvert;
