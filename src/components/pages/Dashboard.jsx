import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";
import attendanceService from "@/services/api/attendanceService";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [students, classes, grades, attendance] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);

      // Calculate statistics
      const activeStudents = students.filter(s => s.status === "active").length;
      const pendingStudents = students.filter(s => s.status === "pending").length;
      const totalClasses = classes.length;
      
      // Calculate attendance rate
      const presentCount = attendance.filter(a => a.status === "present").length;
      const attendanceRate = attendance.length > 0 ? 
        Math.round((presentCount / attendance.length) * 100) : 0;

      // Recent activity
      const recentGrades = grades
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map(grade => {
          const student = students.find(s => s.Id === grade.studentId);
          const classItem = classes.find(c => c.Id === grade.classId);
          return {
            ...grade,
            studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
            className: classItem ? classItem.name : "Unknown Class"
          };
        });

      setData({
        stats: {
          activeStudents,
          pendingStudents,
          totalClasses,
          attendanceRate
        },
        recentGrades,
        students,
        classes
      });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 80) return "text-info";
    if (percentage >= 70) return "text-warning";
    return "text-error";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Dashboard" />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Dashboard" />
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Dashboard">
        <Button
          onClick={() => navigate("/students")}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={18} />
          <span className="hidden sm:inline">Add Student</span>
        </Button>
      </Header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Students"
          value={data.stats.activeStudents}
          icon="Users"
          trend="up"
          trendValue="+12% this month"
          gradient={true}
        />
        <StatCard
          title="Pending Students"
          value={data.stats.pendingStudents}
          icon="UserPlus"
          className="bg-gradient-to-br from-yellow-50 to-yellow-100"
        />
        <StatCard
          title="Total Classes"
          value={data.stats.totalClasses}
          icon="BookOpen"
          className="bg-gradient-to-br from-blue-50 to-blue-100"
        />
        <StatCard
          title="Attendance Rate"
          value={`${data.stats.attendanceRate}%`}
          icon="Calendar"
          trend="up"
          trendValue="+5% this week"
          className="bg-gradient-to-br from-green-50 to-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Grades</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/grades")}
              className="text-primary-600 hover:text-primary-700"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {data.recentGrades.map((grade) => {
              const percentage = Math.round((grade.points / grade.maxPoints) * 100);
              return (
                <div key={grade.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{grade.studentName}</p>
                    <p className="text-sm text-gray-600">{grade.assignmentName}</p>
                    <p className="text-xs text-gray-500">{grade.className}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getGradeColor(percentage)}`}>
                      {percentage}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {grade.points}/{grade.maxPoints}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="primary"
              onClick={() => navigate("/students")}
              className="flex items-center justify-start space-x-3 p-4 h-auto"
            >
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <ApperIcon name="UserPlus" size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium">Add New Student</p>
                <p className="text-sm opacity-90">Register a new student</p>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate("/grades")}
              className="flex items-center justify-start space-x-3 p-4 h-auto"
            >
              <div className="bg-gray-100 p-2 rounded-lg">
                <ApperIcon name="GraduationCap" size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Enter Grades</p>
                <p className="text-sm text-gray-600">Update student grades</p>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate("/attendance")}
              className="flex items-center justify-start space-x-3 p-4 h-auto"
            >
              <div className="bg-gray-100 p-2 rounded-lg">
                <ApperIcon name="Calendar" size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Take Attendance</p>
                <p className="text-sm text-gray-600">Mark daily attendance</p>
              </div>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => navigate("/reports")}
              className="flex items-center justify-start space-x-3 p-4 h-auto"
            >
              <div className="bg-gray-100 p-2 rounded-lg">
                <ApperIcon name="FileText" size={20} className="text-gray-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Generate Reports</p>
                <p className="text-sm text-gray-600">View performance reports</p>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;