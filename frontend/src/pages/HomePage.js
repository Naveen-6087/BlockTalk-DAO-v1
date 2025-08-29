import { useEffect, useState } from 'react';
import { useGetProposals } from '../web3/GetProposalCount';
import Spline from '@splinetool/react-spline';

export default function HomePage({ boxValue, getValue, userBalance }) {
    const { proposalCount, getProposalCount } = useGetProposals();
    const [isSplineLoading, setIsSplineLoading] = useState(true);
    const [splineError, setSplineError] = useState(false);
    
    useEffect(() => { getValue() }, [boxValue]);
    useEffect(() => { getProposalCount() }, []);
    
    const handleSplineLoad = () => {
        setIsSplineLoading(false);
    };
    
    const handleSplineError = () => {
        setSplineError(true);
        setIsSplineLoading(false);
    };
    
    return (
        <section className="space-y-8">
            {/* Spline 3D Hero Section */}
            <div className="relative h-96 w-full overflow-hidden rounded-xl border border-white/10" style={{ backgroundColor: '#1E0B3A' }}>
                {/* Loading State */}
                {isSplineLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-purple-900/80">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto mb-4"></div>
                            <p className="text-white text-lg">Loading 3D Experience...</p>
                        </div>
                    </div>
                )}
                
                {/* Error State */}
                {splineError && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80">
                        <div className="text-center">
                            <div className="text-red-400 text-6xl mb-4">⚠️</div>
                            <p className="text-white text-lg mb-2">3D Experience Unavailable</p>
                            <p className="text-slate-300 text-sm">Please check your connection and try again</p>
                        </div>
                    </div>
                )}
                
                {/* Hero Text Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="text-center bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Welcome to BlockTalk DAO</h1>
                        <p className="text-lg text-white font-medium max-w-2xl mx-auto drop-shadow-lg">
                            Experience decentralized governance in a new way
                        </p>
                    </div>
                </div>
                
                {/* Spline 3D Scene */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="relative w-full h-full" style={{ transform: 'translateY(59px)' }}>
                        <Spline 
                            scene="https://prod.spline.design/2QuDFo8frOI92tCs/scene.splinecode"
                            onLoad={handleSplineLoad}
                            onError={handleSplineError}
                            style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Existing DAO State Content */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 to-cyan-500/10 p-8">
                <h2 className="text-2xl font-semibold">The state of the DAO</h2>
                <p className="mt-1 text-slate-300">The current Value of the Box is:</p>
                <div className="mt-2 text-4xl font-bold tracking-tight text-white">{boxValue}</div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Your Voting Power</p>
                    <p className="mt-2 text-2xl font-semibold">{userBalance ? userBalance : "0"}</p>
                    <p className="text-xs text-slate-400">Based on your token balance</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Proposals</p>
                    <p className="mt-2 text-2xl font-semibold">{proposalCount ?? 0}</p>
                    <p className="text-xs text-slate-400">All-time proposals created</p>
                </div>
            </div>
        </section>
    )
}

