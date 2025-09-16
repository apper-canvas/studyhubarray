import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className, 
  gradient = false,
  children, 
  ...props 
}, ref) => {
  const baseStyles = "rounded-xl transition-all duration-200 hover:shadow-lg";
  
  const cardStyles = gradient 
    ? "bg-gradient-to-br from-white via-white to-gray-50 border border-gray-100 shadow-md backdrop-blur-sm"
    : "bg-white border border-gray-100 shadow-md";

  return (
    <div
      className={cn(baseStyles, cardStyles, className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;