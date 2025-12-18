import React, { useState } from "react";
import { Box, TextField, Button, Chip } from "@mui/material";

const ExternalLinks = ({externalLinks, onChange, readOnly = false }) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState(externalLinks);

  const handleAdd = () => {
    if (title.trim() && url.trim()) {
      const newLink = { title: title.trim(), url: url.trim() };
      const newLinks = [...links, newLink];
      setLinks(newLinks);
      onChange(newLinks); // Notify parent component
      setTitle("");
      setUrl("");
    }
  };

  const handleRemove = (index) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
    onChange(newLinks);
  };

  return (
    <Box className="mb-5">
      <h3>External Links</h3>
      {!readOnly && (
        <Box display="flex" gap={2} mb={2}>
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            label="Title"
            fullWidth
          />
          <TextField
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            variant="outlined"
            label="URL"
            fullWidth
          />
          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </Box>
      )}
      <Box mt={2} display="flex" gap={1} flexWrap="wrap">
        {links.map((link, index) => (
          <Chip
            key={index}
            label={`${link.title} - ${link.url}`}
            onDelete={!readOnly ? () => handleRemove(index) : undefined}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
};

export default ExternalLinks;
