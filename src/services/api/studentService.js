import studentsData from "@/services/mockData/students.json";

class StudentService {
  constructor() {
    this.students = [...studentsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.students];
  }

  async getById(id) {
    await this.delay(200);
    const student = this.students.find(s => s.Id === parseInt(id));
    if (!student) {
      throw new Error("Student not found");
    }
    return { ...student };
  }

  async create(studentData) {
    await this.delay(400);
    const newId = Math.max(...this.students.map(s => s.Id)) + 1;
const newStudent = {
      ...studentData,
      Id: newId,
      studentId: studentData.studentId || `STU-${Date.now()}`,
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString(),
      department: studentData.department || "Computer Science"
    };
    
    this.students.push(newStudent);
    return { ...newStudent };
  }

  async update(id, studentData) {
    await this.delay(400);
    const index = this.students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    this.students[index] = { ...this.students[index], ...studentData };
    return { ...this.students[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.students.findIndex(s => s.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Student not found");
    }
    
    this.students.splice(index, 1);
    return true;
  }

  async searchStudents(query) {
    await this.delay(200);
const lowercaseQuery = query.toLowerCase();
    return this.students.filter(student =>
      student.firstName.toLowerCase().includes(lowercaseQuery) ||
      student.lastName.toLowerCase().includes(lowercaseQuery) ||
      student.email.toLowerCase().includes(lowercaseQuery) ||
      student.studentId.toLowerCase().includes(lowercaseQuery) ||
      student.department.toLowerCase().includes(lowercaseQuery)
    );
  }

async getStudentsByClass(classId) {
    await this.delay(200);
    return this.students.filter(student => 
      student.classIds.includes(parseInt(classId))
    );
  }

  async getGradeLevels() {
    await this.delay(100);
    return [
      { value: "Elementary", label: "Elementary" },
      { value: "Middle School", label: "Middle School" },
      { value: "High School", label: "High School" }
    ];
  }

  async getSubjects() {
    await this.delay(100);
    // In a real app, this would come from the classes service
    return [
      { value: "Mathematics", label: "Mathematics" },
      { value: "English", label: "English" },
      { value: "Science", label: "Science" },
      { value: "History", label: "History" },
      { value: "PE", label: "PE" }
    ];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new StudentService();