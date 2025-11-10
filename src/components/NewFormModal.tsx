import { useState } from 'react';
import { X } from 'lucide-react';
import { useFormStore } from '../store/formStore';

interface NewFormModalProps {
  onClose: () => void;
}

export default function NewFormModal({ onClose }: NewFormModalProps) {
  const { createNewForm } = useFormStore();
  const [formName, setFormName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    createNewForm(formName, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Create New Form</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Form Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description"
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            Create Form
          </button>
        </div>
      </div>
    </div>
  );
}
