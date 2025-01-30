import React from "react";
import Editor from "../QuillEditor/Editor";

const LongDescription = ({ onChange }) => {
  return (
    <Editor editorTitle="Long Description" updateHTMLContent={onChange} />
  );
};

export default LongDescription;
