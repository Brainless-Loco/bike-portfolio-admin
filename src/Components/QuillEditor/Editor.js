import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Register ImageResize only once globally
if (!Quill.imports["modules/imageResize"]) {
  Quill.register("modules/imageResize", ImageResize);
}

export default function Editor({ editorTitle, updateHTMLContent, value = "" }) {
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!editorContainerRef.current || isMounted.current) return;

    const quill = new Quill(editorContainerRef.current, {
      theme: "snow",
      placeholder: "Write detailed information here...",
      modules: {
        toolbar: [
          [{ font: [] }],
          [{ header: [1, 2, 3, false] }],
          [{ size: ["small", false, "large", "huge"] }],
          [{ align: [] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ script: "sub" }, { script: "super" }],
          ["blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          ["link", "image", "video"],
          ["clean"],
        ],
        imageResize: {
          displayStyles: {
            backgroundColor: "black",
            border: "none",
            color: "white",
          },
          modules: ["Resize", "DisplaySize"],
          handleStyles: {
            backgroundColor: "black",
            border: "none",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
          },
          parchment: Quill.import("parchment"), // Fixes mutation observer issue
        },
      },
    });

    quill.on("text-change", () => {
      updateHTMLContent(quill.root.innerHTML);
    });

    quillRef.current = quill;
    isMounted.current = true;
    quill.root.innerHTML = value;
  }, [updateHTMLContent, value]);

  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <Box sx={{ mt: 3 }} className="bg-slate-100 w-full">
      <Typography variant="h5" gutterBottom>
        {editorTitle}
      </Typography>
      <Box
        ref={editorContainerRef} // Attach Quill instance to this ref
        sx={{
          border: "1px solid #c4c4c4",
          borderRadius: 1,
          minHeight: 300,
          backgroundColor: "#fff",
        }}
      />
    </Box>
  );
}
