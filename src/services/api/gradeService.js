class GradeService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'grade_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "student_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "class_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch grades:", response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      return (response.data || []).map(grade => ({
        Id: grade.Id,
        assignmentName: grade.assignment_name_c || "",
        category: grade.category_c || "",
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        date: grade.date_c || new Date().toISOString(),
        studentId: grade.student_id_c?.Id || grade.student_id_c || null,
        classId: grade.class_id_c?.Id || grade.class_id_c || null
      }));
    } catch (error) {
      console.error("Error fetching grades:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "student_id_c", "referenceField": {"field": {"Name": "Name"}}}},
          {"field": {"Name": "class_id_c", "referenceField": {"field": {"Name": "Name"}}}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Grade not found");
      }

      const grade = response.data;
      return {
        Id: grade.Id,
        assignmentName: grade.assignment_name_c || "",
        category: grade.category_c || "",
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        date: grade.date_c || "",
        studentId: grade.student_id_c?.Id || grade.student_id_c || null,
        classId: grade.class_id_c?.Id || grade.class_id_c || null
      };
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error);
      throw error;
    }
  }

  async getByStudentId(studentId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}}
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
        console.error("Failed to fetch grades by student:", response.message);
        return [];
      }

      return (response.data || []).map(grade => ({
        Id: grade.Id,
        assignmentName: grade.assignment_name_c || "",
        category: grade.category_c || "",
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        date: grade.date_c || "",
        studentId: grade.student_id_c?.Id || grade.student_id_c || null,
        classId: grade.class_id_c?.Id || grade.class_id_c || null
      }));
    } catch (error) {
      console.error("Error fetching grades by student:", error);
      return [];
    }
  }

  async getByClassId(classId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "assignment_name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "points_c"}},
          {"field": {"Name": "max_points_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "class_id_c"}}
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
        console.error("Failed to fetch grades by class:", response.message);
        return [];
      }

      return (response.data || []).map(grade => ({
        Id: grade.Id,
        assignmentName: grade.assignment_name_c || "",
        category: grade.category_c || "",
        points: grade.points_c || 0,
        maxPoints: grade.max_points_c || 0,
        date: grade.date_c || "",
        studentId: grade.student_id_c?.Id || grade.student_id_c || null,
        classId: grade.class_id_c?.Id || grade.class_id_c || null
      }));
    } catch (error) {
      console.error("Error fetching grades by class:", error);
      return [];
    }
  }

  async create(gradeData) {
    try {
      const params = {
        records: [{
          Name: gradeData.assignmentName,
          assignment_name_c: gradeData.assignmentName,
          category_c: gradeData.category,
          points_c: parseInt(gradeData.points),
          max_points_c: parseInt(gradeData.maxPoints),
          date_c: gradeData.date || new Date().toISOString(),
          student_id_c: parseInt(gradeData.studentId),
          class_id_c: parseInt(gradeData.classId)
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create grade:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create grade:`, failed);
          const errorMsg = failed[0].message || "Failed to create grade";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            assignmentName: created.assignment_name_c || "",
            category: created.category_c || "",
            points: created.points_c || 0,
            maxPoints: created.max_points_c || 0,
            date: created.date_c || "",
            studentId: created.student_id_c?.Id || created.student_id_c || null,
            classId: created.class_id_c?.Id || created.class_id_c || null
          };
        }
      }
      
      throw new Error("No grade created");
    } catch (error) {
      console.error("Error creating grade:", error);
      throw error;
    }
  }

  async update(id, gradeData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: gradeData.assignmentName,
          assignment_name_c: gradeData.assignmentName,
          category_c: gradeData.category,
          points_c: parseInt(gradeData.points),
          max_points_c: parseInt(gradeData.maxPoints),
          date_c: gradeData.date,
          student_id_c: parseInt(gradeData.studentId),
          class_id_c: parseInt(gradeData.classId)
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update grade:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update grade:`, failed);
          const errorMsg = failed[0].message || "Failed to update grade";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            assignmentName: updated.assignment_name_c || "",
            category: updated.category_c || "",
            points: updated.points_c || 0,
            maxPoints: updated.max_points_c || 0,
            date: updated.date_c || "",
            studentId: updated.student_id_c?.Id || updated.student_id_c || null,
            classId: updated.class_id_c?.Id || updated.class_id_c || null
          };
        }
      }
      
      throw new Error("No grade updated");
    } catch (error) {
      console.error("Error updating grade:", error);
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
        console.error("Failed to delete grade:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete grade:`, failed);
          const errorMsg = failed[0].message || "Failed to delete grade";
          throw new Error(errorMsg);
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting grade:", error);
      throw error;
    }
  }
}

export default new GradeService();
export default new GradeService();