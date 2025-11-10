export type ComponentType =
  | 'text'
  | 'number'
  | 'email'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'dropdown'
  | 'file'
  | 'toggle'
  | 'slider'
  | 'section'
  | 'table';

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty';

export interface ConditionalRule {
  id: string;
  fieldId: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'regex' | 'email' | 'url';
  value?: string | number;
  message?: string;
}

export interface TableColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'checkbox';
  options?: string[];
}

export interface FormComponent {
  id: string;
  type: ComponentType;
  label: string;
  fieldId?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string | number | boolean;
  validationRules: ValidationRule[];
  conditionalRules: ConditionalRule[];
  sectionId?: string;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  columns?: TableColumn[];
  rows?: number;
}

export interface FormSection {
  id: string;
  name: string;
  collapsed: boolean;
  isReusable: boolean;
  components: FormComponent[];
  conditionalRules: ConditionalRule[];
}

export interface FormTemplate {
  formId: string;
  formName: string;
  description?: string;
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

export interface FormValues {
  [key: string]: string | number | boolean | File | null;
}

export interface OutputFormat {
  type: 'json' | 'xml' | 'xsd';
  content: string;
}
