import { ethers } from "ethers";
import { useState, useEffect } from "react";

import contractAddresses from "../chain-info/deployments/map.json";
import boxContractABI from "../chain-info/contracts/Box.json"
import moralisGovernorABI from "../chain-info/contracts/MoralisGovernor.json"
import { useLocalStorage } from "../web3/useLocalStorage"



export function useCreateProposal() {

    const [proposal, setProposal] = useState();
    const [proposalDescription, setProposalDescription] = useState();
    const [newValue, setValue] = useState();
    const { setLocalStorage, clearLocalStorage, getLocalStorage } = useLocalStorage()

    useEffect(() => {
        if (getLocalStorage('id')) {
            setProposal(getLocalStorage('id'))
        }
    }, [])

    async function createProposal(signer, proposalDescription, value) {
        try {
            // clearLocalStorage() - REMOVED: This was wiping out all proposals!
            const network = await signer.provider.getNetwork()
            const chainIdKey = String(network.chainId)
            const boxContract = contractAddresses[chainIdKey]["Box"][0];
            const moralisGovernor = contractAddresses[chainIdKey]["MoralisGovernor"][0];
            const boxAbi = boxContractABI.abi;
            const moralisGovernorAbi = moralisGovernorABI.abi;
            const moralisGovernorContractInstance = new ethers.Contract(moralisGovernor, moralisGovernorAbi, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);

            console.log('Creating proposal...');
            const proposeTx = await moralisGovernorContractInstance.propose([boxContract], [0], [encodedFunction], proposalDescription, { gasLimit: 1000000 })
            console.log('Proposal transaction sent:', proposeTx.hash);
            
            console.log('Waiting for confirmation...');
            const proposeReceipt = await proposeTx.wait(1) // Reduced to 1 confirmation for faster response
            console.log('Proposal confirmed:', proposeReceipt);

            if (!proposeReceipt.events || proposeReceipt.events.length === 0) {
                throw new Error('No events found in proposal receipt');
            }

            const proposalId = proposeReceipt.events[0].args.proposalId
            console.log('Proposal ID:', proposalId);

            const bnValue = ethers.BigNumber.from(proposalId);
            const proposalIdString = bnValue.toString();

            setProposal(proposalIdString);
            setValue(value);
            setProposalDescription(proposalDescription);

            setLocalStorage('id', proposalId);
            console.log('Proposal created successfully:', proposalIdString);

            return proposalIdString;
        } catch (err) {
            console.error('Error creating proposal:', err);
            throw err; // Re-throw to handle in the UI
        }
    }

    return { createProposal, proposal, newValue, proposalDescription }
}