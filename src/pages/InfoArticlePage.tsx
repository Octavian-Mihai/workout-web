import { Link, useParams } from 'react-router-dom'
import { infoArticles, type InfoArticleSlug } from '../content/info/articles'
import { Card } from '../components/ui/Card'
import { PageShell } from '../components/layout/PageShell'

export function InfoArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? infoArticles[slug as InfoArticleSlug] : undefined

  if (!article) {
    return (
      <PageShell title="Not Found" showNav={false}>
        <p className="text-sm text-[var(--text-secondary)]">Article not found.</p>
        <Link to="/info" className="mt-2 inline-block text-sm" style={{ color: 'var(--accent)' }}>
          ← Back to Info
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell title={article.title} showNav={false}>
      <Link to="/info" className="mb-4 inline-block text-xs" style={{ color: 'var(--accent)' }}>
        ← Back to Info
      </Link>
      <div className="space-y-4">
        {article.sections.map((section) => (
          <Card key={section.heading}>
            <h2 className="text-sm font-semibold">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{section.body}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
