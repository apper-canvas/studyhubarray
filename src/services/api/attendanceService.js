class AttendanceService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'attendance_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "class_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance:", response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      return (response.data || []).map(attendance => ({
        Id: attendance.Id,
        studentId: attendance.student_id_c?.Id || attendance.student_id_c || null,
        classId: attendance.class_id_c?.Id || attendance.class_id_c || null,
        date: attendance.date_c || new Date().toISOString(),
        status: attendance.status_c || "present",
        notes: attendance.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching attendance:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "class_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Attendance record not found");
      }

      const attendance = response.data;
      return {
        Id: attendance.Id,
        studentId: attendance.student_id_c?.Id || attendance.student_id_c || null,
        classId: attendance.class_id_c?.Id || attendance.class_id_c || null,
        date: attendance.date_c || "",
        status: attendance.status_c || "",
        notes: attendance.notes_c || ""
      };
    } catch (error) {
      console.error(`Error fetching attendance record ${id}:`, error);
      throw error;
    }
  }

  async getByStudentId(studentId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          FieldName: "student_id_c",
          Operator: "EqualTo",
          Values: [parseInt(studentId)],
          Include: true
        }],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance by student:", response.message);
        return [];
      }

      return (response.data || []).map(attendance => ({
        Id: attendance.Id,
        studentId: attendance.student_id_c?.Id || attendance.student_id_c || null,
        classId: attendance.class_id_c?.Id || attendance.class_id_c || null,
        date: attendance.date_c || "",
        status: attendance.status_c || "",
        notes: attendance.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching attendance by student:", error);
      return [];
    }
  }

  async getByClassId(classId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          FieldName: "class_id_c",
          Operator: "EqualTo",
          Values: [parseInt(classId)],
          Include: true
        }],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance by class:", response.message);
        return [];
      }

      return (response.data || []).map(attendance => ({
        Id: attendance.Id,
        studentId: attendance.student_id_c?.Id || attendance.student_id_c || null,
        classId: attendance.class_id_c?.Id || attendance.class_id_c || null,
        date: attendance.date_c || "",
        status: attendance.status_c || "",
        notes: attendance.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching attendance by class:", error);
      return [];
    }
  }

  async getByDate(date) {
    try {
      const targetDate = new Date(date).toISOString().split('T')[0];
      
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          FieldName: "date_c",
          Operator: "StartsWith",
          Values: [targetDate],
          Include: true
        }],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch attendance by date:", response.message);
        return [];
      }

      return (response.data || []).map(attendance => ({
        Id: attendance.Id,
        studentId: attendance.student_id_c?.Id || attendance.student_id_c || null,
        classId: attendance.class_id_c?.Id || attendance.class_id_c || null,
        date: attendance.date_c || "",
        status: attendance.status_c || "",
        notes: attendance.notes_c || ""
      }));
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      return [];
    }
  }

  async create(attendanceData) {
    try {
      const params = {
        records: [{
          Name: `Attendance - ${new Date(attendanceData.date).toLocaleDateString()}`,
          student_id_c: parseInt(attendanceData.studentId),
          class_id_c: parseInt(attendanceData.classId),
          date_c: attendanceData.date || new Date().toISOString(),
          status_c: attendanceData.status || "present",
          notes_c: attendanceData.notes || ""
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create attendance:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create attendance:`, failed);
          const errorMsg = failed[0].message || "Failed to create attendance";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            studentId: created.student_id_c?.Id || created.student_id_c || null,
            classId: created.class_id_c?.Id || created.class_id_c || null,
            date: created.date_c || "",
            status: created.status_c || "",
            notes: created.notes_c || ""
          };
        }
      }
      
      throw new Error("No attendance record created");
    } catch (error) {
      console.error("Error creating attendance:", error);
      throw error;
    }
  }

  async update(id, attendanceData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `Attendance - ${new Date(attendanceData.date).toLocaleDateString()}`,
          student_id_c: parseInt(attendanceData.studentId),
          class_id_c: parseInt(attendanceData.classId),
          date_c: attendanceData.date,
          status_c: attendanceData.status,
          notes_c: attendanceData.notes || ""
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update attendance:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update attendance:`, failed);
          const errorMsg = failed[0].message || "Failed to update attendance";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            studentId: updated.student_id_c?.Id || updated.student_id_c || null,
            classId: updated.class_id_c?.Id || updated.class_id_c || null,
            date: updated.date_c || "",
            status: updated.status_c || "",
            notes: updated.notes_c || ""
          };
        }
      }
      
      throw new Error("No attendance record updated");
    } catch (error) {
      console.error("Error updating attendance:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to delete attendance:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete attendance:`, failed);
          const errorMsg = failed[0].message || "Failed to delete attendance";
          throw new Error(errorMsg);
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      throw error;
    }
  }
}

export default new AttendanceService();