import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          SEO Toolkit
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
          Comprehensive SEO analysis and optimization tools
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <Link href="/metadata-analyzer">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Metadata Analyzer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload or link to an XML sitemap to analyze metadata across all pages. Extract, edit, and export metadata in bulk.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>Parse XML sitemaps</li>
              <li>Extract metadata from pages</li>
              <li>Bulk edit capabilities</li>
              <li>CSV export</li>
            </ul>
          </div>
        </Link>

        <Link href="/lighthouse">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Lighthouse Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Run Lighthouse audits on your pages and track performance, accessibility, best practices, and SEO scores over time.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>On-demand audits</li>
              <li>Historical tracking</li>
              <li>Score visualization</li>
              <li>Performance insights</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  )
}

