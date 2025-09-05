import React, { useState } from "react";
import { Link } from "react-router-dom"; // أو next/link لو Next.js

import {
  FcCircuit,
  FcShipped,
  FcSignature,
  FcProcess,
  FcUnlock,
  FcLock,
  FcTreeStructure,
  FcBrokenLink,
  FcNumericalSorting12,
  FcCamera,
  FcViewDetails,
  FcEmptyTrash
} from "react-icons/fc";
import { AiOutlineEdit } from "react-icons/ai";
import {
  MdWaterDrop,
  MdRotate90DegreesCcw,
  MdCompareArrows,
  MdOutlineTextSnippet,
  MdCrop,
  MdCallSplit
} from "react-icons/md";
import {
  FaFilePdf,
  FaFileWord,
  FaFilePowerpoint,
  FaFileExcel,
  FaFileImage
} from "react-icons/fa";
import { BsFileEarmarkPdfFill } from "react-icons/bs";

const boxData = [
  // Workflows
  {
    title: "Merge PDF",
    desc: "Combine PDFs in the order you want with the easiest PDF merger available.",
    icon: <FcCircuit color="#ff5722" />,
    category: "Workflows",
    link: "/merge",
  },
  {
    title: "Split PDF",
    desc: "Separate one page or a whole set for easy conversion into independent PDF files.",
    icon: <MdCallSplit color="#4caf50" />,
    category: "Workflows",
    link: "/splitpdf",
  },

  // Optimize PDF
  {
    title: "Compress PDF",
    desc: "Reduce file size while optimizing for maximal PDF quality.",
    icon: <FcShipped color="#2196f3" />,
    category: "Optimize PDF",
    link: "/optimize",

  },
  {
    title: "Repair PDF",
    desc: "Repair a damaged PDF and recover data...",
    icon: <FcBrokenLink color="#ff5722" />,
    category: "Optimize PDF",
  },

  // Convert PDF
{
  title: "PDF to Word",
  desc: "Easily convert your PDF files into easy to edit DOC and DOCX documents...",
  icon: <FaFileWord color="#2b579a" />,
  category: "Convert PDF",
  link: "/#convert-to",
},


  {
    title: "PDF to PowerPoint",
    desc: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    icon: <FaFilePowerpoint color="#d24726" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "PDF to Excel",
    desc: "Pull data straight from PDFs into Excel spreadsheets...",
    icon: <FaFileExcel color="#217346" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "Word to PDF",
    desc: "Make DOC and DOCX files easy to read by converting them to PDF.",
    icon: <BsFileEarmarkPdfFill color="#e53935" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "PowerPoint to PDF",
    desc: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    icon: <BsFileEarmarkPdfFill color="#ff9800" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "Excel to PDF",
    desc: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    icon: <BsFileEarmarkPdfFill color="#43a047" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "PDF to JPG",
    desc: "Convert each PDF page into a JPG or extract all images...",
    icon: <FaFileImage color="#03a9f4" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "JPG to PDF",
    desc: "Convert JPG images to PDF in seconds...",
    icon: <FaFilePdf color="#f44336" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "HTML to PDF",
    desc: "Convert webpages in HTML to PDF...",
    icon: <FcViewDetails color="#673ab7" />,
    category: "Convert PDF",
    link: "/#convert-to",
  },
  {
    title: "Scan to PDF",
    desc: "Capture document scans from your mobile device...",
    icon: <FcCamera color="#795548" />,
    category: "Convert PDF",
  },
  {
    title: "OCR PDF",
    desc: "Easily convert scanned PDF into searchable documents...",
    icon: <MdOutlineTextSnippet color="#3f51b5" />,
    category: "Convert PDF",
    link: "/ocrpdf",
  },
  {
    title: "PDF to PDF/A",
    desc: "Transform your PDF to PDF/A...",
    icon: <FcProcess color="#009688" />,
    category: "Convert PDF",
      comingSoon: true,

  },

  // Edit PDF
  {
    title: "Edit PDF",
    desc: "Add text, images, shapes or freehand annotations...",
    icon: <AiOutlineEdit color="#9c27b0" />,
    category: "Edit PDF",
      comingSoon: true,

  },
  {
    title: "Watermark",
    desc: "Stamp an image or text over your PDF...",
    icon: <MdWaterDrop color="#00bcd4" />,
    category: "Edit PDF",
    link: "/watermark",
},
{
    title: "Archive PDF",
    desc: "Archive your PDFs the way you need them...",
    icon: <MdRotate90DegreesCcw color="#607d8b" />,
    category: "Workflows PDF",
    link: "/archivepdf",
  },

  {
    title: "Page numbers",
    desc: "Add page numbers into PDFs with ease...",
    icon: <FcNumericalSorting12 color="#9e9d24" />,
    category: "Edit PDF",
      comingSoon: true,

  },
  {
    title: "Sign PDF",
    desc: "Sign yourself or request electronic signatures...",
    icon: <FcSignature color="#795548" />,
    category: "Edit PDF",
      comingSoon: true,

  },

  // Organize PDF
  {
    title: "Organize PDF",
    desc: "Sort pages of your PDF file however you like...",
    icon: <FcTreeStructure color="#3f51b5" />,
    category: "Organize PDF",
      comingSoon: true,

  },

  // PDF Security
  {
    title: "Unlock PDF",
    desc: "Remove PDF password security...",
    icon: <FcUnlock color="#4caf50" />,
    category: "PDF Security",
      comingSoon: true,

  },
{
  title: "Protect PDF",
  desc: "Protect PDF files with a password...",
  icon: <FcLock color="#f44336" />,
  category: "PDF Security",
  comingSoon: true,
},

];

const categories = [
  "All",
  "Workflows",
  "Organize PDF",
  "Optimize PDF",
  "Convert PDF",
  "Edit PDF",
  "PDF Security",
];

const Boxes = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredData =
    activeCategory === "All"
      ? boxData
      : boxData.filter((box) => box.category === activeCategory);

  return (
    <>
      <div className="boxes_option">
        <div className="boxes_option_container">
          <div className="boxes_option_content">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`boxes_option_btns ${
                  activeCategory === cat ? "active" : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                <h4>{cat}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="boxes">
<div className="boxes_container">
  {filteredData.map((box, index) => (
        <Link to={box.link} key={index}>

    <div
      key={index}
      className={`boxes_content ${box.comingSoon ? "coming-soon" : ""}`}
    >
      <div className="boxes_icon">{box.icon}</div>
      <div className="boxes_titles">
        <h2>{box.title}</h2>
        <p>{box.desc}</p>
      </div>
      {box.comingSoon && <span className="coming-text">Coming Soon</span>}
    </div>
        </Link>

  ))}
</div>
      </div>
    </>
  );
};

export default Boxes;
