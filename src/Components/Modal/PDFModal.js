import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const PDFModal = ({ pdfUrl, onClose }) => {
  if (!pdfUrl) return null;

  return (
    <Modal open onClose={onClose} fullwidth>
      <Box className="p-3 bg-white shadow rounded relative" style={{ width: "95%", margin: "auto", height: "95vh", marginTop: "2.5vh" }}>
        <iframe src={pdfUrl} width="100%" height="100%" title="Document Viewer"></iframe>
        <Box position="absolute" top={-5} right={-5}>
          <IconButton onClick={onClose}  sx={{backgroundColor:'white', "&:hover": { backgroundColor: "gray", color:'white' }, }}>
            <HighlightOffIcon sx={{"&:hover": { color: "white" }}}/>
          </IconButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default PDFModal;
