export interface FieldValues {
  [key: string]: string | number | boolean | object;
}

export interface WorkItem {
  id: string;
  fields: string[];
}
