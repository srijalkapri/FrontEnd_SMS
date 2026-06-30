export interface PromotionRequest {
  fromGradeId: number;
  toGradeId: number;
  studentIds?: number[];
}

export interface SkippedStudent {
  studentId: number;
  reason?: string;
}

export interface PromotionResult {
  promotedCount: number;
  skippedCount: number;
  skippedStudents: SkippedStudent[];
}
