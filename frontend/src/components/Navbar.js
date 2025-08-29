import * as React from 'react';
import { useState, useEffect } from 'react';
import { useGetTotalVoters } from '../web3/GetVotersCount';
import { useGetProposals } from '../web3/GetProposalCount';



export const Navbar = ({ boxValue, getValue, userBalance, getBalance, signer, requestFunds, createProposal, proposal, newValue, proposalDescription }) => {


    const [activeTab, setActiveTab] = useState(0);
    const [shortId, setShortId] = useState();
    const [localProposalId, setLocalProposalId] = useState();
    const [propDesc, setPropDesc] = useState();
    const [propValue, setPropValue] = useState();

    const { voters, getVoters } = useGetTotalVoters();
    const { proposalCount, getProposalCount } = useGetProposals();

    const [params, setParams] = useState({
        proposalDescription: localStorage.getItem('proposalDescription') || '',
        proposalAmount: localStorage.getItem('proposalAmount') || 0,
    });


    const requestAndUpdateBalance = async () => {
        await requestFunds(signer);
        await getBalance(signer["_address"])
    }

    useEffect(() => { getValue() }, [boxValue])
    useEffect(() => {
        const id = localProposalId || proposal;
        setShortId(id ? id.slice(0, 11) + "..." : "0")
    }, [proposal, localProposalId])
    useEffect(() => { getVoters() }, [])
    useEffect(() => { getProposalCount() }, [])
    useEffect(() => {
        if (signer) {
            getBalance(signer["_address"])
        }
    }, [signer])



    const handleParamsChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value })
    }

    const updateParams = () => {
        setPropDesc(proposalDescription ? proposalDescription : localStorage.getItem('proposalDescription'));
        setPropValue(newValue ? newValue : localStorage.getItem('proposalAmount'));
    }



    return null
}





