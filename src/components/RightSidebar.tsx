import { useFormStore } from '../store/formStore';
import { useState } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { ValidationRule, TableColumn } from '../types/form';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';

export default function RightSidebar() {
  const { currentForm, selectedComponentId, updateComponent } = useFormStore();
  const [showConditionalBuilder, setShowConditionalBuilder] = useState(false);

  const selectedComponent = currentForm?.sections
    .flatMap((s) => s.components)
    .find((c) => c.id === selectedComponentId);

  if (!selectedComponent) {
    return (
      <aside className="w-80 bg-sidebar border-l border-sidebar-border overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-sidebar-foreground" />
            <h2 className="text-lg font-semibold text-sidebar-primary">Properties</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Select a component to edit its properties</p>
          </div>
        </div>
      </aside>
    );
  }

  const handleUpdateField = (field: string, value: unknown) => {
    updateComponent(selectedComponent.id, { [field]: value });
  };

  const handleAddOption = () => {
    const currentOptions = selectedComponent.options || [];
    handleUpdateField('options', [...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(selectedComponent.options || [])];
    newOptions[index] = value;
    handleUpdateField('options', newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = (selectedComponent.options || []).filter((_, i) => i !== index);
    handleUpdateField('options', newOptions);
  };

  const handleAddValidationRule = () => {
    const newRule: ValidationRule = {
      type: 'required',
      message: 'This field is required',
    };
    handleUpdateField('validationRules', [...selectedComponent.validationRules, newRule]);
  };

  const handleUpdateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const newRules = [...selectedComponent.validationRules];
    newRules[index] = { ...newRules[index], ...updates };
    handleUpdateField('validationRules', newRules);
  };

  const handleRemoveValidationRule = (index: number) => {
    const newRules = selectedComponent.validationRules.filter((_, i) => i !== index);
    handleUpdateField('validationRules', newRules);
  };

  const handleAddColumn = () => {
    const currentColumns = selectedComponent.columns || [];
    const newColumn: TableColumn = {
      id: `col${Date.now()}`,
      label: `Column ${currentColumns.length + 1}`,
      type: 'text',
    };
    handleUpdateField('columns', [...currentColumns, newColumn]);
  };

  const handleUpdateColumn = (index: number, updates: Partial<TableColumn>) => {
    const newColumns = [...(selectedComponent.columns || [])];
    newColumns[index] = { ...newColumns[index], ...updates };
    handleUpdateField('columns', newColumns);
  };

  const handleRemoveColumn = (index: number) => {
    const newColumns = (selectedComponent.columns || []).filter((_, i) => i !== index);
    handleUpdateField('columns', newColumns);
  };

  const needsOptions = ['radio', 'checkbox', 'dropdown'].includes(selectedComponent.type);
  const needsMinMax = ['number', 'slider'].includes(selectedComponent.type);
  const isTable = selectedComponent.type === 'table';

  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border overflow-y-auto flex-shrink-0">
      <div className="p-4 pb-24">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-sidebar-foreground" />
          <h2 className="text-lg font-semibold text-sidebar-primary">Properties</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Label</label>
            <input
              type="text"
              value={selectedComponent.label}
              onChange={(e) => handleUpdateField('label', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Field ID
            </label>
            <input
              type="text"
              value={selectedComponent.fieldId || ''}
              onChange={(e) => handleUpdateField('fieldId', e.target.value)}
              placeholder="e.g., first_name, email_address"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for data storage and retrieval
            </p>
          </div>

          {selectedComponent.type !== 'toggle' && selectedComponent.type !== 'section' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={selectedComponent.placeholder || ''}
                onChange={(e) => handleUpdateField('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={selectedComponent.required}
              onChange={(e) => handleUpdateField('required', e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring"
            />
            <label htmlFor="required" className="text-sm font-medium text-card-foreground cursor-pointer">
              Required Field
            </label>
          </div>

          {needsMinMax && (
            <>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Minimum Value
                </label>
                <input
                  type="number"
                  value={selectedComponent.min || 0}
                  onChange={(e) => handleUpdateField('min', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Maximum Value
                </label>
                <input
                  type="number"
                  value={selectedComponent.max || 100}
                  onChange={(e) => handleUpdateField('max', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </>
          )}

          {selectedComponent.type === 'slider' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Step</label>
              <input
                type="number"
                value={selectedComponent.step || 1}
                onChange={(e) => handleUpdateField('step', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {selectedComponent.type === 'file' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Accepted File Types
              </label>
              <input
                type="text"
                value={selectedComponent.accept || ''}
                onChange={(e) => handleUpdateField('accept', e.target.value)}
                placeholder=".pdf,.doc,.docx"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                e.g., .pdf, .doc, image/*
              </p>
            </div>
          )}

          {isTable && (
            <>
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Number of Rows
                </label>
                <input
                  type="number"
                  value={selectedComponent.rows || 3}
                  onChange={(e) => handleUpdateField('rows', parseInt(e.target.value) || 3)}
                  min="1"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-card-foreground">Table Columns</label>
                  <button
                    onClick={handleAddColumn}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                    title="Add column"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedComponent.columns?.map((column, index) => (
                    <div key={column.id} className="p-3 bg-secondary/30 rounded-md border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Column {index + 1}</span>
                        <button
                          onClick={() => handleRemoveColumn(index)}
                          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                          title="Remove column"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={column.label}
                        onChange={(e) => handleUpdateColumn(index, { label: e.target.value })}
                        placeholder="Column label"
                        className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <select
                        value={column.type}
                        onChange={(e) => handleUpdateColumn(index, { type: e.target.value as TableColumn['type'] })}
                        className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                      {column.type === 'dropdown' && (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            Options (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={column.options?.join(', ') || ''}
                            onChange={(e) => handleUpdateColumn(index, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            placeholder="Option 1, Option 2, Option 3"
                            className="w-full px-2 py-1 text-xs border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedComponent.type !== 'section' && selectedComponent.type !== 'file' && selectedComponent.type !== 'table' && (
            <div className="border-t border-border pt-4">
              <label className="block text-sm font-medium text-card-foreground mb-2">Default Value</label>
              {selectedComponent.type === 'toggle' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedComponent.defaultValue as boolean || false}
                    onChange={(e) => handleUpdateField('defaultValue', e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm text-card-foreground">Enable by default</span>
                </label>
              ) : selectedComponent.type === 'radio' || selectedComponent.type === 'checkbox' ? (
                <select
                  value={selectedComponent.defaultValue as string || ''}
                  onChange={(e) => handleUpdateField('defaultValue', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="">None</option>
                  {selectedComponent.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : selectedComponent.type === 'dropdown' ? (
                <select
                  value={selectedComponent.defaultValue as string || ''}
                  onChange={(e) => handleUpdateField('defaultValue', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select an option...</option>
                  {selectedComponent.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : selectedComponent.type === 'number' ? (
                <input
                  type="number"
                  value={selectedComponent.defaultValue as number || ''}
                  onChange={(e) => handleUpdateField('defaultValue', e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="Leave empty for no default"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : selectedComponent.type === 'slider' ? (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={selectedComponent.min || 0}
                    max={selectedComponent.max || 100}
                    step={selectedComponent.step || 1}
                    value={selectedComponent.defaultValue as number || selectedComponent.min || 0}
                    onChange={(e) => handleUpdateField('defaultValue', parseFloat(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {selectedComponent.defaultValue || selectedComponent.min || 0}
                  </div>
                </div>
              ) : selectedComponent.type === 'date' ? (
                <input
                  type="date"
                  value={selectedComponent.defaultValue as string || ''}
                  onChange={(e) => handleUpdateField('defaultValue', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <input
                  type="text"
                  value={selectedComponent.defaultValue as string || ''}
                  onChange={(e) => handleUpdateField('defaultValue', e.target.value)}
                  placeholder="Leave empty for no default"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
            </div>
          )}

          {needsOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-card-foreground">Options</label>
                <button
                  onClick={handleAddOption}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                  title="Add option"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {selectedComponent.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                      title="Remove option"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-card-foreground">Validation Rules</h3>
              <button
                onClick={handleAddValidationRule}
                className="p-1 hover:bg-secondary rounded transition-colors"
                title="Add validation rule"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {selectedComponent.validationRules.map((rule, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-md border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <select
                      value={rule.type}
                      onChange={(e) =>
                        handleUpdateValidationRule(index, {
                          type: e.target.value as ValidationRule['type'],
                        })
                      }
                      className="text-sm px-2 py-1 border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="required">Required</option>
                      <option value="minLength">Min Length</option>
                      <option value="maxLength">Max Length</option>
                      <option value="min">Min Value</option>
                      <option value="max">Max Value</option>
                      <option value="regex">Regex Pattern</option>
                      <option value="email">Email</option>
                      <option value="url">URL</option>
                    </select>
                    <button
                      onClick={() => handleRemoveValidationRule(index)}
                      className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                      title="Remove rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {['minLength', 'maxLength', 'min', 'max', 'regex'].includes(rule.type) && (
                    <input
                      type={rule.type === 'regex' ? 'text' : 'number'}
                      value={rule.value || ''}
                      onChange={(e) =>
                        handleUpdateValidationRule(index, {
                          value: rule.type === 'regex' ? e.target.value : parseFloat(e.target.value),
                        })
                      }
                      placeholder="Value"
                      className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2"
                    />
                  )}
                  <input
                    type="text"
                    value={rule.message || ''}
                    onChange={(e) => handleUpdateValidationRule(index, { message: e.target.value })}
                    placeholder="Error message"
                    className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <button
              onClick={() => setShowConditionalBuilder(true)}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
            >
              Configure Conditional Logic
              {selectedComponent.conditionalRules.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
                  {selectedComponent.conditionalRules.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {showConditionalBuilder && (
        <ConditionalLogicBuilder
          component={selectedComponent}
          onClose={() => setShowConditionalBuilder(false)}
        />
      )}
    </aside>
  );
}
