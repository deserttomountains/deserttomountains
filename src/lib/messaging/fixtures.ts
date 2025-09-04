/**
 * Test Fixtures for Local Development
 * Sample webhook payloads for testing
 */

export const whatsappInboundFixture = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '+1234567890',
              phone_number_id: '987654321'
            },
            contacts: [
              {
                profile: {
                  name: 'John Doe'
                },
                wa_id: '1234567890'
              }
            ],
            messages: [
              {
                from: '1234567890',
                id: 'wamid.HBgMMTIzNDU2Nzg5MBUCABIYFjNBMDZCMjQ5QjY1NkI0QjY1NkI0QjY=',
                timestamp: '1703123456',
                type: 'text',
                text: {
                  body: 'Hello! I have a question about your products.'
                }
              }
            ]
          },
          field: 'messages'
        }
      ]
    }
  ]
};

export const instagramInboundFixture = {
  object: 'instagram',
  entry: [
    {
      id: '123456789',
      time: 1703123456,
      messaging: [
        {
          sender: {
            id: '123456789'
          },
          recipient: {
            id: '987654321'
          },
          timestamp: 1703123456,
          message: {
            mid: 'm_ABC123DEF456',
            text: 'Hi! I saw your post and wanted to know more about your services.'
          }
        }
      ]
    }
  ]
};

export const whatsappStatusFixture = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '123456789',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '+1234567890',
              phone_number_id: '987654321'
            },
            statuses: [
              {
                id: 'wamid.HBgMMTIzNDU2Nzg5MBUCABIYFjNBMDZCMjQ5QjY1NkI0QjY1NkI0QjY=',
                status: 'delivered',
                timestamp: '1703123456',
                recipient_id: '1234567890'
              }
            ]
          },
          field: 'messages'
        }
      ]
    }
  ]
};

export const instagramDeliveryFixture = {
  object: 'instagram',
  entry: [
    {
      id: '123456789',
      time: 1703123456,
      delivery: [
        {
          sender: {
            id: '987654321'
          },
          recipient: {
            id: '123456789'
          },
          delivery: {
            mids: ['m_ABC123DEF456'],
            watermark: 1703123456
          }
        }
      ]
    }
  ]
};

export const instagramReadFixture = {
  object: 'instagram',
  entry: [
    {
      id: '123456789',
      time: 1703123456,
      read: [
        {
          sender: {
            id: '123456789'
          },
          recipient: {
            id: '987654321'
          },
          read: {
            watermark: 1703123456
          }
        }
      ]
    }
  ]
};

export const instagramPostbackFixture = {
  object: 'instagram',
  entry: [
    {
      id: '123456789',
      time: 1703123456,
      postback: [
        {
          sender: {
            id: '123456789'
          },
          recipient: {
            id: '987654321'
          },
          timestamp: 1703123456,
          postback: {
            payload: 'GET_STARTED',
            title: 'Get Started'
          }
        }
      ]
    }
  ]
};

export const instagramReactionFixture = {
  object: 'instagram',
  entry: [
    {
      id: '123456789',
      time: 1703123456,
      reaction: [
        {
          sender: {
            id: '123456789'
          },
          recipient: {
            id: '987654321'
          },
          timestamp: 1703123456,
          reaction: {
            mid: 'm_ABC123DEF456',
            action: 'react',
            emoji: '❤️'
          }
        }
      ]
    }
  ]
};
