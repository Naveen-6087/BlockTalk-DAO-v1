import { useEffect, useState } from 'react';
import { ExecuteProposal } from '../components/ExecuteBox';

export default function ExecutePage({ signer }) {
    const [proposals, setProposals] = useState([]);
    const [localProposalId, setLocalProposalId] = useState(localStorage.getItem('lastProposalId'));
    const [propDesc, setPropDesc] = useState(localStorage.getItem('proposalDescription'));
    const [propValue, setPropValue] = useState(localStorage.getItem('proposalAmount'));

    useEffect(() => {
        // Load all proposals from localStorage
        const loadProposals = () => {
            const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
            // Show ALL proposals - don't filter out executed ones
            setProposals(storedProposals);
        };

        loadProposals();
        
        // Listen for storage changes
        const handleStorageChange = () => {
            loadProposals();
        };

        // Listen for custom proposalsUpdated event
        const handleProposalsUpdated = () => {
            loadProposals();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('proposalsUpdated', handleProposalsUpdated);
        
        // Also check for changes every few seconds
        const interval = setInterval(loadProposals, 5000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('proposalsUpdated', handleProposalsUpdated);
            clearInterval(interval);
        };
    }, []);

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Queue & Execute</h2>
                    <p className="text-slate-300">Monitor proposal status and execute when ready. All proposals are shown below.</p>
                </div>
                {/* <button 
                    onClick={() => window.location.href = '/history'}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                    View Proposal History
                </button> */}
            </div>
            
            {proposals.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    No proposals found. Create a proposal first!
                </div>
            ) : (
                <div className="space-y-4">
                    {proposals.map((proposal, index) => (
                        <ExecuteProposal 
                            key={proposal.id || index}
                            signer={signer} 
                            lastId={proposal.id} 
                            value={proposal.value} 
                            description={proposal.description}
                            proposal={proposal}
                            onUpdate={() => {
                                // Refresh proposals when one is updated
                                const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
                                setProposals(storedProposals);
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}

