import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  className = "",
  gradient = false 
}) => {
  const getTrendColor = () => {
    if (!trend) return "";
    return trend === "up" ? "text-success" : "text-error";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === "up" ? "TrendingUp" : "TrendingDown";
  };

  return (
    <Card gradient={gradient} className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold gradient-text">{value}</p>
          
          {trend && trendValue && (
            <div className={cn("flex items-center space-x-1 text-sm", getTrendColor())}>
              <ApperIcon name={getTrendIcon()} size={14} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-3 rounded-lg">
          <ApperIcon name={icon} size={24} className="text-primary-600" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;