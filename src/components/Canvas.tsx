import { useState } from 'react';
import { useFormStore } from '../store/formStore';
import { ComponentType, FormComponent } from '../types/form';
import { Plus, ChevronDown, ChevronRight, Trash2, Settings2, ArrowUp, ArrowDown, GitBranch } from 'lucide-react';
import FormComponentRenderer from './FormComponentRenderer';
import SectionManager from './SectionManager';

export default function Canvas() {
  const {
    currentForm,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    addSection,
    toggleSectionCollapse,
    deleteSection,
    deleteComponent,
    reorderComponent,
    reorderSection,
  } = useFormStore();

  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDraggedOver(sectionId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDraggedOver(null);

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;

    if (componentType === 'section') {
      const newSection = {
        id: `S${Date.now()}`,
        name: 'New Section',
        collapsed: false,
        isReusable: false,
        components: [],
        conditionalRules: [],
      };
      addSection(newSection);
      return;
    }

    const newComponent: FormComponent = {
      id: `C${Date.now()}`,
      type: componentType,
      label: getDefaultLabel(componentType),
      placeholder: '',
      required: false,
      options: componentType === 'radio' || componentType === 'checkbox' || componentType === 'dropdown'
        ? ['Option 1', 'Option 2', 'Option 3']
        : undefined,
      validationRules: [],
      conditionalRules: [],
      sectionId,
      min: componentType === 'number' || componentType === 'slider' ? 0 : undefined,
      max: componentType === 'number' || componentType === 'slider' ? 100 : undefined,
      step: componentType === 'slider' ? 1 : undefined,
      columns: componentType === 'table'
        ? [{ id: 'col1', label: 'Column 1', type: 'text' }, { id: 'col2', label: 'Column 2', type: 'text' }]
        : undefined,
      rows: componentType === 'table' ? 3 : undefined,
    };

    addComponent(newComponent, sectionId);
    setSelectedComponentId(newComponent.id);
  };

  const getDefaultLabel = (type: ComponentType): string => {
    const labels: Record<ComponentType, string> = {
      text: 'Text Field',
      number: 'Number Field',
      email: 'Email Address',
      textarea: 'Text Area',
      radio: 'Radio Group',
      checkbox: 'Checkbox Group',
      date: 'Date',
      dropdown: 'Dropdown',
      file: 'File Upload',
      toggle: 'Toggle',
      slider: 'Slider',
      table: 'Table',
      section: 'Section',
    };
    return labels[type] || 'Field';
  };

  const handleAddSection = () => {
    const newSection = {
      id: `S${Date.now()}`,
      name: 'New Section',
      collapsed: false,
      isReusable: false,
      components: [],
      conditionalRules: [],
    };
    addSection(newSection);
  };

  const handleComponentClick = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComponentId(componentId);
  };

  if (!currentForm) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">No form selected</p>
          <p className="text-sm text-muted-foreground">Create a new form or load an existing template</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted/30 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">{currentForm.formName}</h1>
          {currentForm.description && (
            <p className="text-sm text-muted-foreground mt-2">{currentForm.description}</p>
          )}
        </div>

        <div className="space-y-4">
          {currentForm.sections.map((section) => (
            <div
              key={section.id}
              className="bg-card rounded-lg shadow-sm border border-border overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 bg-secondary/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSectionCollapse(section.id)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    {section.collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <h3 className="font-semibold text-card-foreground">{section.name}</h3>
                  {section.isReusable && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Reusable
                    </span>
                  )}
                  {section.conditionalRules && section.conditionalRules.length > 0 && (
                    <span className="text-xs bg-accent/50 text-accent-foreground px-2 py-1 rounded flex items-center gap-1">
                      <GitBranch size={12} />
                      Conditional
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => reorderSection(section.id, 'up')}
                    disabled={currentForm.sections.indexOf(section) === 0}
                    className="p-1.5 hover:bg-secondary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move section up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => reorderSection(section.id, 'down')}
                    disabled={currentForm.sections.indexOf(section) === currentForm.sections.length - 1}
                    className="p-1.5 hover:bg-secondary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move section down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => setEditingSectionId(section.id)}
                    className="p-1.5 hover:bg-secondary rounded transition-colors"
                    title="Edit section"
                  >
                    <Settings2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                    title="Delete section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {!section.collapsed && (
                <div
                  onDragOver={(e) => handleDragOver(e, section.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, section.id)}
                  className={`p-4 min-h-[120px] transition-colors ${
                    draggedOver === section.id ? 'bg-primary/5 border-2 border-dashed border-primary' : ''
                  }`}
                >
                  {section.components.length === 0 ? (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg">
                      <p className="text-sm text-muted-foreground">Drop components here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {section.components.map((component, componentIndex) => (
                        <div
                          key={component.id}
                          onClick={(e) => handleComponentClick(component.id, e)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedComponentId === component.id
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-card-foreground">
                                {component.label}
                                {component.required && <span className="text-destructive ml-1">*</span>}
                                {component.conditionalRules.length > 0 && (
                                  <span className="ml-2 text-xs bg-accent/50 text-accent-foreground px-1.5 py-0.5 rounded">
                                    <GitBranch size={10} className="inline" /> Conditional
                                  </span>
                                )}
                              </label>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderComponent(section.id, component.id, 'up');
                                }}
                                disabled={componentIndex === 0}
                                className="p-1 hover:bg-secondary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move component up"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  reorderComponent(section.id, component.id, 'down');
                                }}
                                disabled={componentIndex === section.components.length - 1}
                                className="p-1 hover:bg-secondary rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Move component down"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteComponent(component.id);
                                }}
                                className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                                title="Delete component"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <FormComponentRenderer component={component} disabled />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddSection}
          className="mt-4 w-full p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
        >
          <Plus size={18} />
          <span className="text-sm font-medium">Add Section</span>
        </button>
      </div>

      {editingSectionId && (
        <SectionManager
          sectionId={editingSectionId}
          onClose={() => setEditingSectionId(null)}
        />
      )}
    </div>
  );
}
