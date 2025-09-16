import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";
import gradeService from "@/services/api/gradeService";
import attendanceService from "@/services/api/attendanceService";
import ReactApexChart from "react-apexcharts";

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [selectedReport, setSelectedReport] = useState("overview");
  const [selectedClass, setSelectedClass] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [studentsData, classesData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      
      setStudents(studentsData);
      setClasses(classesData);
      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (err) {
      setError("Failed to load report data. Please try again.");
      console.error("Load report data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateOverviewData = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === "active").length;
    const totalGrades = grades.length;
    const averageGrade = grades.length > 0 
      ? Math.round(grades.reduce((sum, g) => sum + (g.points / g.maxPoints) * 100, 0) / grades.length)
      : 0;
    
    const attendanceRate = attendance.length > 0
      ? Math.round((attendance.filter(a => a.status === "present").length / attendance.length) * 100)
      : 0;

    return {
      totalStudents,
      activeStudents,
      totalGrades,
      averageGrade,
      attendanceRate
    };
  };

  const generateGradeDistributionData = () => {
    const gradeBands = { "A": 0, "B": 0, "C": 0, "D": 0, "F": 0 };
    
    grades.forEach(grade => {
      const percentage = (grade.points / grade.maxPoints) * 100;
      if (percentage >= 90) gradeBands["A"]++;
      else if (percentage >= 80) gradeBands["B"]++;
      else if (percentage >= 70) gradeBands["C"]++;
      else if (percentage >= 60) gradeBands["D"]++;
      else gradeBands["F"]++;
    });

    return {
      series: Object.values(gradeBands),
      labels: Object.keys(gradeBands)
    };
  };

  const generateClassPerformanceData = () => {
    const classPerformance = classes.map(classItem => {
      const classGrades = grades.filter(g => g.classId === classItem.Id);
      const average = classGrades.length > 0
        ? Math.round(classGrades.reduce((sum, g) => sum + (g.points / g.maxPoints) * 100, 0) / classGrades.length)
        : 0;
      
      return {
        className: classItem.name,
        average,
        studentCount: classItem.studentIds.length
      };
    });

    return {
      series: [{
        name: "Average Grade",
        data: classPerformance.map(c => c.average)
      }],
      categories: classPerformance.map(c => c.className)
    };
  };

  const generateAttendanceTrendData = () => {
    // Simple monthly attendance trend (mock data for demonstration)
    const months = ["Sep", "Oct", "Nov", "Dec"];
    const attendanceByMonth = months.map(() => Math.floor(Math.random() * 20) + 80);

    return {
      series: [{
        name: "Attendance Rate",
        data: attendanceByMonth
      }],
      categories: months
    };
  };

  const exportReport = (format) => {
    toast.success(`Exporting report in ${format.toUpperCase()} format...`);
    // In a real app, this would generate and download the report
  };

  const overviewData = generateOverviewData();
  const gradeDistribution = generateGradeDistributionData();
  const classPerformance = generateClassPerformanceData();
  const attendanceTrend = generateAttendanceTrendData();

  const pieChartOptions = {
    chart: { type: "donut" },
    labels: gradeDistribution.labels,
    colors: ["#059669", "#0284c7", "#d97706", "#dc2626", "#7c2d12"],
    legend: { position: "bottom" },
    plotOptions: {
      pie: {
        donut: { size: "60%" }
      }
    }
  };

  const barChartOptions = {
    chart: { type: "bar" },
    xaxis: { categories: classPerformance.categories },
    colors: ["#2563eb"],
    plotOptions: {
      bar: { horizontal: false, borderRadius: 4 }
    },
    dataLabels: { enabled: false }
  };

  const lineChartOptions = {
    chart: { type: "line", toolbar: { show: false } },
    xaxis: { categories: attendanceTrend.categories },
    colors: ["#059669"],
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 6 }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Reports" />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Reports" />
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Reports">
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => exportReport("pdf")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="FileText" size={18} />
            <span>Export PDF</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportReport("excel")}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Download" size={18} />
            <span>Export Excel</span>
          </Button>
        </div>
      </Header>

      {/* Report Type Selection */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="min-w-48"
          >
            <option value="overview">Overview Report</option>
            <option value="grades">Grade Analysis</option>
            <option value="attendance">Attendance Report</option>
            <option value="performance">Class Performance</option>
          </Select>
          
          {selectedReport !== "overview" && (
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="min-w-48"
            >
              <option value="">All Classes</option>
              {classes.map(classItem => (
                <option key={classItem.Id} value={classItem.Id.toString()}>
                  {classItem.name}
                </option>
              ))}
            </Select>
          )}
        </div>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Students</p>
              <p className="text-3xl font-bold text-blue-900">{overviewData.totalStudents}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <ApperIcon name="Users" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Students</p>
              <p className="text-3xl font-bold text-green-900">{overviewData.activeStudents}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ApperIcon name="UserCheck" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Grades</p>
              <p className="text-3xl font-bold text-purple-900">{overviewData.totalGrades}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <ApperIcon name="GraduationCap" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Average Grade</p>
              <p className="text-3xl font-bold text-orange-900">{overviewData.averageGrade}%</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">Attendance</p>
              <p className="text-3xl font-bold text-cyan-900">{overviewData.attendanceRate}%</p>
            </div>
            <div className="bg-cyan-500 p-3 rounded-lg">
              <ApperIcon name="Calendar" size={24} className="text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <ReactApexChart
            options={pieChartOptions}
            series={gradeDistribution.series}
            type="donut"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance</h3>
          <ReactApexChart
            options={barChartOptions}
            series={classPerformance.series}
            type="bar"
            height={300}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <ReactApexChart
            options={lineChartOptions}
            series={attendanceTrend.series}
            type="line"
            height={300}
          />
        </Card>
      </div>

      {/* Detailed Performance Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Student Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-medium text-gray-700">Student</th>
                <th className="px-6 py-4 text-left font-medium text-gray-700">Class</th>
                <th className="px-6 py-4 text-left font-medium text-gray-700">Average Grade</th>
                <th className="px-6 py-4 text-left font-medium text-gray-700">Attendance</th>
                <th className="px-6 py-4 text-left font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.slice(0, 10).map(student => {
                const studentGrades = grades.filter(g => g.studentId === student.Id);
                const avgGrade = studentGrades.length > 0
                  ? Math.round(studentGrades.reduce((sum, g) => sum + (g.points / g.maxPoints) * 100, 0) / studentGrades.length)
                  : 0;
                
                const studentAttendance = attendance.filter(a => a.studentId === student.Id);
                const attendanceRate = studentAttendance.length > 0
                  ? Math.round((studentAttendance.filter(a => a.status === "present").length / studentAttendance.length) * 100)
                  : 0;

                return (
                  <tr key={student.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2 rounded-full">
                          <ApperIcon name="User" size={16} className="text-primary-600" />
                        </div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{student.classIds.length} classes</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{avgGrade}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{attendanceRate}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.status === "active" 
                          ? "bg-green-100 text-green-800"
                          : student.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;