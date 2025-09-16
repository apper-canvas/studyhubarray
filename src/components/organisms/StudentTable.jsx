import React, { useState } from "react";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const StudentTable = ({ students, onEdit, onDelete, onViewProfile }) => {
  const [sortField, setSortField] = useState("lastName");
  const [sortDirection, setSortDirection] = useState("asc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "enrollmentDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "active": return "success";
      case "inactive": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-primary-600"
    >
      <span>{children}</span>
      {sortField === field && (
        <ApperIcon 
          name={sortDirection === "asc" ? "ChevronUp" : "ChevronDown"} 
          size={14} 
        />
      )}
    </button>
  );

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
<tr>
              <th className="px-6 py-4 text-left">
                <SortButton field="lastName">Student</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="email">Contact</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="enrollmentDate">Enrolled</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="department">Department</SortButton>
              </th>
              <th className="px-6 py-4 text-left">Classes</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedStudents.map((student) => (
              <tr key={student.Id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2 rounded-full">
                      <ApperIcon name="User" size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">{student.email}</p>
                    <p className="text-sm text-gray-500">{student.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">
                    {format(new Date(student.enrollmentDate), "MMM dd, yyyy")}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={getStatusVariant(student.status)}>
                    {student.status}
                  </Badge>
                </td>
<td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{student.department}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {student.classIds.slice(0, 2).map((classId) => (
                      <Badge key={classId} variant="primary" className="text-xs">
                        Class {classId}
                      </Badge>
                    ))}
                    {student.classIds.length > 2 && (
                      <Badge variant="default" className="text-xs">
                        +{student.classIds.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewProfile?.(student)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit?.(student)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete?.(student.Id)}
                      className="text-error hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StudentTable;