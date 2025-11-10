import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormStore } from '../store/formStore';
import { FormValues, FormComponent, FormTemplate, FormSection } from '../types/form';
import FormComponentRenderer from '../components/FormComponentRenderer';
import SubmissionOutputModal from '../components/SubmissionOutputModal';
import { ChevronDown, ChevronRight, FileText, ArrowLeft, FileEdit } from 'lucide-react';
import Header from '../components/Header';

export default function FormFiller() {
  const { getAllTemplates } = useFormStore();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showOutput, setShowOutput] = useState(false);

  const templates = getAllTemplates();

  const handleValueChange = (componentId: string, value: string | number | boolean | File | null) => {
    setFormValues((prev) => ({ ...prev, [componentId]: value }));
    if (errors[componentId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[componentId];
        return newErrors;
      });
    }
  };

  const evaluateCondition = (component: FormComponent): boolean => {
    if (component.conditionalRules.length === 0) {
      return true;
    }

    return component.conditionalRules.every((rule) => {
      const fieldValue = formValues[rule.fieldId];

      switch (rule.operator) {
        case 'equals':
          return fieldValue == rule.value;
        case 'notEquals':
          return fieldValue != rule.value;
        case 'contains':
          return String(fieldValue || '').includes(String(rule.value));
        case 'greaterThan':
          return Number(fieldValue) > Number(rule.value);
        case 'lessThan':
          return Number(fieldValue) < Number(rule.value);
        case 'isEmpty':
          return !fieldValue || fieldValue === '';
        case 'isNotEmpty':
          return !!fieldValue && fieldValue !== '';
        default:
          return true;
      }
    });
  };

  const evaluateSectionCondition = (section: FormSection): boolean => {
    if (!section.conditionalRules || section.conditionalRules.length === 0) {
      return true;
    }

    return section.conditionalRules.every((rule) => {
      const fieldValue = formValues[rule.fieldId];

      switch (rule.operator) {
        case 'equals':
          return fieldValue == rule.value;
        case 'notEquals':
          return fieldValue != rule.value;
        case 'contains':
          return String(fieldValue || '').includes(String(rule.value));
        case 'greaterThan':
          return Number(fieldValue) > Number(rule.value);
        case 'lessThan':
          return Number(fieldValue) < Number(rule.value);
        case 'isEmpty':
          return !fieldValue || fieldValue === '';
        case 'isNotEmpty':
          return !!fieldValue && fieldValue !== '';
        default:
          return true;
      }
    });
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const validateField = (component: FormComponent, value: string | number | boolean | File | null): string | null => {
    for (const rule of component.validationRules) {
      switch (rule.type) {
        case 'required':
          if (!value || value === '') {
            return rule.message || 'This field is required';
          }
          break;
        case 'minLength':
          if (String(value).length < (rule.value as number)) {
            return rule.message || `Minimum length is ${rule.value}`;
          }
          break;
        case 'maxLength':
          if (String(value).length > (rule.value as number)) {
            return rule.message || `Maximum length is ${rule.value}`;
          }
          break;
        case 'min':
          if (Number(value) < (rule.value as number)) {
            return rule.message || `Minimum value is ${rule.value}`;
          }
          break;
        case 'max':
          if (Number(value) > (rule.value as number)) {
            return rule.message || `Maximum value is ${rule.value}`;
          }
          break;
        case 'regex':
          const regex = new RegExp(rule.value as string);
          if (!regex.test(String(value))) {
            return rule.message || 'Invalid format';
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            return rule.message || 'Invalid email address';
          }
          break;
        case 'url':
          try {
            new URL(String(value));
          } catch {
            return rule.message || 'Invalid URL';
          }
          break;
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) return;

    const newErrors: Record<string, string> = {};

    selectedTemplate.sections.forEach((section) => {
      if (!evaluateSectionCondition(section)) return;

      section.components.forEach((component) => {
        if (evaluateCondition(component)) {
          const error = validateField(component, formValues[component.id]);
          if (error) {
            newErrors[component.id] = error;
          }
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setShowOutput(true);
  };

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template);

    const defaultValues: FormValues = {};
    template.sections.forEach((section) => {
      section.components.forEach((component) => {
        if (component.defaultValue !== undefined && component.defaultValue !== null && component.defaultValue !== '') {
          defaultValues[component.id] = component.defaultValue;
        }
      });
    });

    setFormValues(defaultValues);
    setErrors({});
    setCollapsedSections(new Set());
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
    setFormValues({});
    setErrors({});
    setCollapsedSections(new Set());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header/>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          {selectedTemplate && (
            <span className="text-xl font-medium text-card-foreground">{selectedTemplate.formName}</span>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <FileEdit size={16} />
          Template Builder
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted/30">
        {!selectedTemplate ? (
          <div className="max-w-5xl mx-auto p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-card-foreground mb-2">Select a Form Template</h2>
              <p className="text-muted-foreground">Choose a template to fill out</p>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No templates available</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Go to Template Builder to create forms
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  Go to Template Builder
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                  <div
                    key={template.formId}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-5 bg-card rounded-lg border border-border hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      {template.formName}
                    </h3>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {formatDate(template.createdAt)}</span>
                      <span>{template.sections.length} sections</span>
                      <span>
                        {template.sections.reduce((acc, s) => acc + s.components.length, 0)} fields
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-6">
            <button
              onClick={handleBackToTemplates}
              className="mb-4 px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Templates
            </button>

            <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
              <h1 className="text-2xl font-bold text-card-foreground">{selectedTemplate.formName}</h1>
              {selectedTemplate.description && (
                <p className="text-sm text-muted-foreground mt-2">{selectedTemplate.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedTemplate.sections.map((section) => {
                const isSectionVisible = evaluateSectionCondition(section);

                if (!isSectionVisible) return null;

                return (
                  <div
                    key={section.id}
                    className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
                  >
                  <div className="flex items-center justify-between p-4 bg-secondary/50 border-b border-border">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-secondary rounded transition-colors"
                      >
                        {collapsedSections.has(section.id) ? (
                          <ChevronRight size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                      <h3 className="font-semibold text-card-foreground">{section.name}</h3>
                    </div>
                  </div>

                  {!collapsedSections.has(section.id) && (
                    <div className="p-6 space-y-4">
                      {section.components.map((component) => {
                        const isVisible = evaluateCondition(component);

                        if (!isVisible) return null;

                        return (
                          <div
                            key={component.id}
                            className="transition-all duration-300 ease-in-out"
                          >
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                              {component.label}
                              {component.required && <span className="text-destructive ml-1">*</span>}
                            </label>
                            <FormComponentRenderer
                              component={component}
                              value={formValues[component.id]}
                              onChange={(value) => handleValueChange(component.id, value)}
                            />
                            {errors[component.id] && (
                              <p className="text-sm text-destructive mt-1">{errors[component.id]}</p>
                            )}
                          </div>
                        );
                      })}

                      {section.components.filter((c) => evaluateCondition(c)).length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No visible fields in this section
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormValues({});
                    setErrors({});
                  }}
                  className="px-6 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  Submit Form
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showOutput && selectedTemplate && (
        <SubmissionOutputModal
          formData={formValues}
          components={selectedTemplate.sections.flatMap((s) => s.components)}
          onClose={() => setShowOutput(false)}
        />
      )}
    </div>
  );
}
