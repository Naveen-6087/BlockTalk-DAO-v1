import { ethers } from "ethers";
import { useState } from "react";
// import axios from "axios";

// export function useGetBalance() {
//     const [userBalance, setUserBalance] = useState();

//     async function getBalance(walletAddress) {
//         await axios.get(`/get_balance?address=${walletAddress}`).then((res) => {
//             const balance = res.data[0].balance
//             const decimals = 18
//             const balanceInMRST = ethers.utils.formatUnits(balance, decimals);
//             setUserBalance(balanceInMRST)

//         }).catch((err) => console.log(err))
//     }

//     return { userBalance, getBalance }
// }

import contractAddress from "../chain-info/deployments/map.json";
import contractABI from "../chain-info/contracts/GovernanceToken.json";

export function useGetBalance() {
    const [userBalance, setUserBalance] = useState();

    async function getBalance(signer, walletAddress) {
        try {
            if (!signer || !signer.provider) {
                console.log("No signer or provider available");
                return;
            }

            const network = await signer.provider.getNetwork();
            const chainIdKey = String(network.chainId);
            const contract = contractAddress[chainIdKey]["GovernanceToken"][0];
            const abi = contractABI.abi;
            const governanceTokenContract = new ethers.Contract(contract, abi, signer.provider);
            
            const balance = await governanceTokenContract.balanceOf(walletAddress);
            const decimals = await governanceTokenContract.decimals();
            const balanceInMRST = ethers.utils.formatUnits(balance, decimals);
            
            setUserBalance(balanceInMRST);
        } catch (err) {
            console.error("Error fetching token balance:", err);
            setUserBalance("0");
        }
    }

    return { userBalance, getBalance };
}