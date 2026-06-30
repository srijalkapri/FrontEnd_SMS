export interface Subject {
  id: number;
  name: string;
}

export interface CreateSubjectRequest {
  name: string;
}

export interface UpdateSubjectRequest {
  name: string;
}
