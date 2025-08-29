import * as React from 'react';

export const Header = ({ isConnected, account, signer, connectToMetamask, userBalance }) => {

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gradient-to-r from-slate-900/70 to-purple-900/40 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src="/dao.png" 
                            alt="DAO Logo" 
                            className="h-8 w-8 rounded-md object-cover"
                        />
                        <span className="text-lg font-semibold tracking-wide text-white">Your DAO</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isConnected ? (
                            <button onClick={connectToMetamask} className="inline-flex items-center rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/20 transition hover:bg-white/20">
                                Connect Wallet
                            </button>
                        ) : (
                            <button className="inline-flex items-center rounded-md bg-white/10 px-3 py-2 text-xs font-mono text-white ring-1 ring-inset ring-white/20" title={account || ''}>
                                {(account || '').slice(0, 6)}...{(account || '').slice(-4)}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}