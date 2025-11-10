import { X, Trash2, Edit, Calendar } from 'lucide-react';
import { useFormStore } from '../store/formStore';

interface TemplateManagerProps {
  onClose: () => void;
}

export default function TemplateManager({ onClose }: TemplateManagerProps) {
  const { getAllTemplates, loadTemplate, deleteTemplate } = useFormStore();
  const templates = getAllTemplates();

  const handleLoad = (formId: string) => {
    loadTemplate(formId);
    onClose();
  };

  const handleDelete = (formId: string, formName: string) => {
    if (confirm(`Are you sure you want to delete "${formName}"?`)) {
      deleteTemplate(formId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Form Templates</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No templates saved yet</p>
              <p className="text-sm text-muted-foreground">
                Create a new form and save it as a template
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.formId}
                  className="p-4 bg-secondary/20 rounded-lg border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-card-foreground mb-1">
                        {template.formName}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Created: {formatDate(template.createdAt)}</span>
                        </div>
                        <span>{template.sections.length} sections</span>
                        <span>
                          {template.sections.reduce((acc, s) => acc + s.components.length, 0)} components
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleLoad(template.formId)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(template.formId, template.formName)}
                        className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
