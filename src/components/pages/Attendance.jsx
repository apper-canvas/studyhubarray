import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import Header from "@/components/organisms/Header";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import attendanceService from "@/services/api/attendanceService";
import studentService from "@/services/api/studentService";
import classService from "@/services/api/classService";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // View state
  const [selectedClass, setSelectedClass] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [attendanceData, studentsData, classesData] = await Promise.all([
        attendanceService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setAttendance(attendanceData);
      setStudents(studentsData);
      setClasses(classesData);
      
      // Set default class if available
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].Id.toString());
      }
    } catch (err) {
      setError("Failed to load attendance data. Please try again.");
      console.error("Load attendance error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update week days when current week changes
  useEffect(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday
    const days = eachDayOfInterval({ start, end });
    setWeekDays(days);
  }, [currentWeek]);

  const getStudentsInClass = () => {
    if (!selectedClass) return [];
    const classItem = classes.find(c => c.Id === parseInt(selectedClass));
    if (!classItem) return [];
    
    return students.filter(student => classItem.studentIds.includes(student.Id));
  };

  const getAttendanceForStudentAndDate = (studentId, date) => {
    return attendance.find(record => 
      record.studentId === studentId && 
      record.classId === parseInt(selectedClass) &&
      isSameDay(new Date(record.date), date)
    );
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "present": return "success";
      case "absent": return "error";
      case "late": return "warning";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present": return "Check";
      case "absent": return "X";
      case "late": return "Clock";
      default: return "Minus";
    }
  };

  const updateAttendance = async (studentId, date, status) => {
    try {
      const existingRecord = getAttendanceForStudentAndDate(studentId, date);
      
      if (existingRecord) {
        const updatedRecord = await attendanceService.update(existingRecord.Id, { status });
        setAttendance(prev => prev.map(record => 
          record.Id === updatedRecord.Id ? updatedRecord : record
        ));
      } else {
        const newRecord = await attendanceService.create({
          studentId,
          classId: parseInt(selectedClass),
          date: date.toISOString(),
          status,
          notes: ""
        });
        setAttendance(prev => [...prev, newRecord]);
      }
      
      toast.success("Attendance updated successfully");
    } catch (err) {
      toast.error("Failed to update attendance");
      console.error("Update attendance error:", err);
    }
  };

  const calculateAttendanceStats = () => {
    const classStudents = getStudentsInClass();
    const classAttendance = attendance.filter(record => 
      record.classId === parseInt(selectedClass)
    );

    const totalRecords = classAttendance.length;
    const presentCount = classAttendance.filter(record => record.status === "present").length;
    const absentCount = classAttendance.filter(record => record.status === "absent").length;
    const lateCount = classAttendance.filter(record => record.status === "late").length;

    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    return {
      totalStudents: classStudents.length,
      attendanceRate,
      presentCount,
      absentCount,
      lateCount
    };
  };

  const stats = calculateAttendanceStats();
  const classStudents = getStudentsInClass();

  if (loading) {
    return (
      <div className="space-y-6">
        <Header title="Attendance" />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Header title="Attendance" />
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="Attendance">
        <div className="flex items-center space-x-3">
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="min-w-48"
          >
            <option value="">Select Class</option>
            {classes.map(classItem => (
              <option key={classItem.Id} value={classItem.Id.toString()}>
                {classItem.name}
              </option>
            ))}
          </Select>
        </div>
      </Header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Total Students</p>
              <p className="text-3xl font-bold text-primary-900">{stats.totalStudents}</p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <ApperIcon name="Users" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Attendance Rate</p>
              <p className="text-3xl font-bold text-green-900">{stats.attendanceRate}%</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <ApperIcon name="TrendingUp" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Absent Today</p>
              <p className="text-3xl font-bold text-red-900">{stats.absentCount}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <ApperIcon name="UserX" size={24} className="text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Late Arrivals</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.lateCount}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <ApperIcon name="Clock" size={24} className="text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentWeek(prev => subWeeks(prev, 1))}
            >
              <ApperIcon name="ChevronLeft" size={16} />
            </Button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              Week of {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM dd, yyyy")}
            </h3>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentWeek(prev => addWeeks(prev, 1))}
            >
              <ApperIcon name="ChevronRight" size={16} />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentWeek(new Date())}
          >
            Today
          </Button>
        </div>
      </Card>

      {/* Attendance Grid */}
      {!selectedClass ? (
        <Empty
          title="Select a class"
          description="Choose a class from the dropdown above to view and manage attendance."
          icon="BookOpen"
        />
      ) : classStudents.length === 0 ? (
        <Empty
          title="No students in this class"
          description="Add students to this class to start taking attendance."
          actionLabel="Manage Students"
          onAction={() => toast.info("Student management functionality would be implemented here")}
          icon="Users"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
                    Student
                  </th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className="px-4 py-4 text-center font-medium text-gray-700 min-w-32">
                      <div>
                        <p className="text-sm">{format(day, "EEE")}</p>
                        <p className="text-xs text-gray-500">{format(day, "MMM dd")}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map(student => (
                  <tr key={student.Id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-2 rounded-full">
                          <ApperIcon name="User" size={16} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map(day => {
                      const attendanceRecord = getAttendanceForStudentAndDate(student.Id, day);
                      const status = attendanceRecord?.status;
                      
                      return (
                        <td key={day.toISOString()} className="px-4 py-4 text-center">
                          <div className="flex justify-center space-x-1">
                            <Button
                              size="sm"
                              variant={status === "present" ? "accent" : "ghost"}
                              onClick={() => updateAttendance(student.Id, day, "present")}
                              className="w-8 h-8 p-0"
                              title="Present"
                            >
                              <ApperIcon name="Check" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "danger" : "ghost"}
                              onClick={() => updateAttendance(student.Id, day, "absent")}
                              className="w-8 h-8 p-0"
                              title="Absent"
                            >
                              <ApperIcon name="X" size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "late" ? "secondary" : "ghost"}
                              onClick={() => updateAttendance(student.Id, day, "late")}
                              className="w-8 h-8 p-0"
                              title="Late"
                            >
                              <ApperIcon name="Clock" size={14} />
                            </Button>
                          </div>
                          {attendanceRecord && (
                            <div className="mt-1">
                              <Badge 
                                variant={getStatusVariant(status)} 
                                className="text-xs px-1 py-0"
                              >
                                {status}
                              </Badge>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Attendance;