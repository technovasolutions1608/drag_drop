import { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { FormComponent } from '../types/form';

interface SubmissionOutputModalProps {
  formData: Record<string, string | number | boolean | File | null>;
  components: FormComponent[];
  onClose: () => void;
}

export default function SubmissionOutputModal({
  formData,
  components,
  onClose,
}: SubmissionOutputModalProps) {
  const [outputType, setOutputType] = useState<'json' | 'xml'>('json');
  const [copied, setCopied] = useState(false);

  const generateJSON = (): string => {
    const output: Record<string, string | number | boolean | null> = {};

    components.forEach((component) => {
      const fieldId = component.fieldId || component.id;
      const value = formData[component.id];

      if (value instanceof File) {
        output[fieldId] = `[File: ${value.name}]`;
      } else {
        output[fieldId] = value ?? null;
      }
    });

    return JSON.stringify(output, null, 2);
  };

  const generateXML = (): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<formSubmission>\n';

    components.forEach((component) => {
      const fieldId = component.fieldId || component.id;
      const value = formData[component.id];

      let valueStr = '';
      if (value instanceof File) {
        valueStr = `[File: ${value.name}]`;
      } else if (value === null || value === undefined) {
        valueStr = '';
      } else {
        valueStr = escapeXml(String(value));
      }

      xml += `  <field id="${escapeXml(fieldId)}" label="${escapeXml(component.label)}">\n`;
      xml += `    <value>${valueStr}</value>\n`;
      xml += `  </field>\n`;
    });

    xml += '</formSubmission>';
    return xml;
  };

  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const getOutput = (): string => {
    return outputType === 'json' ? generateJSON() : generateXML();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getOutput());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const output = getOutput();
    const extension = outputType;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form_submission_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Form Submission Output</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-card-foreground">Output Format:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOutputType('json')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  outputType === 'json'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setOutputType('xml')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  outputType === 'xml'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                XML
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <pre className="bg-secondary/30 p-4 rounded-lg text-sm overflow-x-auto border border-border">
            <code>{getOutput()}</code>
          </pre>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button
            onClick={handleCopy}
            className="px-4 py-2 border border-border rounded-md hover:bg-secondary transition-colors text-sm font-medium flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
