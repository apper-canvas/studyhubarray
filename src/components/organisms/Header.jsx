import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ title, onMenuClick, className, children }) => {
  const { logout } = useContext(AuthContext);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  return (
    <div className={`flex items-center justify-between ${className || ""}`}>
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <ApperIcon name="Menu" size={20} />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {children}
        
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3 ml-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.emailAddress}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <ApperIcon name="LogOut" size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;