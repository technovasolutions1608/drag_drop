import { X } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { useState, useEffect } from 'react';
import SectionConditionalLogicBuilder from './SectionConditionalLogicBuilder';

interface SectionManagerProps {
  sectionId: string;
  onClose: () => void;
}

export default function SectionManager({ sectionId, onClose }: SectionManagerProps) {
  const { currentForm, updateSection } = useFormStore();
  const section = currentForm?.sections.find((s) => s.id === sectionId);

  const [name, setName] = useState(section?.name || '');
  const [isReusable, setIsReusable] = useState(section?.isReusable || false);
  const [showConditionalBuilder, setShowConditionalBuilder] = useState(false);

  useEffect(() => {
    if (section) {
      setName(section.name);
      setIsReusable(section.isReusable);
    }
  }, [section]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a section name');
      return;
    }

    updateSection(sectionId, { name, isReusable });
    onClose();
  };

  if (!section) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Edit Section</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Section Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter section name"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="reusable"
              checked={isReusable}
              onChange={(e) => setIsReusable(e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring mt-0.5"
            />
            <div>
              <label htmlFor="reusable" className="text-sm font-medium text-card-foreground cursor-pointer">
                Mark as Reusable Section
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Reusable sections can be easily duplicated or used across different forms
              </p>
            </div>
          </div>

          <div className="p-3 bg-secondary/30 rounded-md border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Components:</strong> {section.components.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Conditional Rules:</strong> {section.conditionalRules?.length || 0}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConditionalBuilder(true)}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
          >
            Configure Conditional Logic
            {section.conditionalRules && section.conditionalRules.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
                {section.conditionalRules.length}
              </span>
            )}
          </button>
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
            Save Changes
          </button>
        </div>
      </div>

      {showConditionalBuilder && (
        <SectionConditionalLogicBuilder
          sectionId={sectionId}
          onClose={() => setShowConditionalBuilder(false)}
        />
      )}
    </div>
  );
}
