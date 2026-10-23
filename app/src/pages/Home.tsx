import { useNavigate } from 'react-router-dom'
import { KnowledgeGraph } from '../components/KnowledgeGraph'

export function Home() {
  const navigate = useNavigate()

  return (
    <div className="-mx-4 h-[calc(100svh-7.5rem)] sm:mx-0">
      <KnowledgeGraph
        topicId={null}
        onSelectTopic={(id) => navigate(`/learn?topic=${id}`)}
      />
    </div>
  )
}
