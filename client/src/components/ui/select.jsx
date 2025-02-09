/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import * as React from "react";

const Select = ({ children, className, value, onChange, ...props }) => {
    return (
      <select
        className={`border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${className}`}
        value={value} // Ensure value is passed
        onChange={onChange} // Use onChange instead of onValueChange
        {...props}
      >
        {children}
      </select>
    );
};

const SelectContent = ({ children }) => <>{children}</>;
const SelectGroup = ({ children }) => <>{children}</>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;
const SelectLabel = ({ children }) => <span className="text-gray-600">{children}</span>;
const SelectTrigger = ({ children }) => <>{children}</>;
const SelectValue = ({ value }) => <>{value}</>;

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue };