import { ethers } from "ethers";
import { useState } from "react";

import contractAddresses from "../chain-info/deployments/map.json";
import boxContractABI from "../chain-info/contracts/Box.json"
import moralisGovernorABI from "../chain-info/contracts/MoralisGovernor.json"

export function useExecuteProposal() {

    async function queueProposal(signer, value, proposalDescription) {
        try {
            const network = await signer.provider.getNetwork();
            const chainIdKey = String(network.chainId);
            const boxContract = contractAddresses[chainIdKey]["Box"][0];
            const moralisGovernor = contractAddresses[chainIdKey]["MoralisGovernor"][0];
            const boxAbi = boxContractABI.abi;
            const moralisGovernorAbi = moralisGovernorABI.abi;
            const moralisGovernorContractInstance = new ethers.Contract(moralisGovernor, moralisGovernorAbi, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);
            const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription))

            console.log('Queueing proposal...');
            const queueTx = await moralisGovernorContractInstance.queue([boxContract], [0], [encodedFunction], descriptionHash, { gasLimit: 1000000 })
            const queueReceipt = await queueTx.wait(5)
            console.log('Proposal queued successfully:', queueReceipt);

        } catch (err) {
            console.log(err)
            throw err;
        }
    }

    async function executeProposal(signer, value, proposalDescription) {
        try {
            const network = await signer.provider.getNetwork();
            const chainIdKey = String(network.chainId);
            const boxContract = contractAddresses[chainIdKey]["Box"][0];
            const moralisGovernor = contractAddresses[chainIdKey]["MoralisGovernor"][0];
            const boxAbi = boxContractABI.abi;
            const moralisGovernorAbi = moralisGovernorABI.abi;
            const moralisGovernorContractInstance = new ethers.Contract(moralisGovernor, moralisGovernorAbi, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);
            const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription))

            console.log('Executing proposal...');
            const executeTx = await moralisGovernorContractInstance.execute([boxContract], [0], [encodedFunction], descriptionHash, { gasLimit: 1000000 })
            const executeReceipt = await executeTx.wait(5)
            console.log('Proposal executed successfully:', executeReceipt);

        } catch (err) {
            console.log(err)
            throw err;
        }
    }

    return { queueProposal, executeProposal }
}