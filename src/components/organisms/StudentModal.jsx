import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StudentModal = ({ student, isOpen, onClose, onSave, classes = [] }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active",
    parentContact: {
      name: "",
      email: "",
      phone: ""
    },
    classIds: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        status: student.status || "active",
        parentContact: student.parentContact || {
          name: "",
          email: "",
          phone: ""
        },
        classIds: student.classIds || []
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        status: "active",
        parentContact: {
          name: "",
          email: "",
          phone: ""
        },
        classIds: []
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      const studentData = {
        ...formData,
        enrollmentDate: student ? student.enrollmentDate : new Date().toISOString(),
        studentId: student ? student.studentId : `STU-${Date.now()}`
      };

      if (student) {
        studentData.Id = student.Id;
      }

      await onSave(studentData);
      
      toast.success(student ? "Student updated successfully" : "Student added successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to save student");
    }
  };

  const handleParentContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      parentContact: {
        ...prev.parentContact,
        [field]: value
      }
    }));
  };

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 p-0">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {student ? "Edit Student" : "Add New Student"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                error={errors.firstName}
                required
              />
              
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                error={errors.lastName}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={errors.email}
                required
              />
              
              <Input
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </Select>
          </div>

          {/* Parent Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Parent/Guardian Contact</h3>
            
            <Input
              label="Parent/Guardian Name"
              value={formData.parentContact.name}
              onChange={(e) => handleParentContactChange("name", e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Parent Email"
                type="email"
                value={formData.parentContact.email}
                onChange={(e) => handleParentContactChange("email", e.target.value)}
              />
              
              <Input
                label="Parent Phone"
                value={formData.parentContact.phone}
                onChange={(e) => handleParentContactChange("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Class Assignment */}
          {classes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Class Assignment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {classes.map((classItem) => (
                  <label
                    key={classItem.Id}
                    className={cn(
                      "flex items-center p-3 rounded-lg border cursor-pointer transition-all",
                      formData.classIds.includes(classItem.Id)
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.classIds.includes(classItem.Id)}
                      onChange={() => handleClassToggle(classItem.Id)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center",
                        formData.classIds.includes(classItem.Id)
                          ? "bg-primary-500 border-primary-500"
                          : "border-gray-300"
                      )}>
                        {formData.classIds.includes(classItem.Id) && (
                          <ApperIcon name="Check" size={12} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classItem.name}</p>
                        <p className="text-sm text-gray-500">{classItem.subject} • {classItem.semester}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {student ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentModal;