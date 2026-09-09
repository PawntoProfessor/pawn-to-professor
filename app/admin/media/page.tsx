import AdminNav from '@/components/AdminNav'
import MediaManager from '@/components/MediaManager'
import {requireAdmin} from '@/lib/admin'
export default async function Media(){await requireAdmin();return <div className="admin-shell"><AdminNav/><main className="admin-main"><div className="admin-head"><div><span className="eyebrow">ADMIN</span><h1>Media Library</h1><p>Upload images and PDFs, then copy their URL into a page or resource.</p></div></div><MediaManager/></main></div>}
