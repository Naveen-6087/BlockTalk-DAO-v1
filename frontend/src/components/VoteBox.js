import { useGetState } from '../web3/useGetState';
import { useEffect, useState } from 'react';
import { useVoteProposal } from '../web3/VoteProposal';
import Spinner from './ui/spinner';
import { useHasVoted } from '../web3/HasVoted';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

// Countdown Timer Component for Voting
const VotingCountdownTimer = ({ proposalId, currentState, onStateChange }) => {
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

    if (currentState !== "1") return null;

    if (showTransition) {
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
};

export const VoteProposal = ({ lastId, signer, proposal, onUpdate }) => {
    const { getProposalState } = useGetState();
    const { voteInProposal } = useVoteProposal();

    const [proposalState, setProposalState] = useState(null);
    const [blockNumber, setBlockNumber] = useState(null);
    const [voteReason, setVoteReason] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const { hasVoted } = useHasVoted();
    const navigate = useNavigate();

    const handleVoteReason = (e) => {
        setVoteReason(e.target.value);
    }

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
        
        // Get current block number to calculate when voting starts
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const currentBlock = await provider.getBlockNumber();
            setBlockNumber(currentBlock);
        }
    }

    useEffect(() => {
        if (lastId) {
            getTheState();
            // Poll for state changes every 5 seconds
            const interval = setInterval(getTheState, 5000);
            return () => clearInterval(interval);
        }
    }, [lastId])

    useEffect(() => {
        const checkHasVoted = async () => {
            try {
                if (!lastId || !signer) return;
                const voted = await hasVoted(lastId, signer._address);
                setAlreadyVoted(Boolean(voted));
            } catch {}
        };
        checkHasVoted();
    }, [lastId, signer, hasVoted]);

    const handleVotingState = (state) => {
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
        return status[state] ?? "Unknown";
    }

    const getVotingStatusMessage = (state, proposalId) => {
        if (state === "0") { // Pending
            return "Proposal is pending. Voting will start after 1 block confirmation.";
        } else if (state === "1") { // Active
            return "Voting is now active! You can cast your vote.";
        } else if (state === "4") { // Succeeded
            return "Proposal succeeded! It can now be executed.";
        } else if (state === "3") { // Defeated
            return "Proposal was defeated.";
        } else if (state === "5") { // Queued
            return "Proposal is queued for execution.";
        } else if (state === "7") { // Executed
            return "Proposal has been executed.";
        }
        return "Voting is not available for this proposal.";
    }

    const shortId = lastId ? lastId.slice(0, 11) + "..." : 0;
    const shortDescription = proposal?.description ? (proposal.description.length > 50 ? proposal.description.slice(0, 50) + "..." : proposal.description) : "No description";

    const handleVote = async (support) => {
        if (!signer || !lastId) return;
        
        setIsLoading(true);
        try {
            await voteInProposal(signer, lastId, support, voteReason);
            setAlreadyVoted(true);
            // Don't navigate away, just refresh the proposal state
            setTimeout(getTheState, 2000);
        } catch (error) {
            console.error('Vote failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const currentState = handleVotingState(proposalState);
    const statusMessage = getVotingStatusMessage(proposalState, lastId);

    return (<>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400">Proposal {shortId}</div>
            <div className="mt-1 text-lg font-semibold text-white">{shortDescription}</div>
            <div className="mt-1 text-sm text-slate-300">Value: <span className="font-medium text-fuchsia-400">{proposal?.value || 'N/A'}</span></div>
            <div className="mt-1 text-sm text-slate-300">Proposal state: <span className={`font-medium ${currentState === 'Active' ? 'text-emerald-400' : currentState === 'Pending' ? 'text-yellow-400' : currentState === 'Succeeded' ? 'text-green-400' : currentState === 'Defeated' ? 'text-red-400' : 'text-slate-400'}`}>{currentState}</span></div>
            <div className="mt-1 text-sm text-slate-400">{statusMessage}</div>
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
        <VotingCountdownTimer 
            proposalId={lastId} 
            currentState={proposalState} 
            onStateChange={getTheState}
        />

        {currentState === "Active" && !alreadyVoted ? (
            <div className="mt-4 space-y-4">
                <div className="text-center">
                    <div className="text-lg font-semibold text-emerald-200">Cast Your Vote</div>
                    <div className="text-sm text-slate-300 mt-1">Choose your preference for this proposal</div>
                </div>
                
                <div className="flex justify-center gap-4">
                    <button 
                        disabled={isLoading} 
                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50" 
                        onClick={() => handleVote(1)}
                    >
                        {isLoading && <Spinner size={16} />} Vote For
                    </button>
                    
                    <button 
                        disabled={isLoading} 
                        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50" 
                        onClick={() => handleVote(0)}
                    >
                        {isLoading && <Spinner size={16} />} Vote Against
                    </button>
                </div>

                <div className="text-center">
                    <textarea 
                        className="w-full max-w-md rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50" 
                        placeholder="Optional: Add a reason for your vote" 
                        value={voteReason || ''} 
                        onChange={handleVoteReason}
                        rows={3}
                    />
                </div>
            </div>
        ) : currentState === "Active" && alreadyVoted ? (
            <div className="mt-4 text-center">
                <div className="text-emerald-300 font-medium">You have already voted on this proposal</div>
                <div className="text-sm text-slate-400 mt-1">Wait for the voting period to end</div>
            </div>
        ) : currentState === "Pending" ? (
            <div className="mt-4 text-center">
                <div className="text-yellow-300 font-medium">Voting will start soon</div>
                <div className="text-sm text-slate-400 mt-1">Proposal is pending confirmation</div>
            </div>
        ) : currentState === "Succeeded" ? (
            <div className="mt-4 text-center">
                <div className="text-green-300 font-medium">Proposal succeeded!</div>
                <div className="text-sm text-slate-400 mt-1">Go to Execute page to queue and execute</div>
            </div>
        ) : currentState === "Defeated" ? (
            <div className="mt-4 text-center">
                <div className="text-red-300 font-medium">Proposal defeated</div>
                <div className="text-sm text-slate-400 mt-1">This proposal did not receive enough votes</div>
            </div>
        ) : currentState === "Queued" ? (
            <div className="mt-4 text-center">
                <div className="text-fuchsia-300 font-medium">Proposal is queued</div>
                <div className="text-sm text-slate-400 mt-1">Go to Execute page to execute it</div>
            </div>
        ) : currentState === "Executed" ? (
            <div className="mt-4 text-center">
                <div className="text-green-300 font-medium">Proposal executed successfully!</div>
                <div className="text-sm text-slate-400 mt-1">This proposal has been completed</div>
            </div>
        ) : (
            <div className="mt-4 text-center">
                <div className="text-slate-300">Waiting for proposal...</div>
            </div>
        )}
    </>)
}

// signer, proposalId, support, reason