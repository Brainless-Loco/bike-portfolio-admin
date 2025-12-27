import React, { useState } from "react";
import { Box, TextField, Button, Chip } from "@mui/material";

const LabelsInput = ({labels, label, onChange, readOnly = false }) => {
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState(labels);

  const handleAdd = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      const newItems = [...items, inputValue.trim()];
      setItems(newItems);
      onChange(newItems); // Notify parent component
      setInputValue("");
    }
  };

  const handleRemove = (itemToRemove) => {
    const newItems = items.filter((item) => item !== itemToRemove);
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <Box className="mb-5">
      <h3>{label}</h3>
      
      <Box className="mb-3" mt={2} display="flex" gap={1} flexWrap="wrap">
        {items.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={!readOnly ? () => handleRemove(item) : undefined}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
      {!readOnly && (
        <Box display="flex" gap={2}>
          <TextField
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            fullWidth
            placeholder="Enter a label"
          />
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LabelsInput;
