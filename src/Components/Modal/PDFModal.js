import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const PDFModal = ({ pdfUrl, onClose }) => {
  if (!pdfUrl) return null;

  return (
    <Modal open onClose={onClose}>
      <Box className="p-3 bg-white shadow rounded" style={{ width: "80%", margin: "auto", marginTop: "10%" }}>
        <iframe src={pdfUrl} width="100%" height="500px" title="Document Viewer"></iframe>
      </Box>
    </Modal>
  );
};

export default PDFModal;
