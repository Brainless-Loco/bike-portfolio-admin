import React,{ useEffect, useRef } from 'react'
import Quill from "quill";
import "quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Editor({editorTitle, updateHTMLContent}) {
const quillRef = useRef(null);
const isMounted = useRef(false);

useEffect(() => {
    if (!isMounted.current) {
      Quill.register("modules/imageResize", ImageResize);
      const quill = new Quill("#quill-editor", {
        theme: "snow",
        placeholder: "Write detailed information here...",
        modules: {
          toolbar: [
            [{ 'font': [] }],
            [{ header: [1, 2, 3, false] }],
            [{size: [ 'small', false, 'large', 'huge' ]}],
            [{ 'align': [] }],
            ["bold", "italic", "underline", "strike"],
            
            [{ list: "ordered" }, { list: "bullet" }],
            [{ script: "sub" }, { script: "super" }],
            
            ["blockquote", "code-block"],
            [{ 'color': [] }, { 'background': [] }],
            ["link", "image", "video"],
            ["clean"],
          ],
          imageResize: {
            parchment: Quill.import('parchment'),
            modules: ["Resize", "DisplaySize"],
          },
        },
      });

      quill.on("text-change", () => {
        updateHTMLContent(quill.root.innerHTML);
      });

      quillRef.current = quill;
      isMounted.current = true;
    }
  }, []);

  return (
    <Box sx={{ mt: 3 }} className="bg-slate-100 w-full">
        <Typography variant="h5" gutterBottom>
          {editorTitle}
        </Typography>
        <Box
          id="quill-editor"
          sx={{
            border: "1px solid #c4c4c4",
            borderRadius: 1,
            minHeight: 300,
            backgroundColor: "#fff",
          }}
        />
      </Box>
  )
}
