import { FormComponent } from '../types/form';

interface FormComponentRendererProps {
  component: FormComponent;
  value?: string | number | boolean | File | null;
  onChange?: (value: string | number | boolean | File | null) => void;
  disabled?: boolean;
}

export default function FormComponentRenderer({
  component,
  value,
  onChange,
  disabled = false,
}: FormComponentRendererProps) {
  const inputClasses = `w-full px-3 py-2 border border-input rounded-md bg-background text-foreground
    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

  switch (component.type) {
    case 'text':
    case 'email':
      return (
        <input
          type={component.type}
          placeholder={component.placeholder}
          value={value as string || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={inputClasses}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          placeholder={component.placeholder}
          value={value as number || ''}
          onChange={(e) => onChange?.(parseFloat(e.target.value))}
          disabled={disabled}
          min={component.min}
          max={component.max}
          className={inputClasses}
        />
      );

    case 'textarea':
      return (
        <textarea
          placeholder={component.placeholder}
          value={value as string || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          rows={4}
          className={inputClasses}
        />
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {component.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={component.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                className="w-4 h-4 text-primary focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {component.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={option}
                disabled={disabled}
                className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value as string || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={inputClasses}
        />
      );

    case 'dropdown':
      return (
        <select
          value={value as string || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={inputClasses}
        >
          <option value="">Select an option...</option>
          {component.options?.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case 'file':
      return (
        <input
          type="file"
          onChange={(e) => onChange?.(e.target.files?.[0] || null)}
          disabled={disabled}
          accept={component.accept}
          className={inputClasses}
        />
      );

    case 'toggle':
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value as boolean || false}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      );

    case 'slider':
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={component.min || 0}
            max={component.max || 100}
            step={component.step || 1}
            value={value as number || component.min || 0}
            onChange={(e) => onChange?.(parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="text-sm text-muted-foreground text-right">
            Value: {value || component.min || 0}
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full border border-border rounded-md">
            <thead className="bg-secondary/50">
              <tr>
                {component.columns?.map((col) => (
                  <th key={col.id} className="px-3 py-2 text-left text-sm font-medium text-card-foreground border-b border-border">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: component.rows || 3 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border last:border-b-0">
                  {component.columns?.map((col) => (
                    <td key={col.id} className="px-3 py-2">
                      {col.type === 'text' && (
                        <input
                          type="text"
                          disabled={disabled}
                          className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      )}
                      {col.type === 'number' && (
                        <input
                          type="number"
                          disabled={disabled}
                          className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      )}
                      {col.type === 'dropdown' && (
                        <select
                          disabled={disabled}
                          className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Select...</option>
                          {col.options?.map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}
                      {col.type === 'checkbox' && (
                        <input
                          type="checkbox"
                          disabled={disabled}
                          className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-ring"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return <div className="text-muted-foreground text-sm">Unknown component type</div>;
  }
}
