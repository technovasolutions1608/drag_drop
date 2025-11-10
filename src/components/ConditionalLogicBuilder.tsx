import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { FormComponent, ConditionalRule, ConditionOperator } from '../types/form';

interface ConditionalLogicBuilderProps {
  component: FormComponent;
  onClose: () => void;
}

export default function ConditionalLogicBuilder({
  component,
  onClose,
}: ConditionalLogicBuilderProps) {
  const { currentForm, updateComponent } = useFormStore();
  const [rules, setRules] = useState<ConditionalRule[]>(component.conditionalRules || []);

  const availableFields = currentForm?.sections
    .flatMap((s) => s.components)
    .filter((c) => c.id !== component.id && c.type !== 'section') || [];

  const handleAddRule = () => {
    const newRule: ConditionalRule = {
      id: `R${Date.now()}`,
      fieldId: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
    };
    setRules([...rules, newRule]);
  };

  const handleUpdateRule = (index: number, updates: Partial<ConditionalRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateComponent(component.id, { conditionalRules: rules });
    onClose();
  };

  const getFieldLabel = (fieldId: string) => {
    const field = availableFields.find((f) => f.id === fieldId);
    return field?.label || 'Unknown Field';
  };

  const operatorLabels: Record<ConditionOperator, string> = {
    equals: 'Equals',
    notEquals: 'Not Equals',
    contains: 'Contains',
    greaterThan: 'Greater Than',
    lessThan: 'Less Than',
    isEmpty: 'Is Empty',
    isNotEmpty: 'Is Not Empty',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Conditional Logic</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 p-3 bg-secondary/30 rounded-md border border-border">
            <p className="text-sm text-card-foreground">
              <strong>Component:</strong> {component.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This component will be shown only when ALL conditions below are met.
            </p>
          </div>

          {availableFields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No other fields available for conditional logic.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="p-4 bg-secondary/20 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          When Field
                        </label>
                        <select
                          value={rule.fieldId}
                          onChange={(e) => handleUpdateRule(index, { fieldId: e.target.value })}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {availableFields.map((field) => (
                            <option key={field.id} value={field.id}>
                              {field.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Operator
                        </label>
                        <select
                          value={rule.operator}
                          onChange={(e) =>
                            handleUpdateRule(index, { operator: e.target.value as ConditionOperator })
                          }
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {Object.entries(operatorLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!['isEmpty', 'isNotEmpty'].includes(rule.operator) && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Value
                          </label>
                          <input
                            type="text"
                            value={rule.value as string}
                            onChange={(e) => handleUpdateRule(index, { value: e.target.value })}
                            placeholder="Enter value"
                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground bg-primary/5 p-2 rounded">
                        <strong>Preview:</strong> Show "{component.label}" when "
                        {getFieldLabel(rule.fieldId)}" {operatorLabels[rule.operator].toLowerCase()}{' '}
                        {!['isEmpty', 'isNotEmpty'].includes(rule.operator) && `"${rule.value}"`}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveRule(index)}
                      className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors mt-5"
                      title="Remove rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddRule}
                className="w-full py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
              >
                <Plus size={18} />
                <span className="text-sm font-medium">Add Condition</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            Save Conditions
          </button>
        </div>
      </div>
    </div>
  );
}
