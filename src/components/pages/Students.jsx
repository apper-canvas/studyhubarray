import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import StudentTable from "@/components/organisms/StudentTable";
import StudentModal from "@/components/organisms/StudentModal";
import SearchBar from "@/components/molecules/SearchBar";
import FilterDropdown from "@/components/molecules/FilterDropdown";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
// UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      setFilteredStudents(studentsData);
    } catch (err) {
      setError("Failed to load students. Please try again.");
      console.error("Load students error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

// Filter students based on search and all filter criteria
  useEffect(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.studentId.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Apply grade level filter
    if (gradeFilter) {
      filtered = filtered.filter(student => {
        // Get student's classes and determine grade level
        const studentClasses = classes.filter(cls => student.classIds.includes(cls.Id));
        const studentGradeLevel = getGradeLevelFromClasses(studentClasses);
        return studentGradeLevel === gradeFilter;
      });
    }

    // Apply subject filter
    if (subjectFilter) {
      filtered = filtered.filter(student => {
        // Check if student is enrolled in classes with the selected subject
        const studentClasses = classes.filter(cls => student.classIds.includes(cls.Id));
        return studentClasses.some(cls => cls.subject === subjectFilter);
      });
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery, statusFilter, gradeFilter, subjectFilter, classes]);

  // Helper function to determine grade level from classes
  const getGradeLevelFromClasses = (studentClasses) => {
    const subjects = studentClasses.map(cls => cls.subject);
    if (subjects.includes('Mathematics') && subjects.includes('Science')) {
      return 'High School';
    } else if (subjects.includes('History') || subjects.includes('English')) {
      return 'Middle School';
    } else {
      return 'Elementary';
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        const updatedStudent = await studentService.update(editingStudent.Id, studentData);
        setStudents(prev => prev.map(s => s.Id === updatedStudent.Id ? updatedStudent : s));
      } else {
        const newStudent = await studentService.create(studentData);
        setStudents(prev => [...prev, newStudent]);
      }
    } catch (err) {
      console.error("Save student error:", err);
      throw err; // Re-throw to let modal handle the error
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    try {
      await studentService.delete(studentId);
      setStudents(prev => prev.filter(s => s.Id !== studentId));
      toast.success("Student deleted successfully");
    } catch (err) {
      toast.error("Failed to delete student");
      console.error("Delete student error:", err);
    }
  };

  const handleViewProfile = (student) => {
    // For now, just show a toast - in a real app, this might navigate to a profile page
    toast.info(`Viewing profile for ${student.firstName} ${student.lastName}`);
  };

const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" }
  ];

  const gradeOptions = [
    { value: "", label: "All Grade Levels" },
    { value: "Elementary", label: "Elementary" },
    { value: "Middle School", label: "Middle School" },
    { value: "High School", label: "High School" }
  ];

  const subjectOptions = [
    { value: "", label: "All Subjects" },
    { value: "Mathematics", label: "Mathematics" },
    { value: "English", label: "English" },
    { value: "Science", label: "Science" },
    { value: "History", label: "History" },
    { value: "PE", label: "PE" }
  ];

  // Count active filters
  const activeFilterCount = [statusFilter, gradeFilter, subjectFilter].filter(Boolean).length;

  // Clear all filters function
  const clearAllFilters = () => {
    setStatusFilter("");
    setGradeFilter("");
    setSubjectFilter("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Students" />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Students" />
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Students">
        <Button
          onClick={handleAddStudent}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={18} />
          <span>Add Student</span>
        </Button>
      </Header>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or student ID..."
            onClear={() => setSearchQuery("")}
          />
        </div>
        
<div className="flex flex-wrap gap-4 items-center">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Grade Level"
            options={gradeOptions}
            value={gradeFilter}
            onChange={setGradeFilter}
          />
          <FilterDropdown
            label="Subject"
            options={subjectOptions}
            value={subjectFilter}
            onChange={setSubjectFilter}
          />
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-primary-600 hover:text-primary-700 text-sm"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <ApperIcon name="Users" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Students</p>
              <p className="text-2xl font-bold text-blue-900">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-2 rounded-lg">
              <ApperIcon name="UserCheck" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Active Students</p>
              <p className="text-2xl font-bold text-green-900">
                {students.filter(s => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <ApperIcon name="UserX" size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending Students</p>
              <p className="text-2xl font-bold text-yellow-900">
                {students.filter(s => s.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <Empty
          title="No students found"
          description={searchQuery || statusFilter 
            ? "Try adjusting your search criteria or filters." 
            : "Get started by adding your first student to the system."
          }
          actionLabel="Add Student"
          onAction={handleAddStudent}
          icon="Users"
        />
      ) : (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEditStudent}
          onDelete={handleDeleteStudent}
          onViewProfile={handleViewProfile}
        />
      )}

      {/* Student Modal */}
      <StudentModal
        student={editingStudent}
        classes={classes}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default Students;