import React, { createContext, useContext, useState } from "react";
import Web3 from "web3";
import { useWallet } from "./WalletContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/contractHelpers";

export const ContractContext = createContext();

export const ContractProvider = ({ children }) => {
  const { web3, account } = useWallet();
  const [contractError, setContractError] = useState(null);

  const getContract = () => {
    if (!web3) throw new Error("Web3 not initialized");
    return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  };

  const claimReward = async () => {
    try {
      if (!account) throw new Error("No wallet connected");

      const contract = getContract();

      // New implementation with amountInEther as 1
      const txHash = await contract.methods.distributeReward(account, 1).send({
        from: account,
        gas: 300000, // Adjust gas limit as needed
      });

      return txHash.transactionHash;
    } catch (error) {
      setContractError(error.message);
      console.error("Error claiming reward:", error);
      throw error;
    }
  };

  const getContractBalance = async () => {
    try {
      const contract = getContract();
      return await contract.methods.getContractBalance().call();
    } catch (error) {
      setContractError(error.message);
      console.error("Error getting contract balance:", error);
      throw error;
    }
  };

  return (
    <ContractContext.Provider
      value={{
        claimReward,
        getContractBalance,
        contractError,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }
  return context;
};
