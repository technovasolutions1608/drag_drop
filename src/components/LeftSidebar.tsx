import {
  Type,
  Hash,
  Mail,
  AlignLeft,
  Circle,
  CheckSquare,
  Calendar,
  ChevronDown,
  Upload,
  ToggleRight,
  Sliders,
  Layout,
  Table
} from 'lucide-react';
import { ComponentType } from '../types/form';

interface ComponentLibraryItem {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const componentLibrary: ComponentLibraryItem[] = [
  { type: 'text', label: 'Text Field', icon: <Type size={18} />, description: 'Single line text input' },
  { type: 'number', label: 'Number', icon: <Hash size={18} />, description: 'Numeric input field' },
  { type: 'email', label: 'Email', icon: <Mail size={18} />, description: 'Email address field' },
  { type: 'textarea', label: 'Text Area', icon: <AlignLeft size={18} />, description: 'Multi-line text input' },
  { type: 'radio', label: 'Radio Group', icon: <Circle size={18} />, description: 'Single selection from options' },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={18} />, description: 'Multiple selections' },
  { type: 'date', label: 'Date Picker', icon: <Calendar size={18} />, description: 'Date selection field' },
  { type: 'dropdown', label: 'Dropdown', icon: <ChevronDown size={18} />, description: 'Select from dropdown list' },
  { type: 'file', label: 'File Upload', icon: <Upload size={18} />, description: 'File upload field' },
  { type: 'toggle', label: 'Toggle Switch', icon: <ToggleRight size={18} />, description: 'On/off toggle' },
  { type: 'slider', label: 'Slider', icon: <Sliders size={18} />, description: 'Range slider input' },
  { type: 'table', label: 'Table', icon: <Table size={18} />, description: 'Dynamic data table' },
  { type: 'section', label: 'Section', icon: <Layout size={18} />, description: 'Group components' },
];

interface LeftSidebarProps {
  onDragStart: (type: ComponentType) => void;
}

export default function LeftSidebar({ onDragStart }: LeftSidebarProps) {
  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('componentType', type);
    onDragStart(type);
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-primary">Component Library</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag components to canvas</p>
      </div>

      <div className="p-3 space-y-2">
        {componentLibrary.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg cursor-move hover:shadow-md hover:border-primary transition-all duration-200 group"
          >
            <div className="mt-0.5 text-sidebar-foreground group-hover:text-primary transition-colors">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-card-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
