'use client'

import { memo } from 'react'

interface JsonLdProps {
  data: Record<string, unknown>
}

export const JsonLd = memo(function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
})
