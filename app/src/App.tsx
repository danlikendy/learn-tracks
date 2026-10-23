import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Account } from './pages/Account'
import { Cards } from './pages/Cards'
import { Home } from './pages/Home'
import { ItemPage } from './pages/ItemPage'
import { Learn } from './pages/Learn'
import { NotificationsPage } from './pages/Notifications'
import { Placeholder } from './pages/Placeholder'
import { Roadmaps } from './pages/Roadmaps'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Learn />} />
        <Route path="cards" element={<Cards />} />
        <Route path="item/:id" element={<ItemPage />} />
        <Route path="account" element={<Account />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="community" element={<Placeholder title="Сообщество" />} />
        <Route path="roadmaps" element={<Roadmaps />} />
        <Route path="reviews" element={<Placeholder title="Обзоры" />} />
      </Route>
    </Routes>
  )
}
