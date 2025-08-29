import { useEffect, useState } from 'react';
import { ExecuteProposal } from '../components/ExecuteBox';

export default function ExecutePage({ signer }) {
    const [localProposalId, setLocalProposalId] = useState(localStorage.getItem('lastProposalId'));
    const [propDesc, setPropDesc] = useState(localStorage.getItem('proposalDescription'));
    const [propValue, setPropValue] = useState(localStorage.getItem('proposalAmount'));

    useEffect(() => {
        const id = localStorage.getItem('lastProposalId');
        if (id) setLocalProposalId(id);
    }, []);

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Queue & Execute</h2>
            <p className="text-slate-300">Monitor proposal status and execute when ready. The countdown timer shows when voting ends.</p>
            <ExecuteProposal signer={signer} lastId={localProposalId} value={propValue} description={propDesc} />
        </section>
    )
}

