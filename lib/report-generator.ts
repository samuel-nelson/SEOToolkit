import { PageMetadata } from '@/types'
import { analyzeSEO, findDuplicates } from './seo-optimizer'
import { analyzeKeywords } from './keyword-analyzer'
import { analyzeContentQuality } from './content-analyzer'
import { analyzeTechnicalSEO } from './technical-seo'
import { generateSEOChecklist } from './seo-checklist'

export interface SEOReport {
  generatedAt: string
  totalPages: number
  summary: {
    averageScore: number
    pagesWithIssues: number
    totalIssues: number
    duplicateContent: number
  }
  pages: Array<{
    url: string
    score: number
    issues: string[]
    recommendations: string[]
  }>
  duplicates: Array<{
    type: string
    pages: number[]
  }>
}

export function generateSEOReport(metadata: PageMetadata[]): SEOReport {
  const analyses = metadata.map(m => analyzeSEO(m))
  const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
  const duplicates = findDuplicates(metadata)
  const checklists = metadata.map(m => generateSEOChecklist(m))
  
  const pagesWithIssues = analyses.filter(a => a.issues.length > 0).length
  const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0)
  
  const pages = metadata.map((meta, idx) => {
    const seoAnalysis = analyses[idx]
    const keywordAnalysis = analyzeKeywords(meta)
    const contentQuality = analyzeContentQuality(meta)
    const technicalSEO = analyzeTechnicalSEO(meta)
    const checklist = checklists[idx]
    
    const allIssues = [
      ...seoAnalysis.issues,
      ...contentQuality.issues,
      ...technicalSEO.suggestions.filter(s => s.includes('Add') || s.includes('Missing'))
    ]
    
    const allRecommendations = [
      ...seoAnalysis.suggestions,
      ...keywordAnalysis.suggestions,
      ...contentQuality.suggestions,
      ...technicalSEO.suggestions
    ]
    
    return {
      url: meta.url,
      score: checklist.score,
      issues: allIssues,
      recommendations: allRecommendations
    }
  })
  
  const duplicateList = Array.from(duplicates.entries()).map(([type, indices]) => ({
    type,
    pages: indices
  }))
  
  return {
    generatedAt: new Date().toISOString(),
    totalPages: metadata.length,
    summary: {
      averageScore: avgScore,
      pagesWithIssues,
      totalIssues,
      duplicateContent: duplicateList.length
    },
    pages,
    duplicates: duplicateList
  }
}

export function exportReportAsHTML(report: SEOReport): string {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Audit Report - ${new Date(report.generatedAt).toLocaleDateString()}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      font-weight: normal;
    }
    .summary-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    .page-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .page-card h3 {
      margin: 0 0 10px 0;
      color: #2563eb;
    }
    .score {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .score-high { background: #d1fae5; color: #065f46; }
    .score-medium { background: #fef3c7; color: #92400e; }
    .score-low { background: #fee2e2; color: #991b1b; }
    .issues, .recommendations {
      margin-top: 15px;
    }
    .issues h4, .recommendations h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
    }
    ul {
      margin: 0;
      padding-left: 20px;
    }
    li {
      margin: 5px 0;
    }
    .duplicates {
      background: #fef3c7;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SEO Audit Report</h1>
    <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <div class="summary-card">
      <h3>Total Pages</h3>
      <div class="value">${report.totalPages}</div>
    </div>
    <div class="summary-card">
      <h3>Average SEO Score</h3>
      <div class="value">${report.summary.averageScore}/100</div>
    </div>
    <div class="summary-card">
      <h3>Pages with Issues</h3>
      <div class="value">${report.summary.pagesWithIssues}</div>
    </div>
    <div class="summary-card">
      <h3>Total Issues</h3>
      <div class="value">${report.summary.totalIssues}</div>
    </div>
  </div>
  
  ${report.duplicates.length > 0 ? `
  <div class="duplicates">
    <h3>⚠️ Duplicate Content Detected</h3>
    ${report.duplicates.map(dup => `
      <p><strong>${dup.type}</strong> - Found on pages: ${dup.pages.map(p => `#${p + 1}`).join(', ')}</p>
    `).join('')}
  </div>
  ` : ''}
  
  <h2>Page-by-Page Analysis</h2>
  ${report.pages.map((page, idx) => {
    const scoreClass = page.score >= 80 ? 'score-high' : page.score >= 60 ? 'score-medium' : 'score-low'
    return `
    <div class="page-card">
      <h3>${page.url}</h3>
      <div class="score ${scoreClass}">SEO Score: ${page.score}/100</div>
      ${page.issues.length > 0 ? `
      <div class="issues">
        <h4>Issues (${page.issues.length})</h4>
        <ul>
          ${page.issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
      ${page.recommendations.length > 0 ? `
      <div class="recommendations">
        <h4>Recommendations (${page.recommendations.length})</h4>
        <ul>
          ${page.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    `
  }).join('')}
</body>
</html>`
  
  return html
}

export function exportReportAsText(report: SEOReport): string {
  let text = `SEO AUDIT REPORT
Generated: ${new Date(report.generatedAt).toLocaleString()}
${'='.repeat(60)}

SUMMARY
${'-'.repeat(60)}
Total Pages: ${report.totalPages}
Average SEO Score: ${report.summary.averageScore}/100
Pages with Issues: ${report.summary.pagesWithIssues}
Total Issues: ${report.summary.totalIssues}
Duplicate Content Issues: ${report.summary.duplicateContent}

${report.duplicates.length > 0 ? `
DUPLICATE CONTENT
${'-'.repeat(60)}
${report.duplicates.map(dup => `${dup.type} - Pages: ${dup.pages.map(p => `#${p + 1}`).join(', ')}`).join('\n')}

` : ''}
PAGE-BY-PAGE ANALYSIS
${'='.repeat(60)}

${report.pages.map((page, idx) => `
Page ${idx + 1}: ${page.url}
SEO Score: ${page.score}/100
${'-'.repeat(60)}
${page.issues.length > 0 ? `
Issues (${page.issues.length}):
${page.issues.map((issue, i) => `  ${i + 1}. ${issue}`).join('\n')}
` : 'No issues found.'}

${page.recommendations.length > 0 ? `
Recommendations (${page.recommendations.length}):
${page.recommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join('\n')}
` : ''}
`).join('\n')}`
  
  return text
}

export function downloadReport(report: SEOReport, format: 'html' | 'text' = 'html') {
  const content = format === 'html' 
    ? exportReportAsHTML(report)
    : exportReportAsText(report)
  
  const blob = new Blob([content], { 
    type: format === 'html' ? 'text/html' : 'text/plain' 
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = `seo-audit-report-${new Date().toISOString().split('T')[0]}.${format === 'html' ? 'html' : 'txt'}`
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

