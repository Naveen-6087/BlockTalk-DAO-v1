import { useEffect, useState } from 'react';
import { VoteProposal } from '../components/VoteBox';
import { useGetProposals } from '../web3/GetProposalCount';

export default function VotePage({ signer }) {
    const { proposalCount } = useGetProposals();
    const [lastId, setLastId] = useState(null);

    useEffect(() => {
        const id = localStorage.getItem('lastProposalId');
        if (id) setLastId(id);
    }, []);

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Choose your preference</h2>
            <p className="text-slate-300">Vote and engage with the DAO.</p>
            <VoteProposal lastId={lastId} signer={signer} />
        </section>
    )
}

