import { BrowserRouter, Route, Routes } from 'react-router'

import { PageLayout } from '~/renderer/PageLayout'

import AboutPage from '~/pages/about/Page'
import BlogDetailPage from '~/pages/blogs/detail/Page'
import BlogListPage from '~/pages/blogs/Page'
import ErrorPage from '~/pages/error/Page'
import IndexPage from '~/pages/index/Page'

export function AppRouter(): React.JSX.Element {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  )
}
