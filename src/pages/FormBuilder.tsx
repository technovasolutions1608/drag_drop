import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Eye, FolderOpen, Plus, Download, FileEdit } from 'lucide-react';
import { useFormStore } from '../store/formStore';
import { ComponentType } from '../types/form';
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Canvas from '../components/Canvas';
import RightSidebar from '../components/RightSidebar';
import PreviewMode from '../components/PreviewMode';
import TemplateManager from '../components/TemplateManager';
import NewFormModal from '../components/NewFormModal';
import OutputGenerator from '../components/OutputGenerator';

export default function FormBuilder() {
  const { currentForm, isPreviewMode, togglePreviewMode, saveTemplate } = useFormStore();
  const navigate = useNavigate();
  const [draggingType, setDraggingType] = useState<ComponentType | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showNewFormModal, setShowNewFormModal] = useState(false);
  const [showOutputGenerator, setShowOutputGenerator] = useState(false);

  const handleSave = () => {
    if (currentForm) {
      saveTemplate();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          {currentForm && (
          <span className="text-sm font-medium text-card-foreground">{currentForm.formName}</span>
        )}
          <button
            onClick={() => navigate('/fill-form')}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <FileEdit size={16} />
            Fill Form
          </button>

          <button
            onClick={() => setShowNewFormModal(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            New Form
          </button>

          <button
            onClick={() => setShowTemplateManager(true)}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <FolderOpen size={16} />
            Templates
          </button>
        </div>

        {currentForm && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
              title="Save template"
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={togglePreviewMode}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${
                isPreviewMode
                  ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                  : 'border border-border hover:bg-secondary'
              }`}
              title="Toggle preview mode"
            >
              <Eye size={16} />
              {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </button>

            <button
              onClick={() => setShowOutputGenerator(true)}
              className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors flex items-center gap-2 text-sm font-medium"
              title="Generate output"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && <LeftSidebar onDragStart={setDraggingType} />}
        {isPreviewMode ? <PreviewMode /> : <Canvas />}
        {!isPreviewMode && <RightSidebar />}
      </div>

      {showTemplateManager && <TemplateManager onClose={() => setShowTemplateManager(false)} />}
      {showNewFormModal && <NewFormModal onClose={() => setShowNewFormModal(false)} />}
      {showOutputGenerator && currentForm && (
        <OutputGenerator form={currentForm} onClose={() => setShowOutputGenerator(false)} />
      )}
    </div>
  );
}
