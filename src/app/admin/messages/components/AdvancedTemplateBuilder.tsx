/**
 * Advanced Template Builder Component
 * Supports multiple components, media uploads, and buttons
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  Plus,
  Trash2,
  Upload,
  Image,
  Video,
  File,
  Link,
  Phone,
  X
} from 'lucide-react';
import { 
  TemplateRequest, 
  TemplateComponent,
  TemplateButton,
  CreateTemplateRequest,
  validateMarketingTemplate
} from '@/lib/messaging/template-management';
import VariableSuggestions from './VariableSuggestions';
import SimpleTemplatePreview from './SimpleTemplatePreview';

interface AdvancedTemplateBuilderProps {
  template?: TemplateRequest;
  onSave: (template: CreateTemplateRequest) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function AdvancedTemplateBuilder({
  template,
  onSave,
  onCancel,
  isEditing = false
}: AdvancedTemplateBuilderProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: template?.name || '',
    language: template?.language || 'en',
    category: 'MARKETING', // Always Marketing for admin-created templates
    components: template?.components || [
      {
        type: 'TEXT',
        text: '',
        variables: []
      }
    ],
    meta: {
      description: template?.meta.description || '',
      useCase: template?.meta.useCase || '',
      exampleVariables: template?.meta.exampleVariables || {}
    },
    platforms: template?.platforms || ['whatsapp', 'instagram'], // Default to both platforms
    version: template?.version
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIntentionalSubmit, setIsIntentionalSubmit] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentComponentIndex, setCurrentComponentIndex] = useState<number>(0);
  const fileInputRefs = useRef<{[key: number]: HTMLInputElement | null}>({});

  // Validate form
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Always use Marketing template validation since admins can only create Marketing templates
    const validation = validateMarketingTemplate(formData);
    errors.push(...validation.errors);
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission if it's explicitly triggered by the save button
    if (!isIntentionalSubmit) {
      console.log('Form submission prevented - not intentional');
      return;
    }
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsIntentionalSubmit(false); // Reset flag
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving template:', error);
      setErrors(['Failed to save template. Please try again.']);
    } finally {
      setIsSubmitting(false);
      setIsIntentionalSubmit(false); // Reset flag
    }
  };

  // Add new component
  const addComponent = (type: 'TEXT' | 'BUTTONS') => {
    // Check if we already have a TEXT component
    if (type === 'TEXT') {
      const hasTextComponent = formData.components.some(comp => comp.type === 'TEXT');
      if (hasTextComponent) {
        setErrors(['Templates can only have one text component']);
        return;
      }
    }

    // Check if we already have a BUTTONS component
    if (type === 'BUTTONS') {
      const hasButtonsComponent = formData.components.some(comp => comp.type === 'BUTTONS');
      if (hasButtonsComponent) {
        setErrors(['Templates can only have one buttons component']);
        return;
      }
    }

    const newComponent: TemplateComponent = {
      type,
      text: '',
      variables: []
    };

    setFormData(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  // Remove component
  const removeComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index)
    }));
  };

  // Convert named variables to numbered variables
  const convertNamedVariablesToNumbered = (text: string): string => {
    const namedVariables = (text.match(/\{\{([^}]+)\}\}/g) || [])
      .map(match => match.slice(2, -2).trim())
      .filter(v => !/^\d+$/.test(v)); // Only non-numbered variables
    
    if (namedVariables.length === 0) return text;
    
    let convertedText = text;
    const variableMap = new Map<string, string>();
    let nextNumber = 1;
    
    // Create mapping from named variables to numbers
    namedVariables.forEach(varName => {
      if (!variableMap.has(varName)) {
        variableMap.set(varName, nextNumber.toString());
        nextNumber++;
      }
    });
    
    // Replace named variables with numbered ones
    variableMap.forEach((number, varName) => {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
      convertedText = convertedText.replace(regex, `{{${number}}}`);
    });
    
    return convertedText;
  };

  // Handle text change
  const handleTextChange = (index: number, text: string) => {
    // Convert any named variables to numbered variables
    const convertedText = convertNamedVariablesToNumbered(text);
    
    // Extract numbered variables for Marketing templates
    const variables = (convertedText.match(/\{\{(\d+)\}\}/g) || []).map(match => match.slice(2, -2));
    
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index 
          ? { ...comp, text: convertedText, variables }
          : comp
      )
    }));
  };

  // Handle file upload
  const handleFileUpload = async (index: number, file: File) => {
    try {
      // Here you would implement actual file upload logic
      // For now, we'll simulate a successful upload
      const result = {
        success: true,
        url: URL.createObjectURL(file),
        fileId: `file_${Date.now()}`,
        error: undefined as string | undefined
      };
      
      if (result.success && result.url && result.fileId) {
        setFormData(prev => ({
          ...prev,
          components: prev.components.map((comp, i) => 
            i === index 
              ? { 
                  ...comp, 
                  mediaUrl: result.url, 
                  format: file.type.startsWith('image/') ? 'IMAGE' : 
                          file.type.startsWith('video/') ? 'VIDEO' : 'DOCUMENT',
                  mediaFileName: file.name,
                  mediaFileSize: file.size,
                  mediaStorageId: result.fileId
                }
              : comp
          )
        }));
      } else {
        setErrors([result.error || 'Failed to upload file. Please try again.']);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(['Failed to upload file. Please try again.']);
    }
  };

  // Add button to component
  const addButton = (componentIndex: number) => {
    const currentButtons = formData.components[componentIndex]?.buttons || [];
    
    // Templates allow maximum 3 buttons per template
    if (currentButtons.length >= 3) {
      setErrors(['Templates allow maximum 3 buttons per template']);
      return;
    }

    const newButton: TemplateButton = {
      type: 'QUICK_REPLY',
      text: ''
    };

    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === componentIndex 
          ? { ...comp, buttons: [...(comp.buttons || []), newButton] }
          : comp
      )
    }));
  };

  // Update button
  const updateButton = (componentIndex: number, buttonIndex: number, updates: Partial<TemplateButton>) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === componentIndex 
          ? {
              ...comp,
              buttons: comp.buttons?.map((btn, btnIndex) => 
                btnIndex === buttonIndex ? { ...btn, ...updates } : btn
              )
            }
          : comp
      )
    }));
  };

  // Remove button
  const removeButton = (componentIndex: number, buttonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === componentIndex 
          ? {
              ...comp,
              buttons: comp.buttons?.filter((_, btnIndex) => btnIndex !== buttonIndex)
            }
          : comp
      )
    }));
  };

  // Handle variable selection
  const handleVariableSelect = (variable: string) => {
    const currentText = formData.components[currentComponentIndex]?.text || '';
    const newText = currentText + `{{${variable}}}`;
    handleTextChange(currentComponentIndex, newText);
  };

  // Get all variables from all components
  const getAllVariables = () => {
    const allVars = new Set<string>();
    formData.components.forEach(comp => {
      comp.variables?.forEach(variable => allVars.add(variable));
    });
    return Array.from(allVars);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-50 shadow-sm" style={{ 
        backgroundColor: 'white', 
        position: 'sticky', 
        top: 0,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        <div className="border-b border-gray-200" style={{ backgroundColor: 'white' }}>
          <div className="max-w-7xl mx-auto px-6 py-4" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Template' : 'Create Template'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing ? 'Update your marketing template for WhatsApp and Instagram' : 'Create a marketing template with text, media, and buttons for WhatsApp and Instagram'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  form="template-form"
                  disabled={isSubmitting}
                  onClick={() => setIsIntentionalSubmit(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:from-[#8B7A1A] hover:to-[#5E4E06] transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-4 relative z-40">
          <div className="max-w-7xl mx-auto bg-red-50">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 relative z-10" style={{ paddingTop: '2rem' }}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left side - Form (2/3 width) */}
          <div className="xl:col-span-2 space-y-6">
            <form id="template-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                        placeholder="e.g., summer_sale_promo"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language *
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                        required
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description * <span className="text-sm text-gray-500">(Minimum 10 characters)</span>
                    </label>
                    <textarea
                      value={formData.meta.description}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        meta: { 
                          ...prev.meta, 
                          description: e.target.value 
                        } 
                      }))}
                      placeholder="Describe what this marketing template is used for. This helps Meta understand the template's purpose for promotional campaigns."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none transition-colors"
                      rows={3}
                      maxLength={1024}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Required for Meta template approval. Be specific about the marketing use case.
                      </p>
                      <span className={`text-xs font-medium ${formData.meta.description.length >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.meta.description.length}/10 minimum
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Use Case * <span className="text-sm text-gray-500">(Required for Meta approval)</span>
                    </label>
                    <textarea
                      value={formData.meta.useCase}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        meta: { 
                          ...prev.meta, 
                          useCase: e.target.value 
                        } 
                      }))}
                      placeholder="Describe the specific use case for this marketing template (e.g., 'Summer sale promotion', 'New product launch', 'Customer retention campaign', 'Holiday special offers')"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none transition-colors"
                      rows={2}
                      maxLength={512}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Be specific about when and how this template will be used.
                      </p>
                      <span className="text-xs text-gray-400">
                        {formData.meta.useCase.length}/512
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Components */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Template Components</h2>
                    <button
                      type="button"
                      onClick={() => addComponent('BUTTONS')}
                      disabled={formData.components.some(comp => comp.type === 'BUTTONS')}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-[#F5F2E8] text-[#8B7A1A] rounded-lg hover:bg-[#D4AF37] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add Buttons
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Templates can have one text component and one buttons component (optional)
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {formData.components.map((component, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                            {component.type === 'TEXT' ? (
                              <MessageSquare className="w-4 h-4 text-white" />
                            ) : (
                              <Plus className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{component.type} Component</h3>
                            <p className="text-sm text-gray-500">Component {index + 1}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {component.type !== 'BUTTONS' && (
                        <div className="space-y-4">
                          {/* Text Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {component.type} Content
                            </label>
                            <textarea
                              value={component.text || ''}
                              onChange={(e) => handleTextChange(index, e.target.value)}
                              onFocus={() => setCurrentComponentIndex(index)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-colors"
                              rows={4}
                              placeholder={`Enter ${component.type.toLowerCase()} content. Use {{1}}, {{2}}, etc. for dynamic content (e.g., "Hi {{1}}, get {{2}} off your next order!")`}
                            />
                          </div>

                          {/* Media Upload */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Media (Optional)
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                ref={el => { fileInputRefs.current[index] = el; }}
                                type="file"
                                accept="image/*,video/*,.pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(index, file);
                                }}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[index]?.click()}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Upload className="w-4 h-4" />
                                Upload Media
                              </button>
                              {component.mediaUrl && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  {component.mediaFileName}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Variable Suggestions for this component */}
                          {currentComponentIndex === index && (
                            <VariableSuggestions
                              templateText={component.text || ''}
                              providedVariables={formData.meta.exampleVariables}
                              onVariableSelect={handleVariableSelect}
                              category="MARKETING"
                            />
                          )}

                          {/* Variables Found */}
                          {component.variables && component.variables.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Variables Found
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {component.variables.map((variable, varIndex) => (
                                  <span
                                    key={varIndex}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                                  >
                                    {variable}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Buttons Component */}
                      {component.type === 'BUTTONS' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Template Buttons
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                Templates allow maximum 3 buttons per template
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => addButton(index)}
                              disabled={(component.buttons?.length || 0) >= 3}
                              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#F5F2E8] text-[#8B7A1A] rounded-lg hover:bg-[#D4AF37] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                              Add Button
                            </button>
                          </div>

                          {component.buttons && component.buttons.length > 0 && (
                            <div className="space-y-4">
                              {component.buttons.map((button, buttonIndex) => (
                                <div key={buttonIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">Button {buttonIndex + 1}</h4>
                                    <button
                                      type="button"
                                      onClick={() => removeButton(index, buttonIndex)}
                                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Text *
                                      </label>
                                      <input
                                        type="text"
                                        value={button.text}
                                        onChange={(e) => updateButton(index, buttonIndex, { text: e.target.value })}
                                        placeholder="e.g., Buy Now, Learn More, Contact Us"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Button Type *
                                      </label>
                                      <select
                                        value={button.type}
                                        onChange={(e) => updateButton(index, buttonIndex, { type: e.target.value as 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                      >
                                        <option value="QUICK_REPLY">Quick Reply (Sends text back to business)</option>
                                        <option value="URL">Website Link (Opens URL in browser)</option>
                                        <option value="PHONE_NUMBER">Phone Number (Initiates phone call)</option>
                                      </select>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {button.type === 'QUICK_REPLY' && 'When clicked, sends the button text as a message back to your business'}
                                        {button.type === 'URL' && 'When clicked, opens the specified URL in the user\'s browser'}
                                        {button.type === 'PHONE_NUMBER' && (
                                          <span>
                                            When clicked, initiates a phone call to the specified number.
                                            {formData.platforms?.includes('instagram') && (
                                              <span className="text-amber-600 font-medium"> Note: For Instagram, this will be converted to a tel: link.</span>
                                            )}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                    
                                    {(button.type === 'URL' || button.type === 'PHONE_NUMBER') && (
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          {button.type === 'URL' ? 'Website URL *' : 'Phone Number *'}
                                        </label>
                                        <input
                                          type={button.type === 'URL' ? 'url' : 'tel'}
                                          value={button.url || ''}
                                          onChange={(e) => updateButton(index, buttonIndex, { url: e.target.value })}
                                          placeholder={button.type === 'URL' ? 'https://example.com' : '+1234567890'}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                          {button.type === 'URL' 
                                            ? 'Enter the full URL including https://' 
                                            : 'Enter phone number with country code (e.g., +1234567890)'
                                          }
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Right side - Preview (1/3 width) */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 z-20">
              <SimpleTemplatePreview
                template={formData}
                variables={formData.meta.exampleVariables}
                onVariableClick={(variable) => {
                  console.log('Variable clicked:', variable);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}