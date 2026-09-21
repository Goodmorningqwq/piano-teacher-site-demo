import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import StyleGuide from '@/pages/StyleGuide'

// The admin panel was retired with the backend (see src/lib/supabase.ts);
// /admin falls through to the home page like any unknown address.

export default function App() {
  return (
    <Routes>
      {/* Same page, two addresses — this is what makes each language
          separately indexable and separately shareable. */}
      <Route path="/" element={<Home />} />
      <Route path="/en" element={<Home />} />
      <Route path="/styleguide" element={<StyleGuide />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
