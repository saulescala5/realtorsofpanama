import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import './index.css'
import { I18nProvider } from './i18n'
import { StoreProvider } from './lib/store'
import { PublicLayout } from './components/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import PropertyDetail from './pages/PropertyDetail'
import ListProperty from './pages/ListProperty'
import Contact from './pages/Contact'
import Network from './pages/Network'
import Saved from './pages/Saved'
import { GuideList, GuidePage } from './pages/Guides'
import { NeighborhoodList, NeighborhoodPage } from './pages/Neighborhoods'
import Auth from './pages/Auth'
import AdminLayout from './pages/admin/AdminLayout'
import Overview from './pages/admin/Overview'
import Listings from './pages/admin/Listings'
import ListingEditor from './pages/admin/ListingEditor'
import ImportPackage from './pages/admin/ImportPackage'
import Leads from './pages/admin/Leads'

const OldLink = () => <Navigate to={`/property/${useParams().id}`} replace />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="properties" element={<Explore />} />
              <Route path="property/:id" element={<PropertyDetail />} />
              <Route path="p/:id" element={<OldLink />} />
              <Route path="list-your-property" element={<ListProperty />} />
              <Route path="contact" element={<Contact />} />
              <Route path="work-with-us" element={<Network />} />
              <Route path="guides" element={<GuideList />} />
              <Route path="guides/:slug" element={<GuidePage />} />
              <Route path="saved" element={<Saved />} />
              <Route path="neighborhoods" element={<NeighborhoodList />} />
              <Route path="neighborhoods/:slug" element={<NeighborhoodPage />} />
            </Route>
            <Route path="login" element={<Auth />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="listings" element={<Listings />} />
              <Route path="listings/new" element={<ListingEditor />} />
              <Route path="listings/import" element={<ImportPackage />} />
              <Route path="listings/:id" element={<ListingEditor />} />
              <Route path="clients" element={<Leads />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </I18nProvider>
  </StrictMode>,
)
