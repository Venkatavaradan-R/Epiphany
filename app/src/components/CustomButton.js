import React from "react";
import { Button } from "@mui/material";

const CustomButton = ({ children, onClick = () => {} }) => {
  return (
    <Button
      style={{
        background: "linear-gradient(90deg, #421EB7 0%, #30A0C3 100%)",
        borderRadius: 8,
        padding: "2% 4%",
        color: "white",
        textTransform: "none",
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
