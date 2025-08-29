import { useEffect, useState } from 'react';
import Spinner from '../components/ui/spinner';
import contractAddress from "../chain-info/deployments/map.json";
import tokenABI from "../chain-info/contracts/GovernanceToken.json";
import { ethers } from 'ethers';

export default function FundsPage({ signer, getBalance, requestFunds }) {
    const [isLoading, setIsLoading] = useState(false);
    const [alreadyClaimed, setAlreadyClaimed] = useState(false);
    const [error, setError] = useState("");

    const refreshClaimState = async () => {
        try {
            if (!signer) return;
            const network = await signer.provider.getNetwork();
            const chainIdKey = String(network.chainId);
            const tokenAddress = contractAddress[chainIdKey]["GovernanceToken"][0];
            const abi = tokenABI.abi;
            const token = new ethers.Contract(tokenAddress, abi, signer);
            const claimed = await token.s_claimedTokens(signer.address);
            setAlreadyClaimed(Boolean(claimed));
        } catch (e) {
            setAlreadyClaimed(false);
        }
    }

    useEffect(() => { refreshClaimState() }, [signer]);

    const requestAndUpdateBalance = async () => {
        setError("");
        setIsLoading(true);
        try {
            // preflight: simulate claim
            try {
                const network = await signer.provider.getNetwork();
                const chainIdKey = String(network.chainId);
                const tokenAddress = contractAddress[chainIdKey]["GovernanceToken"][0];
                const abi = tokenABI.abi;
                const token = new ethers.Contract(tokenAddress, abi, signer);
                await token.callStatic.claimTokens();
            } catch (simErr) {
                setIsLoading(false);
                setAlreadyClaimed(true);
                setError('Already claimed or faucet unavailable.');
                return;
            }

            await requestFunds(signer);
            if (signer) {
                await getBalance(signer["_address"]) 
            }
            await refreshClaimState();
        } catch (e) {
            setError(e?.reason || 'Failed to claim');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Get Funds to Participate in the DAO</h2>
            <p className="text-slate-300">Only the owners of the ERC20 Token can vote.</p>
            <div className="flex items-center gap-3">
                <button disabled={isLoading || alreadyClaimed || !signer} className="inline-flex items-center gap-2 rounded-md bg-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50" onClick={requestAndUpdateBalance}>
                    {isLoading && <Spinner size={14} />}
                    {alreadyClaimed ? 'Already Claimed' : 'Claim Tokens'}
                </button>
                {error && <span className="text-xs text-rose-300">{error}</span>}
            </div>
        </section>
    )
}

