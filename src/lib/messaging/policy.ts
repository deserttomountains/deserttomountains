/**
 * Messaging Policy Helpers
 * Handles WhatsApp and Instagram messaging window policies
 */

export interface MessagingWindow {
  lastInboundAt: Date;
  adClickAt?: Date;
}

export interface SendPayload {
  text?: string;
  template?: {
    name: string;
    lang: string;
    vars: Record<string, string>;
  };
}

/**
 * Check if within 24-hour customer care window
 */
export function withinCustomerCareWindow(lastInboundAt: Date): boolean {
  const now = new Date();
  const windowEnd = new Date(lastInboundAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  return now <= windowEnd;
}

/**
 * Check if within 72-hour ad grace window
 */
export function withinAdGraceWindow(adClickAt?: Date): boolean {
  if (!adClickAt) return false;
  
  const now = new Date();
  const windowEnd = new Date(adClickAt.getTime() + 72 * 60 * 60 * 1000); // 72 hours
  return now <= windowEnd;
}

/**
 * Check if freeform messaging is allowed
 */
export function canSendFreeform(
  now: Date,
  lastInboundAt: Date,
  adClickAt?: Date
): boolean {
  return withinCustomerCareWindow(lastInboundAt) || withinAdGraceWindow(adClickAt);
}

/**
 * Guard send operation based on messaging policies
 */
export function guardSend({
  now,
  lastInboundAt,
  adClickAt,
  payload
}: {
  now: Date;
  lastInboundAt: Date;
  adClickAt?: Date;
  payload: SendPayload;
}): void {
  // Templates are always allowed
  if (payload.template) {
    return;
  }

  // Freeform messages need to be within window
  if (payload.text && !canSendFreeform(now, lastInboundAt, adClickAt)) {
    throw new Error(
      'Freeform messaging outside allowed window. Use templates for outbound messages.'
    );
  }
}

/**
 * Get remaining time in customer care window
 */
export function getCustomerCareWindowRemaining(lastInboundAt: Date): number {
  const now = new Date();
  const windowEnd = new Date(lastInboundAt.getTime() + 24 * 60 * 60 * 1000);
  return Math.max(0, windowEnd.getTime() - now.getTime());
}

/**
 * Get remaining time in ad grace window
 */
export function getAdGraceWindowRemaining(adClickAt?: Date): number {
  if (!adClickAt) return 0;
  
  const now = new Date();
  const windowEnd = new Date(adClickAt.getTime() + 72 * 60 * 60 * 1000);
  return Math.max(0, windowEnd.getTime() - now.getTime());
}
