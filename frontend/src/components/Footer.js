export const Footer = () => {
    return <>
        <footer className="border-t border-white/10 bg-slate-950/40">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">© {new Date().getFullYear()} Your DAO. All rights reserved.</p>
                    <div className="text-xs text-slate-500">MIT Licensed</div>
                </div>
            </div>
        </footer>
    </>
}