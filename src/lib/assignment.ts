import { Registration, StudentGrade, ClassGroup } from '../types';

export function assignClasses(
  approvedStudents: Registration[],
  gradeSettings: { [key: number]: number }
): { registrations: Registration[], classes: ClassGroup[] } {
  const updatedRegistrations: Registration[] = [];
  const generatedClasses: ClassGroup[] = [];

  const grades: StudentGrade[] = [10, 11, 12];

  grades.forEach(grade => {
    const studentsInGrade = approvedStudents.filter(s => s.promoted_grade === grade);
    if (studentsInGrade.length === 0) return;

    const studentsPerClass = gradeSettings[grade] || 60;
    
    // Sort students by average descending
    const sortedStudents = [...studentsInGrade].sort((a, b) => b.average - a.average);

    // 1. Create Special Class "A" (Top students)
    const specialClassSize = Math.min(studentsPerClass, sortedStudents.length);
    const specialClassStudents = sortedStudents.slice(0, specialClassSize);
    const remainingStudents = sortedStudents.slice(specialClassSize);

    const specialClassName = `${grade}A`;
    specialClassStudents.forEach(s => {
      updatedRegistrations.push({ ...s, class_assignment: specialClassName });
    });

    generatedClasses.push({
      id: `${grade}-A`,
      grade,
      class_name: specialClassName,
      class_type: 'Special',
      total_students: specialClassStudents.length
    });

    // 2. Distribute remaining students into B, C, D... with gender balance
    if (remainingStudents.length > 0) {
      const numRemainingClasses = Math.ceil(remainingStudents.length / studentsPerClass);
      const classes: Registration[][] = Array.from({ length: numRemainingClasses }, () => []);
      
      const males = remainingStudents.filter(s => s.sex === 'Male');
      const females = remainingStudents.filter(s => s.sex === 'Female');

      // Interleave males and females for balance
      const interleaved: Registration[] = [];
      const maxLength = Math.max(males.length, females.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < males.length) interleaved.push(males[i]);
        if (i < females.length) interleaved.push(females[i]);
      }

      // Distribute into classes
      interleaved.forEach((student, index) => {
        const classIndex = index % numRemainingClasses;
        classes[classIndex].push(student);
      });

      classes.forEach((classStudents, index) => {
        const letter = String.fromCharCode(66 + index); // B, C, D...
        const className = `${grade}${letter}`;
        
        classStudents.forEach(s => {
          updatedRegistrations.push({ ...s, class_assignment: className });
        });

        generatedClasses.push({
          id: `${grade}-${letter}`,
          grade,
          class_name: className,
          class_type: 'Regular',
          total_students: classStudents.length
        });
      });
    }
  });

  return { registrations: updatedRegistrations, classes: generatedClasses };
}
