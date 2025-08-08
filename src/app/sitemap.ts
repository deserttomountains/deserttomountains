import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://deserttomountains.com'
  const currentDate = new Date()

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
      images: [
        `${baseUrl}/images/deserttomountains-4-scaled-1.webp`,
        `${baseUrl}/images/aura-on-site-1-1.webp`,
        `${baseUrl}/images/dhunee_1.webp`,
        `${baseUrl}/images/aura_1.webp`
      ]
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [
        `${baseUrl}/images/founder.jpg`,
        `${baseUrl}/images/aura.webp`
      ]
    },
    {
      url: `${baseUrl}/aura`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [
        `${baseUrl}/images/aura.webp`,
        `${baseUrl}/images/aura_1.webp`,
        `${baseUrl}/images/aura-on-site-1-1.webp`
      ]
    },
    {
      url: `${baseUrl}/dhunee`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
      images: [
        `${baseUrl}/images/dhunee.webp`,
        `${baseUrl}/images/dhunee_1.webp`,
        `${baseUrl}/images/dhunee_2.webp`
      ]
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      images: [
        `${baseUrl}/images/deserttomountains-4-scaled-1.webp`
      ]
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
      images: [
        `${baseUrl}/images/gallery/1.webp`,
        `${baseUrl}/images/gallery/2.webp`,
        `${baseUrl}/images/gallery/3.webp`,
        `${baseUrl}/images/gallery/4.webp`,
        `${baseUrl}/images/gallery/5.webp`,
        `${baseUrl}/images/gallery/6.webp`,
        `${baseUrl}/images/gallery/7.webp`,
        `${baseUrl}/images/gallery/8.webp`,
        `${baseUrl}/images/gallery/9.webp`,
        `${baseUrl}/images/gallery/10.webp`,
        `${baseUrl}/images/gallery/11.webp`,
        `${baseUrl}/images/gallery/12.webp`,
        `${baseUrl}/images/gallery/13.webp`,
        `${baseUrl}/images/gallery/14.webp`,
        `${baseUrl}/images/gallery/15.webp`,
        `${baseUrl}/images/gallery/16.webp`,
        `${baseUrl}/images/gallery/17.webp`,
        `${baseUrl}/images/gallery/18.webp`,
        `${baseUrl}/images/gallery/19.webp`,
        `${baseUrl}/images/gallery/20.webp`,
        `${baseUrl}/images/gallery/21.webp`,
        `${baseUrl}/images/gallery/22.webp`,
        `${baseUrl}/images/gallery/23.webp`,
        `${baseUrl}/images/gallery/24.webp`,
        `${baseUrl}/images/gallery/25.webp`,
        `${baseUrl}/images/gallery/26.webp`,
        `${baseUrl}/images/gallery/27.webp`,
        `${baseUrl}/images/gallery/28.webp`,
        `${baseUrl}/images/gallery/29.webp`,
        `${baseUrl}/images/gallery/30.webp`,
        `${baseUrl}/images/gallery/31.webp`,
        `${baseUrl}/images/gallery/32.webp`,
        `${baseUrl}/images/gallery/33.webp`
      ]
    },
    {
      url: `${baseUrl}/franchise`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: [
        `${baseUrl}/images/deserttomountains-4-scaled-1.webp`
      ]
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
      images: [
        `${baseUrl}/images/gallery/2.webp`
      ]
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
      images: [
        `${baseUrl}/images/about_page_img.jpg`
      ]
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
      images: [
        `${baseUrl}/images/gallery/4.webp`
      ]
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
      images: [
        `${baseUrl}/images/gallery/5.webp`
      ]
    },
  ]
}
