import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProposalHistoryPage() {
    const [executedProposals, setExecutedProposals] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Load executed proposals from localStorage
        const loadExecutedProposals = () => {
            const allProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
            const executed = allProposals.filter(proposal => 
                proposal.state === '7' || proposal.state === 'executed' || proposal.status === 'executed'
            );
            setExecutedProposals(executed);
        };

        loadExecutedProposals();
        
        // Listen for storage changes
        const handleStorageChange = () => {
            loadExecutedProposals();
        };

        // Listen for custom proposalsUpdated event
        const handleProposalsUpdated = () => {
            loadExecutedProposals();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('proposalsUpdated', handleProposalsUpdated);
        
        // Check for changes every few seconds
        const interval = setInterval(loadExecutedProposals, 5000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('proposalsUpdated', handleProposalsUpdated);
            clearInterval(interval);
        };
    }, []);

    const getStateLabel = (state) => {
        switch(state) {
            case '7':
            case 'executed':
                return 'Executed';
            case '6':
            case 'queued':
                return 'Queued';
            case '5':
            case 'succeeded':
                return 'Succeeded';
            case '4':
            case 'defeated':
                return 'Defeated';
            case '3':
            case 'expired':
                return 'Expired';
            case '2':
            case 'canceled':
                return 'Canceled';
            case '1':
            case 'active':
                return 'Active';
            case '0':
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    const getStateColor = (state) => {
        switch(state) {
            case '7':
            case 'executed':
                return 'text-green-400';
            case '6':
            case 'queued':
                return 'text-blue-400';
            case '5':
            case 'succeeded':
                return 'text-emerald-400';
            case '4':
            case 'defeated':
                return 'text-red-400';
            case '3':
            case 'expired':
                return 'text-orange-400';
            case '2':
            case 'canceled':
                return 'text-gray-400';
            case '1':
            case 'active':
                return 'text-yellow-400';
            case '0':
            case 'pending':
                return 'text-slate-400';
            default:
                return 'text-slate-400';
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const shortId = (id) => {
        if (!id) return 'N/A';
        return id.toString().slice(0, 11) + "...";
    };

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Proposal History</h2>
                    <p className="text-slate-300">Track all executed and completed proposals</p>
                </div>
                <button 
                    onClick={() => navigate('/execute')}
                    className="text-sm text-fuchsia-400 hover:text-fuchsia-300 underline"
                >
                    Back to Execute
                </button>
            </div>
            
            {executedProposals.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    <div className="text-6xl mb-4">📜</div>
                    <p className="text-lg">No executed proposals yet</p>
                    <p className="text-sm">Proposals will appear here once they are executed</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {executedProposals.map((proposal, index) => (
                        <div key={proposal.id || index} className="rounded-lg border border-white/10 bg-white/5 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-xs uppercase tracking-wide text-slate-400">
                                        Proposal {shortId(proposal.id)}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mt-1">
                                        {proposal.description || 'No description'}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateColor(proposal.state)} bg-white/5 border border-white/10`}>
                                        {getStateLabel(proposal.state)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-400">Value:</span>
                                    <span className="ml-2 font-medium text-fuchsia-400">
                                        {proposal.value || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Created:</span>
                                    <span className="ml-2 font-medium text-white">
                                        {formatDate(proposal.createdAt)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400">Last Updated:</span>
                                    <span className="ml-2 font-medium text-white">
                                        {formatDate(proposal.lastUpdated)}
                                    </span>
                                </div>
                            </div>
                            
                            {proposal.executedAt && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center text-green-400">
                                        <span className="text-sm">✅ Executed at: {formatDate(proposal.executedAt)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
