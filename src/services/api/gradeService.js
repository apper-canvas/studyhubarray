import gradesData from "@/services/mockData/grades.json";

class GradeService {
  constructor() {
    this.grades = [...gradesData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.grades];
  }

  async getById(id) {
    await this.delay(200);
    const grade = this.grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade not found");
    }
    return { ...grade };
  }

  async getByStudentId(studentId) {
    await this.delay(200);
    return this.grades.filter(grade => grade.studentId === parseInt(studentId));
  }

  async getByClassId(classId) {
    await this.delay(200);
    return this.grades.filter(grade => grade.classId === parseInt(classId));
  }

  async create(gradeData) {
    await this.delay(400);
    const newId = Math.max(...this.grades.map(g => g.Id)) + 1;
    const newGrade = {
      ...gradeData,
      Id: newId,
      date: gradeData.date || new Date().toISOString()
    };
    
    this.grades.push(newGrade);
    return { ...newGrade };
  }

  async update(id, gradeData) {
    await this.delay(400);
    const index = this.grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    this.grades[index] = { ...this.grades[index], ...gradeData };
    return { ...this.grades[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    
    this.grades.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new GradeService();