import { ethers } from "ethers";
import contractAddress from "../chain-info/deployments/map.json";
import contractABI from "../chain-info/contracts/MoralisGovernor.json";

export function useHasVoted() {
    async function hasVoted(proposalId, voterAddress) {
        try {
            if (!window.ethereum || !proposalId || !voterAddress) return false;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            const chainIdKey = String(network.chainId);
            const contract = contractAddress[chainIdKey]["MoralisGovernor"][0];
            const abi = contractABI.abi;
            const governor = new ethers.Contract(contract, abi, provider);
            const result = await governor.hasVoted(proposalId, voterAddress);
            return Boolean(result);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    return { hasVoted };
}

