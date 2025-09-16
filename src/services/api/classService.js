import classesData from "@/services/mockData/classes.json";

class ClassService {
  constructor() {
    this.classes = [...classesData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.classes];
  }

  async getById(id) {
    await this.delay(200);
    const classItem = this.classes.find(c => c.Id === parseInt(id));
    if (!classItem) {
      throw new Error("Class not found");
    }
    return { ...classItem };
  }

  async create(classData) {
    await this.delay(400);
    const newId = Math.max(...this.classes.map(c => c.Id)) + 1;
    const newClass = {
      ...classData,
      Id: newId,
      studentIds: classData.studentIds || []
    };
    
    this.classes.push(newClass);
    return { ...newClass };
  }

  async update(id, classData) {
    await this.delay(400);
    const index = this.classes.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    this.classes[index] = { ...this.classes[index], ...classData };
    return { ...this.classes[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.classes.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Class not found");
    }
    
    this.classes.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new ClassService();