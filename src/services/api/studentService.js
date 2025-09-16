class StudentService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'student_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "class_ids_c"}},
          {"field": {"Name": "parent_contact_name_c"}},
          {"field": {"Name": "parent_contact_email_c"}},
          {"field": {"Name": "parent_contact_phone_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch students:", response.message);
        throw new Error(response.message);
      }

      // Transform database fields to UI format
      return (response.data || []).map(student => ({
        Id: student.Id,
        firstName: student.first_name_c || "",
        lastName: student.last_name_c || "",
        studentId: student.student_id_c || "",
        email: student.email_c || "",
        phone: student.phone_c || "",
        enrollmentDate: student.enrollment_date_c || new Date().toISOString(),
        status: student.status_c || "active",
        department: student.department_c || "",
        classIds: this.parseTagField(student.class_ids_c) || [],
        parentContact: {
          name: student.parent_contact_name_c || "",
          email: student.parent_contact_email_c || "",
          phone: student.parent_contact_phone_c || ""
        }
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "class_ids_c"}},
          {"field": {"Name": "parent_contact_name_c"}},
          {"field": {"Name": "parent_contact_email_c"}},
          {"field": {"Name": "parent_contact_phone_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error("Student not found");
      }

      const student = response.data;
      return {
        Id: student.Id,
        firstName: student.first_name_c || "",
        lastName: student.last_name_c || "",
        studentId: student.student_id_c || "",
        email: student.email_c || "",
        phone: student.phone_c || "",
        enrollmentDate: student.enrollment_date_c || new Date().toISOString(),
        status: student.status_c || "active",
        department: student.department_c || "",
        classIds: this.parseTagField(student.class_ids_c) || [],
        parentContact: {
          name: student.parent_contact_name_c || "",
          email: student.parent_contact_email_c || "",
          phone: student.parent_contact_phone_c || ""
        }
      };
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  }

  async create(studentData) {
    try {
      const params = {
        records: [{
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName,
          last_name_c: studentData.lastName,
          student_id_c: studentData.studentId || `STU-${Date.now()}`,
          email_c: studentData.email,
          phone_c: studentData.phone || "",
          enrollment_date_c: studentData.enrollmentDate || new Date().toISOString(),
          status_c: studentData.status || "active",
          department_c: studentData.department || "",
          class_ids_c: this.formatTagField(studentData.classIds || []),
          parent_contact_name_c: studentData.parentContact?.name || "",
          parent_contact_email_c: studentData.parentContact?.email || "",
          parent_contact_phone_c: studentData.parentContact?.phone || ""
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to create student:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create student:`, failed);
          const errorMsg = failed[0].message || "Failed to create student";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            firstName: created.first_name_c || "",
            lastName: created.last_name_c || "",
            studentId: created.student_id_c || "",
            email: created.email_c || "",
            phone: created.phone_c || "",
            enrollmentDate: created.enrollment_date_c || "",
            status: created.status_c || "",
            department: created.department_c || "",
            classIds: this.parseTagField(created.class_ids_c) || [],
            parentContact: {
              name: created.parent_contact_name_c || "",
              email: created.parent_contact_email_c || "",
              phone: created.parent_contact_phone_c || ""
            }
          };
        }
      }
      
      throw new Error("No student created");
    } catch (error) {
      console.error("Error creating student:", error);
      throw error;
    }
  }

  async update(id, studentData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${studentData.firstName} ${studentData.lastName}`,
          first_name_c: studentData.firstName,
          last_name_c: studentData.lastName,
          student_id_c: studentData.studentId,
          email_c: studentData.email,
          phone_c: studentData.phone || "",
          enrollment_date_c: studentData.enrollmentDate,
          status_c: studentData.status,
          department_c: studentData.department || "",
          class_ids_c: this.formatTagField(studentData.classIds || []),
          parent_contact_name_c: studentData.parentContact?.name || "",
          parent_contact_email_c: studentData.parentContact?.email || "",
          parent_contact_phone_c: studentData.parentContact?.phone || ""
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to update student:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update student:`, failed);
          const errorMsg = failed[0].message || "Failed to update student";
          throw new Error(errorMsg);
        }
        
        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            firstName: updated.first_name_c || "",
            lastName: updated.last_name_c || "",
            studentId: updated.student_id_c || "",
            email: updated.email_c || "",
            phone: updated.phone_c || "",
            enrollmentDate: updated.enrollment_date_c || "",
            status: updated.status_c || "",
            department: updated.department_c || "",
            classIds: this.parseTagField(updated.class_ids_c) || [],
            parentContact: {
              name: updated.parent_contact_name_c || "",
              email: updated.parent_contact_email_c || "",
              phone: updated.parent_contact_phone_c || ""
            }
          };
        }
      }
      
      throw new Error("No student updated");
    } catch (error) {
      console.error("Error updating student:", error);
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
        console.error("Failed to delete student:", response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete student:`, failed);
          const errorMsg = failed[0].message || "Failed to delete student";
          throw new Error(errorMsg);
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  }

  async searchStudents(query) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "department_c"}},
          {"field": {"Name": "class_ids_c"}}
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [{
            conditions: [
              {fieldName: "first_name_c", operator: "Contains", values: [query]},
              {fieldName: "last_name_c", operator: "Contains", values: [query]},
              {fieldName: "email_c", operator: "Contains", values: [query]},
              {fieldName: "student_id_c", operator: "Contains", values: [query]},
              {fieldName: "department_c", operator: "Contains", values: [query]}
            ],
            operator: "OR"
          }]
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to search students:", response.message);
        return [];
      }

      return (response.data || []).map(student => ({
        Id: student.Id,
        firstName: student.first_name_c || "",
        lastName: student.last_name_c || "",
        studentId: student.student_id_c || "",
        email: student.email_c || "",
        phone: student.phone_c || "",
        enrollmentDate: student.enrollment_date_c || "",
        status: student.status_c || "",
        department: student.department_c || "",
        classIds: this.parseTagField(student.class_ids_c) || []
      }));
    } catch (error) {
      console.error("Error searching students:", error);
      return [];
    }
  }

  async getStudentsByClass(classId) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "class_ids_c"}}
        ],
        where: [{
          FieldName: "class_ids_c",
          Operator: "Contains", 
          Values: [classId.toString()],
          Include: true
        }]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Failed to fetch students by class:", response.message);
        return [];
      }

      return (response.data || []).map(student => ({
        Id: student.Id,
        firstName: student.first_name_c || "",
        lastName: student.last_name_c || "",
        studentId: student.student_id_c || "",
        email: student.email_c || "",
        classIds: this.parseTagField(student.class_ids_c) || []
      }));
    } catch (error) {
      console.error("Error fetching students by class:", error);
      return [];
    }
  }

  async getGradeLevels() {
    return [
      { value: "Elementary", label: "Elementary" },
      { value: "Middle School", label: "Middle School" },
      { value: "High School", label: "High School" }
    ];
  }

  async getSubjects() {
    return [
      { value: "Mathematics", label: "Mathematics" },
      { value: "English", label: "English" },
      { value: "Science", label: "Science" },
      { value: "History", label: "History" },
      { value: "PE", label: "PE" }
    ];
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

export default new StudentService();
export default new StudentService();