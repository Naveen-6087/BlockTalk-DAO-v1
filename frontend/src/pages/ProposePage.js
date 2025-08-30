import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProposals } from '../web3/GetProposalCount';
import Spinner from '../components/ui/spinner';

export default function ProposePage({ signer, createProposal, proposal, newValue, proposalDescription }) {
    const [localProposalId, setLocalProposalId] = useState();
    const [params, setParams] = useState({
        proposalDescription: localStorage.getItem('proposalDescription') || '',
        proposalAmount: localStorage.getItem('proposalAmount') || 0,
    });
    const navigate = useNavigate();
    const { getProposalCount } = useGetProposals();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const shortId = (localProposalId || proposal) ? (localProposalId || proposal).slice(0, 11) + "..." : "0";

    const handleParamsChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value })
        setError(''); // Clear error when user types
    }

    const handleCreateProposal = async () => {
        if (!signer || !params.proposalDescription) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            console.log('Starting proposal creation...');
            const newId = await createProposal(signer, params.proposalDescription, params.proposalAmount);
            
            if (newId) {
                console.log('Proposal created with ID:', newId);
                setLocalProposalId(newId);
                
                // Store proposal in the proposals array instead of overwriting
                const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
                const newProposal = {
                    id: newId,
                    description: params.proposalDescription,
                    value: params.proposalAmount,
                    state: 'pending',
                    createdAt: Date.now()
                };
                proposals.push(newProposal);
                localStorage.setItem('proposals', JSON.stringify(proposals));
                
                // Dispatch custom event to notify other components
                const event = new CustomEvent('proposalsUpdated', { 
                    detail: { proposals, newProposal } 
                });
                window.dispatchEvent(event);
                
                // Keep the last proposal ID for backward compatibility
                localStorage.setItem('lastProposalId', newId);
                localStorage.setItem('proposalDescription', params.proposalDescription);
                localStorage.setItem('proposalAmount', params.proposalAmount);
                
                await getProposalCount();
                console.log('Navigating to vote page...');
                navigate('/vote');
            } else {
                throw new Error('No proposal ID returned');
            }
        } catch (err) {
            console.error('Proposal creation failed:', err);
            setError(err.message || 'Failed to create proposal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">Propose a new Execution</h2>
                    <p className="text-slate-300">DAO members will vote to decide what happens next.</p>
                    <p className="text-xs text-slate-400">Last proposal: {shortId}</p>
                </div>
                {/* <button 
                    onClick={() => window.location.href = '/history'}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                    View History
                </button> */}
            </div>

            {error && (
                <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {error}
                </div>
            )}

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" placeholder="Proposal Description" name='proposalDescription' onChange={handleParamsChange} defaultValue={params.proposalDescription} />
                    <input className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" placeholder="Proposal Value" name='proposalAmount' onChange={handleParamsChange} defaultValue={params.proposalAmount} />
                </div>
                <div className="mt-4">
                    <button 
                        className="inline-flex items-center gap-2 rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50" 
                        disabled={isLoading || !signer || !params.proposalDescription} 
                        onClick={handleCreateProposal}
                    >
                        {isLoading && <Spinner size={14} />} Create Proposal
                    </button>
                </div>
            </div>
        </section>
    )
}

