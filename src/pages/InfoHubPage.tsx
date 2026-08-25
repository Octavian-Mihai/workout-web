import { useNavigate } from 'react-router-dom'
import { infoArticles } from '../content/info/articles'
import { Card } from '../components/ui/Card'
import { PageShell } from '../components/layout/PageShell'

export function InfoHubPage() {
  const navigate = useNavigate()

  return (
    <PageShell title="Info">
      <div className="space-y-3">
        {Object.entries(infoArticles).map(([slug, article]) => (
          <Card key={slug} onClick={() => navigate(`/info/${slug}`)}>
            <h2 className="text-sm font-semibold">{article.title}</h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{article.summary}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
