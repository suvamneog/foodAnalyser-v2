/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import * as React from "react";

const Label = ({ children, className, ...props }) => {
  return (
    <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
    </label>
  );
};

export { Label };