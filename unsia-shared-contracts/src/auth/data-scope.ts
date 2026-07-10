export const DataScopes = {
  GLOBAL: 'global',
  MODULE_DOMAIN: 'module_domain',
  STUDY_PROGRAM: 'study_program',
  ASSIGNED_CLASS: 'assigned_class',
  ADVISOR: 'advisor',
  SELF: 'self',
  AGENT: 'agent',
  READ_ONLY_AGGREGATE: 'read_only_aggregate',
  TECHNICAL: 'technical',
} as const;

export type DataScope = typeof DataScopes[keyof typeof DataScopes];
