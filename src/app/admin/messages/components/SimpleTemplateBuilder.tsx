/**
 * Simplified Template Builder Component
 * Allows users to create and edit custom WhatsApp templates with simple text content
 */

'use client';

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  Upload,
  Image,
  Video,
  File,
  Plus,
  Trash2,
  Link,
  Phone
} from 'lucide-react';
import { 
  TemplateRequest, 
  CreateTemplateRequest,
  TemplateButton
} from '@/lib/messaging/template-management';
import { validateTemplate } from '@/lib/messaging/template-management';
import VariableSuggestions from './VariableSuggestions';
import AdvancedTemplatePreview from './AdvancedTemplatePreview';

interface SimpleTemplateBuilderProps {
  template?: TemplateRequest;
  onSave: (template: CreateTemplateRequest) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function SimpleTemplateBuilder({
  template,
  onSave,
  onCancel,
  isEditing = false
}: SimpleTemplateBuilderProps) {
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: template?.name || '',
    language: template?.language || 'en',
    category: template?.category || 'UTILITY',
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
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentComponentIndex, setCurrentComponentIndex] = useState<number>(0);

  // Validate form
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    // Validate description length
    if (!formData.meta.description || formData.meta.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    // Validate use case
    if (!formData.meta.useCase || formData.meta.useCase.trim().length === 0) {
      errors.push('Use case is required for WhatsApp template approval');
    }
    
    // Run main template validation
    const validation = validateTemplate(formData);
    errors.push(...validation.errors);
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
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
    }
  };

  // Handle text change
  const handleTextChange = (index: number, value: string) => {
    // Extract variables from text
    const variables = (value.match(/\{\{([^}]+)\}\}/g) || [])
      .map(match => match.slice(2, -2).trim())
      .filter((variable, idx, arr) => arr.indexOf(variable) === idx);

    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === index 
          ? { ...comp, text: value, variables }
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

  // Handle media upload with validation and Firebase Storage
  const handleMediaUpload = async (file: File) => {
    // File size validation (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setErrors([`File size must be less than 2MB. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`]);
      return;
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors([`File type not supported. Allowed types: Images (JPEG, PNG, GIF, WebP), Videos (MP4, AVI, MOV), Documents (PDF, DOC, DOCX)`]);
      return;
    }

    // Clear previous errors
    setErrors([]);

    try {
      // Use Firebase Storage for production
      const { fileStorage } = await import('@/lib/storage/file-storage');
      
      // Upload to Firebase Storage
      const result = await fileStorage.uploadFile(file, `templates/media/${Date.now()}_${file.name}`);
      
      if (result.success && result.url && result.fileId) {
        setFormData(prev => ({
          ...prev,
          components: prev.components.map((comp, i) => 
            i === 0 // Simple builder only has one text component
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

  // Add button to the text component
  const addButton = () => {
    const currentButtons = formData.components[0]?.buttons || [];
    
    // WhatsApp allows maximum 3 buttons per template
    if (currentButtons.length >= 3) {
      setErrors(['WhatsApp allows maximum 3 buttons per template']);
      return;
    }

    const newButton: TemplateButton = {
      type: 'QUICK_REPLY',
      text: ''
    };

    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === 0 // Simple builder only has one text component
          ? { ...comp, buttons: [...(comp.buttons || []), newButton] }
          : comp
      )
    }));
  };

  // Update button
  const updateButton = (buttonIndex: number, updates: Partial<TemplateButton>) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === 0 // Simple builder only has one text component
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
  const removeButton = (buttonIndex: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.map((comp, i) => 
        i === 0 // Simple builder only has one text component
          ? {
              ...comp,
              buttons: comp.buttons?.filter((_, btnIndex) => btnIndex !== buttonIndex)
            }
          : comp
      )
    }));
  };

  // Get current template text
  const currentTemplateText = formData.components[0]?.text || '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Template' : 'Create New Template'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Update your WhatsApp template' : 'Create a new WhatsApp template for messaging'}
        </p>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                placeholder="e.g., order_confirmation"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                required
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'UTILITY' | 'MARKETING' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                required
              >
                <option value="UTILITY">Utility (Order-related)</option>
                <option value="MARKETING">Marketing (Promotional)</option>
              </select>
            </div>

          </div>

          {/* Description Field */}
          <div className="mt-6">
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
              placeholder="Describe what this template is used for. This helps WhatsApp understand the template's purpose."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none"
              rows={3}
              maxLength={1024}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Required for WhatsApp template approval. Be specific about the use case.
              </p>
              <span className={`text-xs ${formData.meta.description.length >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                {formData.meta.description.length}/10 minimum
              </span>
            </div>
          </div>

          {/* Use Case Field */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Use Case * <span className="text-sm text-gray-500">(Required for WhatsApp approval)</span>
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
              placeholder="Describe the specific use case for this template (e.g., 'Order confirmation notifications', 'Shipping updates', 'Welcome messages for new customers')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] resize-none"
              rows={2}
              maxLength={512}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                Specify the exact purpose and context for using this template.
              </p>
              <span className="text-xs text-gray-500">
                {formData.meta.useCase.length}/512 characters
              </span>
            </div>
          </div>
        </div>

        {/* Template Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Template Content</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Text *
              </label>
              <textarea
                value={currentTemplateText}
                onChange={(e) => handleTextChange(0, e.target.value)}
                onFocus={() => setCurrentComponentIndex(0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                rows={6}
                placeholder={`Enter your message text. Use {{variable_name}} for dynamic content.

Examples:
• Order Confirmation: Hello {{customer_name}}, your order {{order_id}} has been confirmed.
• Status Update: Hello {{customer_name}}, your order {{order_id}} status is {{order_status}}.
• Delivery Update: Hello {{customer_name}}, your order {{order_id}} will be delivered by {{estimated_delivery}}.`}
                required
              />
            </div>

            {/* Variable Suggestions */}
            <VariableSuggestions
              templateText={currentTemplateText}
              providedVariables={formData.meta.exampleVariables}
              onVariableSelect={handleVariableSelect}
              category={formData.category}
            />

            {/* Variables Found */}
            {formData.components[0]?.variables && formData.components[0].variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variables Found
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.components[0].variables.map((variable, varIndex) => (
                    <span
                      key={varIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Upload (Optional) - Max 2MB
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaUpload(file);
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Media
                  </button>
                  <span className="text-xs text-gray-500">
                    Supported: Images (JPEG, PNG, GIF, WebP), Videos (MP4, AVI, MOV), Documents (PDF, DOC, DOCX)
                  </span>
                </div>
                
                {formData.components[0]?.mediaUrl && (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      {formData.components[0]?.format === 'IMAGE' && <Image className="w-4 h-4" />}
                      {formData.components[0]?.format === 'VIDEO' && <Video className="w-4 h-4" />}
                      {formData.components[0]?.format === 'DOCUMENT' && <File className="w-4 h-4" />}
                      <span className="font-medium">
                        {(formData.components[0] as any)?.mediaFileName || 'Media uploaded'}
                      </span>
                      {(formData.components[0] as any)?.mediaFileSize && (
                        <span className="text-xs text-green-600">
                          ({((formData.components[0] as any).mediaFileSize / (1024 * 1024)).toFixed(2)}MB)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          components: prev.components.map((comp, i) => 
                            i === 0 
                              ? { ...comp, mediaUrl: undefined, format: undefined, mediaFileName: undefined, mediaFileSize: undefined }
                              : comp
                          )
                        }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Template Buttons (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    WhatsApp allows maximum 3 buttons per template
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addButton}
                  disabled={(formData.components[0]?.buttons?.length || 0) >= 3}
                  className="flex items-center gap-1 px-3 py-2 text-sm bg-[#F5F2E8] text-[#8B7A1A] rounded hover:bg-[#D4AF37] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Button ({(formData.components[0]?.buttons?.length || 0)}/3)
                </button>
              </div>

              {formData.components[0]?.buttons && formData.components[0].buttons.length > 0 ? (
                <div className="space-y-3">
                  {formData.components[0].buttons.map((button, buttonIndex) => (
                    <div key={buttonIndex} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {button.type === 'QUICK_REPLY' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                          {button.type === 'URL' && <Link className="w-4 h-4 text-green-600" />}
                          {button.type === 'PHONE_NUMBER' && <Phone className="w-4 h-4 text-purple-600" />}
                          <span className="text-sm font-medium text-gray-700">
                            Button {buttonIndex + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeButton(buttonIndex)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Button Type
                          </label>
                          <select
                            value={button.type}
                            onChange={(e) => updateButton(buttonIndex, { type: e.target.value as any })}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                          >
                            <option value="QUICK_REPLY">Quick Reply</option>
                            <option value="URL">URL</option>
                            <option value="PHONE_NUMBER">Phone Number</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Button Text (Max 25 characters)
                          </label>
                          <input
                            type="text"
                            value={button.text}
                            onChange={(e) => updateButton(buttonIndex, { text: e.target.value })}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            placeholder="Click here"
                            maxLength={25}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {button.text?.length || 0}/25 characters
                          </div>
                        </div>
                      </div>
                      
                      {button.type === 'URL' && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            URL
                          </label>
                          <input
                            type="url"
                            value={button.url || ''}
                            onChange={(e) => updateButton(buttonIndex, { url: e.target.value })}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            placeholder="https://example.com"
                          />
                        </div>
                      )}
                      
                      {button.type === 'PHONE_NUMBER' && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={button.phone_number || ''}
                            onChange={(e) => updateButton(buttonIndex, { phone_number: e.target.value })}
                            className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                            placeholder="+1234567890"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No buttons added yet.</p>
                  <p className="text-xs mt-1">Click "Add Button" to create interactive buttons</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-[#8B7A1A] bg-[#F5F2E8] rounded-md hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-md hover:from-[#8B7A1A] hover:to-[#5E4E06] transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </div>
      </form>

      {/* Preview */}
      {showPreview && (
        <div className="mt-8">
          <AdvancedTemplatePreview
            template={{
              name: formData.name,
              category: formData.category,
              language: formData.language,
              description: formData.meta.description,
              requiredVars: formData.components[0]?.variables || [],
              exampleContent: '',
              useCase: formData.meta.useCase,
              targetAudience: ''
            }}
            variables={formData.meta.exampleVariables}
            onVariableClick={(variable) => {
              console.log('Variable clicked:', variable);
            }}
            onCopy={(content) => {
              console.log('Copied to clipboard:', content);
            }}
            onExport={(format) => {
              console.log('Exported as:', format);
            }}
          />
        </div>
      )}
    </div>
  );
}
