import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { FormValues, FormComponent, FormSection } from '../types/form';
import FormComponentRenderer from './FormComponentRenderer';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function PreviewMode() {
  const { currentForm } = useFormStore();
  const [formValues, setFormValues] = useState<FormValues>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  if (!currentForm) {
    return null;
  }

  const handleValueChange = (componentId: string, value: string | number | boolean | File | null) => {
    setFormValues((prev) => ({ ...prev, [componentId]: value }));
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

    const errors: Record<string, string> = {};

    currentForm.sections.forEach((section) => {
      if (!evaluateSectionCondition(section)) return;

      section.components.forEach((component) => {
        if (evaluateCondition(component)) {
          const error = validateField(component, formValues[component.id]);
          if (error) {
            errors[component.id] = error;
          }
        }
      });
    });

    if (Object.keys(errors).length > 0) {
      alert('Please fix the validation errors:\n' + Object.values(errors).join('\n'));
      return;
    }

    console.log('Form submitted:', formValues);
    alert('Form submitted successfully! Check console for values.');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">{currentForm.formName}</h1>
          {currentForm.description && (
            <p className="text-sm text-muted-foreground mt-2">{currentForm.description}</p>
          )}
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
            <p className="text-sm text-card-foreground">
              <strong>Preview Mode:</strong> Fill out the form to test conditional logic and validation.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentForm.sections.map((section) => {
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
                  {section.isReusable && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Reusable
                    </span>
                  )}
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
                        {component.conditionalRules.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            This field has conditional logic applied
                          </p>
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
              onClick={() => setFormValues({})}
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
    </div>
  );
}
