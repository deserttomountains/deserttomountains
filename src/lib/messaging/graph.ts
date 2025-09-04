/**
 * Graph API Client
 * Handles communication with Meta's Graph API for WhatsApp and Instagram
 */

export interface GraphApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}

export interface GraphApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Fetch from Graph API with retry logic and error handling
 */
export async function fetchGraph<T = any>(
  path: string,
  options: GraphApiRequestOptions = {}
): Promise<GraphApiResponse<T>> {
  const {
    method = 'GET',
    body,
    token,
    retryCount = 0,
    maxRetries = 3
  } = options;

  const accessToken = token || getDefaultAccessToken();
  if (!accessToken) {
    throw new Error('No access token available for Graph API');
  }

  const url = `https://graph.facebook.com/v18.0/${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const response = await fetch(url, requestOptions);
    const responseData = await response.json();

    // Handle rate limiting
    if (response.status === 429 && retryCount < maxRetries) {
      const retryAfter = response.headers.get('Retry-After');
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
      
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchGraph(path, {
        ...options,
        retryCount: retryCount + 1,
        maxRetries
      });
    }

    // Handle server errors with exponential backoff
    if (response.status >= 500 && retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Server error ${response.status}, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchGraph(path, {
        ...options,
        retryCount: retryCount + 1,
        maxRetries
      });
    }

    // Handle client errors (no retry)
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      console.error(`Graph API client error: ${response.status}`, responseData);
      return responseData;
    }

    return responseData;
  } catch (error) {
    console.error('Graph API request failed:', error);
    
    // Retry network errors
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`Network error, retrying in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchGraph(path, {
        ...options,
        retryCount: retryCount + 1,
        maxRetries
      });
    }
    
    throw error;
  }
}

/**
 * Get default access token from environment
 */
function getDefaultAccessToken(): string | null {
  return process.env.WHATSAPP_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || null;
}

/**
 * Send WhatsApp text message
 */
export async function sendWhatsAppText(
  phoneNumberId: string,
  to: string,
  text: string
): Promise<GraphApiResponse<{ messaging_product: string; messages: Array<{ id: string }> }>> {
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: {
      body: text
    }
  };

  return fetchGraph(`${phoneNumberId}/messages`, {
    method: 'POST',
    body
  });
}

/**
 * Send WhatsApp template message
 */
export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  to: string,
  templateName: string,
  language: string,
  components?: any[]
): Promise<GraphApiResponse<{ messaging_product: string; messages: Array<{ id: string }> }>> {
  const body: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: language
      }
    }
  };

  if (components && components.length > 0) {
    body.template.components = components;
  }

  return fetchGraph(`${phoneNumberId}/messages`, {
    method: 'POST',
    body
  });
}

/**
 * Send Instagram reply
 */
export async function sendInstagramReply(
  conversationId: string,
  text: string
): Promise<GraphApiResponse<{ message_id: string }>> {
  const body = {
    message: text
  };

  return fetchGraph(`${conversationId}/messages`, {
    method: 'POST',
    body,
    token: process.env.INSTAGRAM_ACCESS_TOKEN
  });
}

/**
 * Get WhatsApp phone number details
 */
export async function getWhatsAppPhoneNumber(
  phoneNumberId: string
): Promise<GraphApiResponse<{
  id: string;
  display_phone_number: string;
  verified_name: string;
  code_verification_status: string;
  quality_rating: string;
}>> {
  return fetchGraph(phoneNumberId, {
    method: 'GET'
  });
}

/**
 * Get Instagram conversation details
 */
export async function getInstagramConversation(
  conversationId: string
): Promise<GraphApiResponse<{
  id: string;
  participants: Array<{ id: string; username: string }>;
  updated_time: string;
}>> {
  return fetchGraph(conversationId, {
    method: 'GET',
    token: process.env.INSTAGRAM_ACCESS_TOKEN
  });
}

/**
 * Log Graph API usage for monitoring
 */
export function logGraphApiUsage(
  endpoint: string,
  method: string,
  success: boolean,
  error?: string
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    success,
    error
  };
  
  console.log(`Graph API Usage: ${JSON.stringify(logData)}`);
}
