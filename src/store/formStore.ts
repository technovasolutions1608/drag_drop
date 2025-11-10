import { create } from 'zustand';
import { FormComponent, FormSection, FormTemplate } from '../types/form';

interface FormBuilderState {
  currentForm: FormTemplate | null;
  selectedComponentId: string | null;
  isPreviewMode: boolean;

  setCurrentForm: (form: FormTemplate | null) => void;
  setSelectedComponentId: (id: string | null) => void;
  togglePreviewMode: () => void;

  addSection: (section: FormSection) => void;
  updateSection: (sectionId: string, updates: Partial<FormSection>) => void;
  deleteSection: (sectionId: string) => void;
  toggleSectionCollapse: (sectionId: string) => void;

  addComponent: (component: FormComponent, sectionId: string) => void;
  updateComponent: (componentId: string, updates: Partial<FormComponent>) => void;
  deleteComponent: (componentId: string) => void;
  moveComponent: (componentId: string, newSectionId: string, newIndex: number) => void;
  reorderComponent: (sectionId: string, componentId: string, direction: 'up' | 'down') => void;
  reorderSection: (sectionId: string, direction: 'up' | 'down') => void;

  saveTemplate: () => void;
  loadTemplate: (formId: string) => void;
  deleteTemplate: (formId: string) => void;
  getAllTemplates: () => FormTemplate[];
  createNewForm: (name: string, description?: string) => void;
}

export const useFormStore = create<FormBuilderState>((set, get) => ({
  currentForm: null,
  selectedComponentId: null,
  isPreviewMode: false,

  setCurrentForm: (form) => set({ currentForm: form }),

  setSelectedComponentId: (id) => set({ selectedComponentId: id }),

  togglePreviewMode: () => set({ isPreviewMode: !get().isPreviewMode }),

  addSection: (section) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: [...currentForm.sections, section],
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateSection: (sectionId, updates) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  deleteSection: (sectionId) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.filter((section) => section.id !== sectionId),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  toggleSectionCollapse: (sectionId) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) =>
          section.id === sectionId ? { ...section, collapsed: !section.collapsed } : section
        ),
      },
    });
  },

  addComponent: (component, sectionId) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) =>
          section.id === sectionId
            ? { ...section, components: [...section.components, component] }
            : section
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  updateComponent: (componentId, updates) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) => ({
          ...section,
          components: section.components.map((component) =>
            component.id === componentId ? { ...component, ...updates } : component
          ),
        })),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  deleteComponent: (componentId) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((section) => ({
          ...section,
          components: section.components.filter((component) => component.id !== componentId),
        })),
        updatedAt: new Date().toISOString(),
      },
      selectedComponentId: get().selectedComponentId === componentId ? null : get().selectedComponentId,
    });
  },

  moveComponent: (componentId, newSectionId, newIndex) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    let componentToMove: FormComponent | undefined;
    let sourceSectionId: string | undefined;

    currentForm.sections.forEach((section) => {
      const found = section.components.find((c) => c.id === componentId);
      if (found) {
        componentToMove = found;
        sourceSectionId = section.id;
      }
    });

    if (!componentToMove || !sourceSectionId) return;

    const newSections = currentForm.sections.map((section) => {
      if (section.id === sourceSectionId) {
        return {
          ...section,
          components: section.components.filter((c) => c.id !== componentId),
        };
      }
      return section;
    });

    const finalSections = newSections.map((section) => {
      if (section.id === newSectionId) {
        const newComponents = [...section.components];
        newComponents.splice(newIndex, 0, { ...componentToMove!, sectionId: newSectionId });
        return { ...section, components: newComponents };
      }
      return section;
    });

    set({
      currentForm: {
        ...currentForm,
        sections: finalSections,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  saveTemplate: () => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    const templates = get().getAllTemplates();
    const existingIndex = templates.findIndex((t) => t.formId === currentForm.formId);

    if (existingIndex >= 0) {
      templates[existingIndex] = currentForm;
    } else {
      templates.push(currentForm);
    }

    localStorage.setItem('formTemplates', JSON.stringify(templates));
  },

  loadTemplate: (formId) => {
    const templates = get().getAllTemplates();
    const template = templates.find((t) => t.formId === formId);
    if (template) {
      set({ currentForm: template, selectedComponentId: null, isPreviewMode: false });
    }
  },

  deleteTemplate: (formId) => {
    const templates = get().getAllTemplates().filter((t) => t.formId !== formId);
    localStorage.setItem('formTemplates', JSON.stringify(templates));
    if (get().currentForm?.formId === formId) {
      set({ currentForm: null, selectedComponentId: null });
    }
  },

  getAllTemplates: () => {
    const stored = localStorage.getItem('formTemplates');
    return stored ? JSON.parse(stored) : [];
  },

  createNewForm: (name, description) => {
    const newForm: FormTemplate = {
      formId: `F${Date.now()}`,
      formName: name,
      description,
      sections: [
        {
          id: `S${Date.now()}`,
          name: 'Default Section',
          collapsed: false,
          isReusable: false,
          components: [],
          conditionalRules: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ currentForm: newForm, selectedComponentId: null, isPreviewMode: false });
  },

  reorderComponent: (sectionId, componentId, direction) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    const section = currentForm.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const currentIndex = section.components.findIndex((c) => c.id === componentId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= section.components.length) return;

    const newComponents = [...section.components];
    const [movedComponent] = newComponents.splice(currentIndex, 1);
    newComponents.splice(newIndex, 0, movedComponent);

    set({
      currentForm: {
        ...currentForm,
        sections: currentForm.sections.map((s) =>
          s.id === sectionId ? { ...s, components: newComponents } : s
        ),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  reorderSection: (sectionId, direction) => {
    const currentForm = get().currentForm;
    if (!currentForm) return;

    const currentIndex = currentForm.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentForm.sections.length) return;

    const newSections = [...currentForm.sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, movedSection);

    set({
      currentForm: {
        ...currentForm,
        sections: newSections,
        updatedAt: new Date().toISOString(),
      },
    });
  },
}));
