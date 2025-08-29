# BlockTalk DAO

Full-stack DAO project with Solidity smart contracts, a Django backend, and a React frontend.

## Prerequisites

- Node.js 16+ and npm or yarn
- Python 3.9+
- Git

## Setup

1) Frontend dependencies
```sh
cd frontend
yarn  # or: npm install
```

2) Environment variables
- Copy `.env.example` (at the repo root) to `.env` and fill in:
  - Wallet private key
  - Infura (or other RPC) project ID / URL
  - Etherscan API key (optional, for verification)

3) Python dependencies (if you use the backend or scripts)
```sh
pip install eth-brownie django web3
```

## Running

Backend (Django):
```sh
cd backend
python manage.py runserver
```

Frontend (React):
```sh
cd frontend
npm start  # or: yarn start
```

## Contracts

Solidity contracts live under `contracts/`. Deployment and helper scripts are in `scripts/`.

