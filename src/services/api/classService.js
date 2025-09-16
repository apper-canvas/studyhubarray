class ClassService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'class_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "student_ids_c"}},
          {"field": {"Name": "schedule_days_c"}},
          {"field": {"Name": "schedule_time_c"}},
          {"field": {"Name": "schedule_room_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch classes:", response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      return (response.data || []).map(classItem => ({
        Id: classItem.Id,
        name: classItem.name_c || "",
        subject: classItem.subject_c || "",
        semester: classItem.semester_c || "",
        studentIds: this.parseTagField(classItem.student_ids_c) || [],
        schedule: {
          days: classItem.schedule_days_c || "",
          time: classItem.schedule_time_c || "",
          room: classItem.schedule_room_c || ""
        }
      }));
    } catch (error) {
      console.error("Error fetching classes:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "semester_c"}},
          {"field": {"Name": "student_ids_c"}},
          {"field": {"Name": "schedule_days_c"}},
          {"field": {"Name": "schedule_time_c"}},
          {"field": {"Name": "schedule_room_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Class not found");
      }

      const classItem = response.data;
      return {
        Id: classItem.Id,
        name: classItem.name_c || "",
        subject: classItem.subject_c || "",
        semester: classItem.semester_c || "",
        studentIds: this.parseTagField(classItem.student_ids_c) || [],
        schedule: {
          days: classItem.schedule_days_c || "",
          time: classItem.schedule_time_c || "",
          room: classItem.schedule_room_c || ""
        }
      };
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      throw error;
    }
  }

  async create(classData) {
    try {
      const params = {
        records: [{
          Name: classData.name,
          name_c: classData.name,
          subject_c: classData.subject,
          semester_c: classData.semester,
          student_ids_c: this.formatTagField(classData.studentIds || []),
          schedule_days_c: classData.schedule?.days || "",
          schedule_time_c: classData.schedule?.time || "",
          schedule_room_c: classData.schedule?.room || ""
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create class:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create class:`, failed);
          const errorMsg = failed[0].message || "Failed to create class";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            name: created.name_c || "",
            subject: created.subject_c || "",
            semester: created.semester_c || "",
            studentIds: this.parseTagField(created.student_ids_c) || [],
            schedule: {
              days: created.schedule_days_c || "",
              time: created.schedule_time_c || "",
              room: created.schedule_room_c || ""
            }
          };
        }
      }
      
      throw new Error("No class created");
    } catch (error) {
      console.error("Error creating class:", error);
      throw error;
    }
  }

  async update(id, classData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: classData.name,
          name_c: classData.name,
          subject_c: classData.subject,
          semester_c: classData.semester,
          student_ids_c: this.formatTagField(classData.studentIds || []),
          schedule_days_c: classData.schedule?.days || "",
          schedule_time_c: classData.schedule?.time || "",
          schedule_room_c: classData.schedule?.room || ""
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update class:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update class:`, failed);
          const errorMsg = failed[0].message || "Failed to update class";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            name: updated.name_c || "",
            subject: updated.subject_c || "",
            semester: updated.semester_c || "",
            studentIds: this.parseTagField(updated.student_ids_c) || [],
            schedule: {
              days: updated.schedule_days_c || "",
              time: updated.schedule_time_c || "",
              room: updated.schedule_room_c || ""
            }
          };
        }
      }
      
      throw new Error("No class updated");
    } catch (error) {
      console.error("Error updating class:", error);
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
        console.error("Failed to delete class:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete class:`, failed);
          const errorMsg = failed[0].message || "Failed to delete class";
          throw new Error(errorMsg);
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  }

  // Helper methods for Tag field handling
  parseTagField(tagString) {
    if (!tagString) return [];
    return tagString.split(',').map(item => {
      const id = parseInt(item.trim());
      return isNaN(id) ? null : id;
    }).filter(id => id !== null);
  }

  formatTagField(tagArray) {
    if (!Array.isArray(tagArray)) return "";
    return tagArray.map(id => id.toString()).join(',');
  }
}

export default new ClassService();