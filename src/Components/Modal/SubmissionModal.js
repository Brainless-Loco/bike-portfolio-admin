import React from "react";
import { Modal, CircularProgress, Box } from "@mui/material";

const SubmissionModal = ({ open }) => {
  return (
    <Modal open={open}>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    </Modal>
  );
};

export default SubmissionModal;
