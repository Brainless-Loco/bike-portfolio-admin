import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

/**
 * Basic key/value table row used across applicant details.
 * Props:
 * - label: string | node (left column)
 * - value: string | node (right column) — ignored if children provided
 * - children: node (alternative content for right column)
 * - labelClassName, valueClassName: optional extra tailwind classNames
 */
const BasicKeyValueTableRow = ({
  label,
  value,
  children,
  labelClassName = "",
  valueClassName = "",
}) => {
  const baseLabelClasses = "font-semibold text-base border border-gray-200 p-2 align-top";
  const baseValueClasses = "text-base border border-gray-200 p-2 align-top";

  return (
    <TableRow>
      <TableCell className={`${baseLabelClasses} ${labelClassName}`}>{label}</TableCell>
      <TableCell className={`${baseValueClasses} ${valueClassName}`}>
        {children ?? value ?? "—"}
      </TableCell>
    </TableRow>
  );
};

export default BasicKeyValueTableRow;
