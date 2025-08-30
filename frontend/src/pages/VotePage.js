import { useEffect, useState } from 'react';
import { VoteProposal } from '../components/VoteBox';
import { useGetProposals } from '../web3/GetProposalCount';

export default function VotePage({ signer }) {
    const { proposalCount } = useGetProposals();
    const [proposals, setProposals] = useState([]);

    useEffect(() => {
        // Load all proposals from localStorage
        const loadProposals = () => {
            const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
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

    const refreshProposals = () => {
        const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
        setProposals(storedProposals);
    };

    const debugLocalStorage = () => {
        const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
        console.log('=== DEBUG localStorage ===');
        console.log('proposals array:', storedProposals);
        console.log('========================');
    };

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Choose your preference</h2>
                    <p className="text-slate-300">Vote and engage with the DAO. All proposals are shown below.</p>
                </div>
                <div className="flex gap-2">
                    {/* <button 
                        onClick={() => window.location.href = '/history'}
                        className="text-sm text-blue-400 hover:text-blue-300 underline"
                    >
                        View History
                    </button> */}
                    {/* <button 
                        onClick={debugLocalStorage}
                        className="text-sm text-yellow-400 hover:text-yellow-300 underline"
                    >
                        Debug localStorage
                    </button>
                    <button 
                        onClick={refreshProposals}
                        className="text-sm text-fuchsia-400 hover:text-fuchsia-300 underline"
                    >
                        Refresh Proposals
                    </button> */}
                </div>
            </div>
            
            {proposals.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                    No proposals found. Create a proposal first!
                </div>
            ) : (
                <div className="space-y-4">
                    {proposals.map((proposal, index) => (
                        <VoteProposal 
                            key={proposal.id || index}
                            lastId={proposal.id} 
                            signer={signer}
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

