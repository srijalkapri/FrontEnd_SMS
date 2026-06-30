export interface ClassTeacherSummary {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
}

export interface Grade {
  id: number;
  className: string;
  classTeacherId?: number | null;
  classTeacher?: ClassTeacherSummary | string | null;
}

export interface CreateGradeRequest {
  className: string;
  classTeacherId?: number | null;
}

export interface UpdateGradeRequest {
  className: string;
  classTeacherId?: number | null;
}
