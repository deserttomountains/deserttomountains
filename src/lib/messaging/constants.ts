/**
 * Messaging System Constants
 * Predefined tags, groups, and other constants for the messaging system
 */

// Predefined Tags for Contact Categorization
export const PREDEFINED_TAGS = {
  // Interest-based tags
  INTERESTS: [
    'wall-plaster',
    'natural-paint', 
    'eco-friendly',
    'premium-finish',
    'textured-walls',
    'smooth-finish',
    'color-consultation'
  ],
  
  // Customer behavior tags
  BEHAVIOR: [
    'high-value',
    'frequent-buyer',
    'price-sensitive',
    'bulk-purchaser',
    'first-time-buyer',
    'repeat-customer',
    'referral-source'
  ],
  
  // Source-based tags
  SOURCE: [
    'website-lead',
    'google-ads',
    'facebook-ads',
    'instagram-ads',
    'referral',
    'trade-show',
    'walk-in',
    'phone-inquiry'
  ],
  
  // Status-based tags
  STATUS: [
    'vip-customer',
    'new-customer',
    'returning-customer',
    'inactive-customer',
    'potential-customer',
    'quoted-customer'
  ]
};

// Predefined Groups for Contact Organization
export const PREDEFINED_GROUPS = {
  // Geographic groups
  LOCATION: [
    'delhi-customers',
    'mumbai-customers', 
    'bangalore-customers',
    'chennai-customers',
    'kolkata-customers',
    'hyderabad-customers',
    'pune-customers',
    'gurgaon-customers',
    'noida-customers'
  ],
  
  // Business type groups
  BUSINESS_TYPE: [
    'contractors',
    'architects',
    'interior-designers',
    'homeowners',
    'commercial-builders',
    'renovation-specialists',
    'paint-contractors'
  ],
  
  // Service-based groups
  SERVICE: [
    'installation-service',
    'consultation-requested',
    'follow-up-needed',
    'quote-requested',
    'sample-requested',
    'technical-support'
  ],
  
  // Campaign-specific groups
  CAMPAIGN: [
    'summer-promotion',
    'new-product-launch',
    'loyalty-program',
    'seasonal-offer',
    'bulk-discount',
    'referral-program'
  ]
};

// Campaign Types
export const CAMPAIGN_TYPES = [
  { value: 'marketing', label: 'Marketing', description: 'Promotional campaigns to attract new customers' },
  { value: 'announcement', label: 'Announcement', description: 'Important updates and news' },
  { value: 'followup', label: 'Follow-up', description: 'Follow-up messages for leads and customers' },
  { value: 'support', label: 'Support', description: 'Customer support and assistance' },
  { value: 'promotional', label: 'Promotional', description: 'Special offers and discounts' }
] as const;

// Contact Status Options
export const CONTACT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', description: 'Currently engaged customer' },
  { value: 'inactive', label: 'Inactive', description: 'Not recently engaged' },
  { value: 'unsubscribed', label: 'Unsubscribed', description: 'Opted out of communications' },
  { value: 'bounced', label: 'Bounced', description: 'Email/phone not deliverable' }
] as const;

// Channel Types
export const CHANNEL_TYPES = [
  { value: 'whatsapp', label: 'WhatsApp', icon: 'Phone', color: 'text-green-600' },
  { value: 'instagram', label: 'Instagram', icon: 'Instagram', color: 'text-pink-600' },
  { value: 'email', label: 'Email', icon: 'Mail', color: 'text-blue-600' },
  { value: 'multi', label: 'Multi-Channel', icon: 'Users', color: 'text-purple-600' }
] as const;

// Helper function to get all tags as a flat array
export const getAllTags = (): string[] => {
  return [
    ...PREDEFINED_TAGS.INTERESTS,
    ...PREDEFINED_TAGS.BEHAVIOR,
    ...PREDEFINED_TAGS.SOURCE,
    ...PREDEFINED_TAGS.STATUS
  ];
};

// Helper function to get all groups as a flat array
export const getAllGroups = (): string[] => {
  return [
    ...PREDEFINED_GROUPS.LOCATION,
    ...PREDEFINED_GROUPS.BUSINESS_TYPE,
    ...PREDEFINED_GROUPS.SERVICE,
    ...PREDEFINED_GROUPS.CAMPAIGN
  ];
};

// Helper function to get tags by category
export const getTagsByCategory = (category: keyof typeof PREDEFINED_TAGS): string[] => {
  return PREDEFINED_TAGS[category];
};

// Helper function to get groups by category
export const getGroupsByCategory = (category: keyof typeof PREDEFINED_GROUPS): string[] => {
  return PREDEFINED_GROUPS[category];
};

