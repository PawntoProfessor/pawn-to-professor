import AdminManager from '@/components/AdminManager'
import AdminNav from '@/components/AdminNav'
import {requireAdmin} from '@/lib/admin'
export default async function AdminPage(){await requireAdmin();return <div className="admin-shell"><AdminNav/><main className="admin-main"><div className="admin-head"><div><span className="eyebrow">ADMIN</span><h1>Site Manager</h1><p>Add, move, hide or edit your website without touching code.</p></div></div><AdminManager/></main></div>}
