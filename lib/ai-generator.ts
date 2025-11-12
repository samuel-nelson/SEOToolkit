// AI-powered metadata generation using Grok API (X.AI)

export interface AIGenerationOptions {
  apiKey: string
  url: string
  currentTitle?: string
  currentDescription?: string
  h1?: string
  keywords?: string[]
}

export interface AIGeneratedMetadata {
  title: string
  description: string
  suggestions?: string[]
}

export async function generateMetadataWithAI(options: AIGenerationOptions): Promise<AIGeneratedMetadata> {
  const { apiKey, url, currentTitle, currentDescription, h1, keywords } = options

  if (!apiKey) {
    throw new Error('Grok API key is required')
  }

  // Extract domain and path for context
  const urlObj = new URL(url)
  const domain = urlObj.hostname
  const path = urlObj.pathname

  const prompt = `You are an SEO expert. Generate an optimized title and meta description for this webpage:

URL: ${url}
Domain: ${domain}
Path: ${path}
${currentTitle ? `Current Title: ${currentTitle}` : ''}
${currentDescription ? `Current Description: ${currentDescription}` : ''}
${h1 ? `H1 Tag: ${h1}` : ''}
${keywords && keywords.length > 0 ? `Keywords: ${keywords.join(', ')}` : ''}

Requirements:
- Title: 30-60 characters, compelling and keyword-rich
- Description: 120-160 characters, engaging and includes a call-to-action
- Both should be unique, relevant to the page content, and optimized for search engines

Return a JSON object with this structure:
{
  "title": "optimized title here",
  "description": "optimized description here",
  "suggestions": ["suggestion 1", "suggestion 2"]
}`

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert specializing in creating optimized meta titles and descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from AI')
    }

    // Try to parse JSON from the response
    let parsed: AIGeneratedMetadata
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
      const jsonText = jsonMatch ? jsonMatch[1] : content
      parsed = JSON.parse(jsonText.trim())
    } catch {
      // If JSON parsing fails, try to extract title and description from text
      const titleMatch = content.match(/title["\s:]+"([^"]+)"/i) || content.match(/Title: (.+)/i)
      const descMatch = content.match(/description["\s:]+"([^"]+)"/i) || content.match(/Description: (.+)/i)
      
      parsed = {
        title: titleMatch?.[1] || currentTitle || 'Generated Title',
        description: descMatch?.[1] || currentDescription || 'Generated Description'
      }
    }

    return parsed
  } catch (error) {
    throw new Error(`Failed to generate metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

