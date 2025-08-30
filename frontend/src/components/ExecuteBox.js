import { useGetState } from '../web3/useGetState';
import { useEffect, useState } from 'react';
import { useExecuteProposal } from '../web3/ExecuteProposal';
import contractAddresses from "../chain-info/deployments/map.json";
import boxContractABI from "../chain-info/contracts/Box.json";
import moralisGovernorABI from "../chain-info/contracts/MoralisGovernor.json";
import { ethers } from 'ethers';
import Spinner from './ui/spinner';

// Countdown Timer Component
const CountdownTimer = ({ proposalId, currentState, onStateChange }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 10, seconds: 0 });
    const [status, setStatus] = useState('');
    const [showTransition, setShowTransition] = useState(false);

    useEffect(() => {
        if (!proposalId || currentState !== "1") return; // Only show for Active state

        // Check if countdown already started for this proposal
        const countdownKey = `countdown_${proposalId}`;
        const startTimeKey = `startTime_${proposalId}`;
        const transitionKey = `transition_${proposalId}`;
        
        let startTime = localStorage.getItem(startTimeKey);
        let countdownStarted = localStorage.getItem(countdownKey);
        let transitionShown = localStorage.getItem(transitionKey);
        
        if (!countdownStarted && currentState === "1") {
            // First time seeing this proposal as active - start countdown
            startTime = Date.now();
            localStorage.setItem(startTimeKey, startTime);
            localStorage.setItem(countdownKey, 'true');
            setTimeLeft({ hours: 0, minutes: 10, seconds: 0 });
            setStatus('Voting ends in:');
            setShowTransition(false);
        } else if (countdownStarted && startTime) {
            // Countdown already started - calculate remaining time
            const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
            const totalSeconds = 10 * 60; // 10 minutes in seconds
            const remainingSeconds = Math.max(0, totalSeconds - elapsed);
            
            if (remainingSeconds > 0) {
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
                
                setTimeLeft({ hours, minutes, seconds });
                setStatus('Voting ends in:');
                setShowTransition(false);
            } else {
                // 10 minutes are up - show transition message
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                setShowTransition(true);
                if (!transitionShown) {
                    localStorage.setItem(transitionKey, 'true');
                }
            }
        }

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else {
                    // 10 minutes are up - show transition message
                    clearInterval(countdownInterval);
                    setShowTransition(true);
                    if (!localStorage.getItem(transitionKey)) {
                        localStorage.setItem(transitionKey, 'true');
                    }
                    return { hours: 0, minutes: 0, seconds: 0 };
                }
                
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [proposalId, currentState, onStateChange]);

    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };

    if (currentState === "4" || currentState === "5") {
        // Clean up localStorage when showing ready states
        const countdownKey = `countdown_${proposalId}`;
        const startTimeKey = `startTime_${proposalId}`;
        const transitionKey = `transition_${proposalId}`;
        localStorage.removeItem(countdownKey);
        localStorage.removeItem(startTimeKey);
        localStorage.removeItem(transitionKey);

        return (
            <div className="mt-4 p-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10">
                <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-200">
                        {currentState === "4" ? "Ready to queue!" : "Ready to execute!"}
                    </div>
                    <div className="text-sm text-emerald-300 mt-1">
                        {currentState === "4" ? "Proposal succeeded! You can now queue it." : "Proposal is queued! You can now execute it."}
                    </div>
                </div>
            </div>
        );
    }

    if (currentState === "1" && showTransition) {
        return (
            <div className="mt-4 p-4 rounded-lg border border-orange-400/30 bg-orange-500/10">
                <div className="text-center">
                    <div className="text-lg font-semibold text-orange-200">Voting will end soon</div>
                    <div className="text-sm text-orange-300 mt-1">
                        The 10-minute voting period has ended. Waiting for blockchain confirmation...
                    </div>
                    <div className="text-xs text-orange-400 mt-2">
                        This message will disappear once voting is officially ended
                    </div>
                </div>
            </div>
        );
    }

    if (currentState === "1" && !showTransition) {
        return (
            <div className="mt-4 p-4 rounded-lg border border-amber-400/30 bg-amber-500/10">
                <div className="text-center">
                    <div className="text-lg font-semibold text-amber-200">{status}</div>
                    <div className="flex justify-center items-center gap-2 mt-2">
                        <div className="bg-amber-600/30 rounded-lg p-2 min-w-[60px]">
                            <div className="text-2xl font-bold text-amber-200">{formatTime(timeLeft.hours)}</div>
                            <div className="text-xs text-amber-300">Hours</div>
                        </div>
                        <div className="text-2xl text-amber-200">:</div>
                        <div className="bg-amber-600/30 rounded-lg p-2 min-w-[60px]">
                            <div className="text-2xl font-bold text-amber-200">{formatTime(timeLeft.minutes)}</div>
                            <div className="text-xs text-amber-300">Minutes</div>
                        </div>
                        <div className="text-2xl text-amber-200">:</div>
                        <div className="bg-amber-600/30 rounded-lg p-2 min-w-[60px]">
                            <div className="text-2xl font-bold text-amber-200">{formatTime(timeLeft.seconds)}</div>
                            <div className="text-xs text-amber-300">Seconds</div>
                        </div>
                    </div>
                    <div className="text-xs text-amber-300 mt-2">
                        Voting period: ~10 minutes
                    </div>
                    <div className="text-xs text-amber-400 mt-1">
                        Universal countdown - persists across pages
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export const ExecuteProposal = ({ lastId, signer, value, description, proposal, onUpdate }) => {

    const { getProposalState } = useGetState();

    const [proposalState, setProposalState] = useState(null);

    const { queueProposal, executeProposal } = useExecuteProposal();
    const [isLoading, setIsLoading] = useState(false);

    const getTheState = async () => {
        const state = await getProposalState(lastId);
        setProposalState(state);
        
        // Update the proposal state in localStorage
        if (proposal && onUpdate) {
            const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
            const proposalIndex = proposals.findIndex(p => p.id === lastId);
            if (proposalIndex !== -1) {
                proposals[proposalIndex].state = state;
                proposals[proposalIndex].lastUpdated = Date.now();
                localStorage.setItem('proposals', JSON.stringify(proposals));
                onUpdate();
            }
        }
    }

    useEffect(() => {
        if (lastId) {
            getTheState();
            // Poll for state changes every 10 seconds
            const interval = setInterval(getTheState, 10000);
            return () => clearInterval(interval);
        }
    }, [lastId])

    const handleVotingState = (e) => {
        const status = {
            "0": "Pending",
            "1": "Active",
            "2": "Canceled",
            "3": "Defeated",
            "4": "Succeeded",
            "5": "Queued",
            "6": "Expired",
            "7": "Executed"
        };
        return status[e] ?? "Unknown";
    }

    const shortId = lastId ? lastId.slice(0, 11) + "..." : 0;
    const shortDescription = description ? (description.length > 50 ? description.slice(0, 50) + "..." : description) : "No description";

    return (<>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Proposal {shortId}</div>
            <div className="mt-1 text-lg font-semibold text-white">{shortDescription}</div>
            <div className="mt-1 text-sm text-slate-300">Value: <span className="font-medium text-fuchsia-400">{value}</span></div>
            <div className="mt-1 text-sm text-slate-300">State: <span className={`font-medium ${proposalState === '4' ? 'text-emerald-400' : proposalState === '5' ? 'text-fuchsia-400' : proposalState === '1' ? 'text-amber-400' : proposalState === '7' ? 'text-green-400' : 'text-slate-400'}`}>{handleVotingState(proposalState)}</span></div>
            <div className="mt-2">
                <button 
                    onClick={getTheState}
                    className="text-xs text-fuchsia-400 hover:text-fuchsia-300 underline"
                >
                    Refresh Status
                </button>
            </div>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer 
            proposalId={lastId} 
            currentState={proposalState} 
            onStateChange={getTheState}
        />

        {handleVotingState(proposalState) === "Succeeded" ? <div className="mt-4 flex justify-center">
            <button disabled={isLoading} className="inline-flex items-center gap-2 rounded-md border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50" onClick={async () => {
                // safety: verify params match and state is still Succeeded
                try {
                    setIsLoading(true);
                    const network = await signer.provider.getNetwork();
                    const chainIdKey = String(network.chainId);
                    const boxAddress = contractAddresses[chainIdKey]["Box"][0];
                    const governorAddress = contractAddresses[chainIdKey]["MoralisGovernor"][0];
                    const boxAbi = boxContractABI.abi;
                    const governorAbi = moralisGovernorABI.abi;
                    const governor = new ethers.Contract(governorAddress, governorAbi, signer);
                    const boxInterface = new ethers.utils.Interface(boxAbi);
                    const calldata = boxInterface.encodeFunctionData('store', [value]);
                    const descHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description));
                    const derivedId = await governor.hashProposal([boxAddress], [0], [calldata], descHash);
                    if (derivedId.toString() !== String(lastId)) {
                        alert('Proposal parameters do not match the original proposal. Please re-check value/description.');
                        setIsLoading(false);
                        return;
                    }
                    const currentState = await governor.state(lastId);
                    if (currentState.toString() !== '4') { // 4 = Succeeded
                        alert('Proposal is not Succeeded yet. Please wait until voting ends and the proposal succeeds.');
                        setIsLoading(false);
                        return;
                    }
                    await queueProposal(signer, value, description);
                    
                    // Mark proposal as queued in localStorage
                    if (proposal && onUpdate) {
                        const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
                        const proposalIndex = proposals.findIndex(p => p.id === lastId);
                        if (proposalIndex !== -1) {
                            proposals[proposalIndex].state = '6';
                            proposals[proposalIndex].status = 'queued';
                            proposals[proposalIndex].lastUpdated = Date.now();
                            localStorage.setItem('proposals', JSON.stringify(proposals));
                            
                            // Dispatch event to notify other components
                            const event = new CustomEvent('proposalsUpdated', { 
                                detail: { proposals, updatedProposal: proposals[proposalIndex] } 
                            });
                            window.dispatchEvent(event);
                            
                            onUpdate();
                        }
                    }
                    
                    // Refresh state after queuing
                    setTimeout(getTheState, 2000);
                } catch (e) {
                    console.log(e);
                    alert('Unable to queue: ' + (e?.reason || 'check console'));
                } finally {
                    setIsLoading(false);
                }
            }}>{isLoading && <Spinner size={14} />} Queue Proposal</button>
        </div> : handleVotingState(proposalState) === "Queued" ? <div className="mt-4 flex justify-center">
            <button disabled={isLoading} className="inline-flex items-center gap-2 rounded-md border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-200 hover:bg-fuchsia-500/20 disabled:opacity-50" onClick={async () => {
                setIsLoading(true); 
                try { 
                    await executeProposal(signer, value, description);
                    
                    // Mark proposal as executed in localStorage
                    if (proposal && onUpdate) {
                        const proposals = JSON.parse(localStorage.getItem('proposals') || '[]');
                        const proposalIndex = proposals.findIndex(p => p.id === lastId);
                        if (proposalIndex !== -1) {
                            proposals[proposalIndex].state = '7';
                            proposals[proposalIndex].status = 'executed';
                            proposals[proposalIndex].executedAt = Date.now();
                            proposals[proposalIndex].lastUpdated = Date.now();
                            localStorage.setItem('proposals', JSON.stringify(proposals));
                            
                            // Dispatch event to notify other components
                            const event = new CustomEvent('proposalsUpdated', { 
                                detail: { proposals, updatedProposal: proposals[proposalIndex] } 
                            });
                            window.dispatchEvent(event);
                            
                            onUpdate();
                        }
                    }
                    
                    // Refresh state after execution
                    setTimeout(getTheState, 2000);
                } finally { 
                    setIsLoading(false);
                }
            }}>{isLoading && <Spinner size={14} />} Execute Proposal</button>
        </div> : handleVotingState(proposalState) === "Active" ? <div className="mt-4 text-center">
            <div className="text-amber-300 font-medium">Voting in progress...</div>
            <div className="text-sm text-slate-400 mt-1">Wait for the voting period to end</div>
        </div> : handleVotingState(proposalState) === "Defeated" ? <div className="mt-4 text-center">
            <div className="text-red-300 font-medium">Proposal defeated</div>
            <div className="text-sm text-slate-400 mt-1">This proposal did not receive enough votes</div>
        </div> : handleVotingState(proposalState) === "Executed" ? <div className="mt-4 text-center">
            <div className="text-green-300 font-medium">Proposal executed successfully!</div>
            <div className="text-sm text-slate-400 mt-1">This proposal has been completed</div>
        </div> : <div className="mt-4 text-center">
            <div className="text-slate-300">Waiting for proposal...</div>
        </div>
        }
    </>)
}

// signer, proposalId, support, reason