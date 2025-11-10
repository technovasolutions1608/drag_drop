import { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { FormTemplate } from '../types/form';

interface OutputGeneratorProps {
  form: FormTemplate;
  onClose: () => void;
}

export default function OutputGenerator({ form, onClose }: OutputGeneratorProps) {
  const [outputType, setOutputType] = useState<'json' | 'xml' | 'xsd'>('json');
  const [copied, setCopied] = useState(false);

  const generateJSON = (): string => {
    return JSON.stringify(form, null, 2);
  };

  const generateXML = (): string => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<form id="${form.formId}" name="${form.formName}">\n`;

    if (form.description) {
      xml += `  <description>${escapeXml(form.description)}</description>\n`;
    }

    xml += `  <metadata>\n`;
    xml += `    <createdAt>${form.createdAt}</createdAt>\n`;
    xml += `    <updatedAt>${form.updatedAt}</updatedAt>\n`;
    xml += `  </metadata>\n`;

    xml += `  <sections>\n`;
    form.sections.forEach((section) => {
      xml += `    <section id="${section.id}" name="${escapeXml(section.name)}" collapsed="${section.collapsed}" reusable="${section.isReusable}">\n`;
      xml += `      <components>\n`;

      section.components.forEach((component) => {
        xml += `        <component id="${component.id}" type="${component.type}">\n`;
        xml += `          <label>${escapeXml(component.label)}</label>\n`;
        xml += `          <required>${component.required}</required>\n`;

        if (component.placeholder) {
          xml += `          <placeholder>${escapeXml(component.placeholder)}</placeholder>\n`;
        }

        if (component.options && component.options.length > 0) {
          xml += `          <options>\n`;
          component.options.forEach((option) => {
            xml += `            <option>${escapeXml(option)}</option>\n`;
          });
          xml += `          </options>\n`;
        }

        if (component.min !== undefined) {
          xml += `          <min>${component.min}</min>\n`;
        }

        if (component.max !== undefined) {
          xml += `          <max>${component.max}</max>\n`;
        }

        if (component.validationRules.length > 0) {
          xml += `          <validationRules>\n`;
          component.validationRules.forEach((rule) => {
            xml += `            <rule type="${rule.type}">\n`;
            if (rule.value !== undefined) {
              xml += `              <value>${escapeXml(String(rule.value))}</value>\n`;
            }
            if (rule.message) {
              xml += `              <message>${escapeXml(rule.message)}</message>\n`;
            }
            xml += `            </rule>\n`;
          });
          xml += `          </validationRules>\n`;
        }

        if (component.conditionalRules.length > 0) {
          xml += `          <conditionalRules>\n`;
          component.conditionalRules.forEach((rule) => {
            xml += `            <rule id="${rule.id}" fieldId="${rule.fieldId}" operator="${rule.operator}">\n`;
            xml += `              <value>${escapeXml(String(rule.value))}</value>\n`;
            xml += `            </rule>\n`;
          });
          xml += `          </conditionalRules>\n`;
        }

        xml += `        </component>\n`;
      });

      xml += `      </components>\n`;
      xml += `    </section>\n`;
    });
    xml += `  </sections>\n`;
    xml += `</form>`;

    return xml;
  };

  const generateXSD = (): string => {
    let xsd = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xsd += '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n\n';

    xsd += '  <xs:element name="form">\n';
    xsd += '    <xs:complexType>\n';
    xsd += '      <xs:sequence>\n';
    xsd += '        <xs:element name="description" type="xs:string" minOccurs="0"/>\n';
    xsd += '        <xs:element name="metadata" type="MetadataType"/>\n';
    xsd += '        <xs:element name="sections" type="SectionsType"/>\n';
    xsd += '      </xs:sequence>\n';
    xsd += '      <xs:attribute name="id" type="xs:string" use="required"/>\n';
    xsd += '      <xs:attribute name="name" type="xs:string" use="required"/>\n';
    xsd += '    </xs:complexType>\n';
    xsd += '  </xs:element>\n\n';

    xsd += '  <xs:complexType name="MetadataType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="createdAt" type="xs:dateTime"/>\n';
    xsd += '      <xs:element name="updatedAt" type="xs:dateTime"/>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:complexType name="SectionsType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="section" type="SectionType" maxOccurs="unbounded"/>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:complexType name="SectionType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="components" type="ComponentsType"/>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '    <xs:attribute name="id" type="xs:string" use="required"/>\n';
    xsd += '    <xs:attribute name="name" type="xs:string" use="required"/>\n';
    xsd += '    <xs:attribute name="collapsed" type="xs:boolean"/>\n';
    xsd += '    <xs:attribute name="reusable" type="xs:boolean"/>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:complexType name="ComponentsType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="component" type="ComponentType" maxOccurs="unbounded"/>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:complexType name="ComponentType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="label" type="xs:string"/>\n';
    xsd += '      <xs:element name="required" type="xs:boolean"/>\n';
    xsd += '      <xs:element name="placeholder" type="xs:string" minOccurs="0"/>\n';
    xsd += '      <xs:element name="options" type="OptionsType" minOccurs="0"/>\n';
    xsd += '      <xs:element name="min" type="xs:decimal" minOccurs="0"/>\n';
    xsd += '      <xs:element name="max" type="xs:decimal" minOccurs="0"/>\n';
    xsd += '      <xs:element name="validationRules" type="ValidationRulesType" minOccurs="0"/>\n';
    xsd += '      <xs:element name="conditionalRules" type="ConditionalRulesType" minOccurs="0"/>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '    <xs:attribute name="id" type="xs:string" use="required"/>\n';
    xsd += '    <xs:attribute name="type" type="ComponentTypeEnum" use="required"/>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:simpleType name="ComponentTypeEnum">\n';
    xsd += '    <xs:restriction base="xs:string">\n';
    xsd += '      <xs:enumeration value="text"/>\n';
    xsd += '      <xs:enumeration value="number"/>\n';
    xsd += '      <xs:enumeration value="email"/>\n';
    xsd += '      <xs:enumeration value="textarea"/>\n';
    xsd += '      <xs:enumeration value="radio"/>\n';
    xsd += '      <xs:enumeration value="checkbox"/>\n';
    xsd += '      <xs:enumeration value="date"/>\n';
    xsd += '      <xs:enumeration value="dropdown"/>\n';
    xsd += '      <xs:enumeration value="file"/>\n';
    xsd += '      <xs:enumeration value="toggle"/>\n';
    xsd += '      <xs:enumeration value="slider"/>\n';
    xsd += '    </xs:restriction>\n';
    xsd += '  </xs:simpleType>\n\n';

    xsd += '  <xs:complexType name="OptionsType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="option" type="xs:string" maxOccurs="unbounded"/>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:complexType name="ValidationRulesType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="rule" maxOccurs="unbounded">\n';
    xsd += '        <xs:complexType>\n';
    xsd += '          <xs:sequence>\n';
    xsd += '            <xs:element name="value" type="xs:string" minOccurs="0"/>\n';
    xsd += '            <xs:element name="message" type="xs:string" minOccurs="0"/>\n';
    xsd += '          </xs:sequence>\n';
    xsd += '          <xs:attribute name="type" type="xs:string" use="required"/>\n';
    xsd += '        </xs:complexType>\n';
    xsd += '      </xs:element>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '  <xs:complexType name="ConditionalRulesType">\n';
    xsd += '    <xs:sequence>\n';
    xsd += '      <xs:element name="rule" maxOccurs="unbounded">\n';
    xsd += '        <xs:complexType>\n';
    xsd += '          <xs:sequence>\n';
    xsd += '            <xs:element name="value" type="xs:string"/>\n';
    xsd += '          </xs:sequence>\n';
    xsd += '          <xs:attribute name="id" type="xs:string" use="required"/>\n';
    xsd += '          <xs:attribute name="fieldId" type="xs:string" use="required"/>\n';
    xsd += '          <xs:attribute name="operator" type="xs:string" use="required"/>\n';
    xsd += '        </xs:complexType>\n';
    xsd += '      </xs:element>\n';
    xsd += '    </xs:sequence>\n';
    xsd += '  </xs:complexType>\n\n';

    xsd += '</xs:schema>';

    return xsd;
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
    switch (outputType) {
      case 'json':
        return generateJSON();
      case 'xml':
        return generateXML();
      case 'xsd':
        return generateXSD();
      default:
        return '';
    }
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
    const extension = outputType === 'xsd' ? 'xsd' : outputType;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.formName.replace(/\s+/g, '_')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Export Form</h2>
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
              <button
                onClick={() => setOutputType('xsd')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  outputType === 'xsd'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                XSD Schema
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
