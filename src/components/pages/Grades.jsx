import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import gradeService from "@/services/api/gradeService";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [gradesData, studentsData, classesData] = await Promise.all([
        gradeService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setGrades(gradesData);
      setStudents(studentsData);
      setClasses(classesData);
      setFilteredGrades(gradesData);
    } catch (err) {
      setError("Failed to load grades. Please try again.");
      console.error("Load grades error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter grades
  useEffect(() => {
    let filtered = [...grades];

    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(grade => grade.classId === parseInt(selectedClass));
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(grade => grade.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search query (student name or assignment)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(grade => {
const student = students.find(s => s.Id === grade.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : "";
        return studentName.includes(query) || grade.assignmentName.toLowerCase().includes(query);
      });
    }

    setFilteredGrades(filtered);
  }, [grades, selectedClass, selectedCategory, searchQuery, students]);

  const getStudentName = (studentId) => {
    const student = students.find(s => s.Id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };

  const getClassName = (classId) => {
    const classItem = classes.find(c => c.Id === classId);
    return classItem ? classItem.name : "Unknown Class";
  };

  const getGradeVariant = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 65) return "D";
    return "F";
  };

  const calculateClassAverage = () => {
    if (filteredGrades.length === 0) return 0;
    const total = filteredGrades.reduce((sum, grade) => {
      return sum + (grade.points / grade.maxPoints) * 100;
    }, 0);
    return Math.round(total / filteredGrades.length);
  };

  const categories = [...new Set(grades.map(g => g.category))];
  
  const classOptions = [
    { value: "", label: "All Classes" },
    ...classes.map(c => ({ value: c.Id.toString(), label: c.name }))
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Grades" />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Grades" />
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Grades">
        <Button
          variant="primary"
          className="flex items-center space-x-2"
          onClick={() => toast.info("Add grade functionality would be implemented here")}
        >
          <ApperIcon name="Plus" size={18} />
          <span>Add Grade</span>
        </Button>
      </Header>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by student name or assignment..."
            onClear={() => setSearchQuery("")}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="min-w-48"
          >
            {classOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="min-w-48"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Total Grades</p>
              <p className="text-3xl font-bold text-primary-900">{filteredGrades.length}</p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <ApperIcon name="GraduationCap" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Class Average</p>
              <p className="text-3xl font-bold text-green-900">{calculateClassAverage()}%</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Categories</p>
              <p className="text-3xl font-bold text-blue-900">{categories.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <ApperIcon name="Layers" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">High Achievers</p>
              <p className="text-3xl font-bold text-purple-900">
                {filteredGrades.filter(g => (g.points / g.maxPoints) >= 0.9).length}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <ApperIcon name="Award" size={24} className="text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Grades Table */}
      {filteredGrades.length === 0 ? (
        <Empty
          title="No grades found"
          description={searchQuery || selectedClass || selectedCategory
            ? "Try adjusting your search criteria or filters."
            : "Get started by adding grades for your students' assignments."
          }
          actionLabel="Add Grade"
          onAction={() => toast.info("Add grade functionality would be implemented here")}
          icon="GraduationCap"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Student</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Assignment</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Score</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Grade</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-700">Date</th>
                  <th className="px-6 py-4 text-right font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGrades.map((grade) => {
                  const percentage = Math.round((grade.points / grade.maxPoints) * 100);
                  return (
                    <tr key={grade.Id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2 rounded-full">
                            <ApperIcon name="User" size={16} className="text-primary-600" />
                          </div>
                          <p className="font-medium text-gray-900">
                            {getStudentName(grade.studentId)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{grade.assignmentName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{getClassName(grade.classId)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info" className="text-xs">
                          {grade.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {grade.points} / {grade.maxPoints}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getGradeVariant(percentage)}>
                            {percentage}%
                          </Badge>
                          <span className="text-sm font-medium text-gray-600">
                            ({getGradeLetter(percentage)})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {format(new Date(grade.date), "MMM dd, yyyy")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toast.info(`Editing grade for ${grade.assignmentName}`)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toast.info(`Deleting grade for ${grade.assignmentName}`)}
                            className="text-error hover:text-red-700"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Grades;