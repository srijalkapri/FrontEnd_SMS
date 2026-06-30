export function getSubjectTypeLabel(isOptional: boolean): string {
  return isOptional ? 'Optional' : 'Compulsory';
}

export type SubjectTypeFilter = 'all' | 'compulsory' | 'optional';
