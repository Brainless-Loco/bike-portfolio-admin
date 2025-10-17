import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import useAuthRedirect from "../../../Components/Auth/useAuthRedirect";

const UpdateBasicInfo = () => {
  useAuthRedirect();
  return (
    <Box className="row mx-10 d-flex justify-content-center align-items-center" sx={{ minHeight: '90vh' }}>
      <Typography variant="h3" className="text-center pb-10">
        Update Basic Information
      </Typography>

      {/* Buttons Wrapper */}
      <Box display="flex" justifyContent="center" gap={8} flexWrap="wrap">
        {/* Director Info */}
        <Box>
          <Link to="/update/director-info" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                width: 150,
                height: 150,
                textTransform: "none",
                fontSize: "18px",
              }}
            >
              Director Info
            </Button>
          </Link>
        </Box>

        {/* Teaching Statement */}
        <Box>
          <Link to="/update/teaching-statement" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                width: 150,
                height: 150,
                textTransform: "none",
                fontSize: "18px",
              }}
            >
              Teaching Statement
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateBasicInfo;
