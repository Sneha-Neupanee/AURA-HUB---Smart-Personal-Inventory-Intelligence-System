import Sidebar from './Sidebar'
import Topbar from './Topbar'

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <Topbar />
                <main className="flex-1 p-8 animate-fade-in overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout
