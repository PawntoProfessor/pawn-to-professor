import AdminNav from '@/components/AdminNav'
import TrashManager from '@/components/TrashManager'
import {requireAdmin} from '@/lib/admin'
export default async function Trash(){await requireAdmin();return <div className="admin-shell"><AdminNav/><main className="admin-main"><div className="admin-head"><div><span className="eyebrow">ADMIN</span><h1>Trash</h1><p>Restore things you removed by mistake.</p></div></div><TrashManager/></main></div>}
