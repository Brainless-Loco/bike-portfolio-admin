import React from "react";
import Editor from "../../../Components/QuillEditor/Editor";

const LongDescription = ({ onChange }) => {
  return (
    <Editor editorTitle="Long Description" updateHTMLContent={onChange} />
  );
};

export default LongDescription;
