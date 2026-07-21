export interface ClassTeacherSummary {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
}

export interface Grade {
  id: number;
  className: string;
  level: number;
  classTeacherId?: number | null;
  classTeacher?: ClassTeacherSummary | string | null;
}

export interface CreateGradeRequest {
  className: string;
  level: number;
  classTeacherId?: number | null;
}

export interface UpdateGradeRequest {
  className: string;
  level: number;
  classTeacherId?: number | null;
}
