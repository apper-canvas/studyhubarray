import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import classService from "@/services/api/classService";
import studentService from "@/services/api/studentService";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      setError("Failed to load classes. Please try again.");
      console.error("Load classes error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStudentNames = (studentIds) => {
    return studentIds
      .map(id => {
        const student = students.find(s => s.Id === id);
        return student ? `${student.firstName} ${student.lastName}` : null;
      })
      .filter(Boolean);
  };

  const getSubjectColor = (subject) => {
    const colors = {
      "Mathematics": "primary",
      "English": "success", 
      "Science": "info",
      "History": "warning",
      "PE": "error"
    };
    return colors[subject] || "default";
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return "No schedule";
    return `${schedule.days?.join(", ")} • ${schedule.time} • ${schedule.room}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Classes" />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Classes" />
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Classes">
        <Button
          variant="primary"
          className="flex items-center space-x-2"
          onClick={() => toast.info("Add class functionality would be implemented here")}
        >
          <ApperIcon name="Plus" size={18} />
          <span>Add Class</span>
        </Button>
      </Header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Total Classes</p>
              <p className="text-3xl font-bold text-primary-900">{classes.length}</p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <ApperIcon name="BookOpen" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg. Students</p>
              <p className="text-3xl font-bold text-green-900">
                {classes.length > 0 ? 
                  Math.round(classes.reduce((sum, c) => sum + c.studentIds.length, 0) / classes.length) 
                  : 0}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ApperIcon name="Users" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Subjects</p>
              <p className="text-3xl font-bold text-blue-900">
                {new Set(classes.map(c => c.subject)).size}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <ApperIcon name="Library" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Semester</p>
              <p className="text-xl font-bold text-purple-900">Fall 2024</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <ApperIcon name="Calendar" size={24} className="text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Empty
          title="No classes found"
          description="Get started by creating your first class to organize students and curriculum."
          actionLabel="Add Class"
          onAction={() => toast.info("Add class functionality would be implemented here")}
          icon="BookOpen"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card key={classItem.Id} className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {classItem.name}
                    </h3>
                    <Badge variant={getSubjectColor(classItem.subject)}>
                      {classItem.subject}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.info(`Viewing details for ${classItem.name}`)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.info(`Editing ${classItem.name}`)}
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ApperIcon name="Calendar" size={16} />
                    <span>{classItem.semester}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <ApperIcon name="Users" size={16} />
                    <span>{classItem.studentIds.length} students enrolled</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <ApperIcon name="Clock" size={16} className="mt-0.5 flex-shrink-0" />
                    <span className="flex-1">{formatSchedule(classItem.schedule)}</span>
                  </div>
                </div>

                {/* Students Preview */}
                {classItem.studentIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Students:</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {getStudentNames(classItem.studentIds).slice(0, 3).map((name, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-6 h-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                            <ApperIcon name="User" size={12} className="text-primary-600" />
                          </div>
                          <span className="text-gray-600">{name}</span>
                        </div>
                      ))}
                      {classItem.studentIds.length > 3 && (
                        <div className="text-xs text-gray-500 pl-8">
                          +{classItem.studentIds.length - 3} more students
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.info(`Taking attendance for ${classItem.name}`)}
                      className="text-success hover:text-green-700"
                    >
                      <ApperIcon name="Calendar" size={16} className="mr-1" />
                      Attendance
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.info(`Managing grades for ${classItem.name}`)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <ApperIcon name="GraduationCap" size={16} className="mr-1" />
                      Grades
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Classes;