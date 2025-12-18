import React from "react";
import { TextField } from "@mui/material";

const ShortDescription = ({ value, onChange, readOnly = false }) => {
  return (
    <TextField
      label={"ShortDescription"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={readOnly}
      fullWidth
      multiline
      maxRows={10}
      variant="outlined"
    />
  );
};

export default ShortDescription;
