import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { useMetamaskState } from './web3/ConnectWallet';
import { useGetValue } from './web3/GetCurrentValue';
import { useGetBalance } from './web3/GetTokenBalance';
import { useRequestFunds } from './web3/GetFunds';
import { useCreateProposal } from './web3/NewProposal';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FundsPage from './pages/FundsPage';
import ProposePage from './pages/ProposePage';
import VotePage from './pages/VotePage';
import ExecutePage from './pages/ExecutePage';
import ProposalHistoryPage from './pages/ProposalHistoryPage';
import "./App.css"


function App() {

  const { boxValue, getValue } = useGetValue();
  const { isConnected, account, signer, connectToMetamask } = useMetamaskState();
  const { userBalance, getBalance } = useGetBalance();
  const { requestFunds } = useRequestFunds();
  const { createProposal, proposal, newValue, proposalDescription } = useCreateProposal();


  // keep balance updated when signer connects
  useEffect(() => {
    if (signer && account) {
        getBalance(signer, account);  // Pass signer and account
    }
  }, [signer, account, getBalance]);
  // useEffect(() => {
  //   if (signer) {
  //     getBalance(signer["_address"]);
  //   }
  // }, [signer, getBalance]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950 text-slate-100">
        <Header connectToMetamask={connectToMetamask} isConnected={isConnected} account={account} signer={signer} userBalance={userBalance} />
        <nav className="mx-auto max-w-6xl px-4 py-4 flex gap-2">
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" to="/">Home</Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" to="/funds">Funds</Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" to="/propose">Propose</Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" to="/vote">Vote</Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" to="/execute">Execute</Link>
                      {/* <Link className="rounded-md px-3 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10" to="/history">History</Link> */}
        </nav>
        <main className="mx-auto max-w-6xl px-4 pb-16">
          <Routes>
            <Route path="/" element={<HomePage boxValue={boxValue} getValue={getValue} userBalance={userBalance} />} />
            <Route path="/funds" element={<FundsPage signer={signer} getBalance={getBalance} requestFunds={requestFunds} />} />
            <Route path="/propose" element={<ProposePage signer={signer} createProposal={createProposal} proposal={proposal} newValue={newValue} proposalDescription={proposalDescription} />} />
            <Route path="/vote" element={<VotePage signer={signer} />} />
            <Route path="/execute" element={<ExecutePage signer={signer} />} />
            {/* <Route path="/history" element={<ProposalHistoryPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {/* Footer removed as requested */}
      </div>
    </BrowserRouter>
  );
}

export default App;
