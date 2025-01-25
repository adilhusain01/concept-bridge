import { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "./WalletContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/contractHelpers";

const ContractContext = createContext();

const MANTLE_TOKEN_ABI = CONTRACT_ABI;

const MANTLE_TOKEN_ADDRESS = CONTRACT_ADDRESS;

export const ContractProvider = ({ children }) => {
  const { signer, account } = useWallet();
  const [mantleContract, setMantleContract] = useState(null);
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    if (signer && MANTLE_TOKEN_ADDRESS) {
      const contract = new ethers.Contract(
        MANTLE_TOKEN_ADDRESS,
        MANTLE_TOKEN_ABI,
        signer
      );
      setMantleContract(contract);
    }
  }, [signer]);

  useEffect(() => {
    const updateBalance = async () => {
      if (mantleContract && account) {
        try {
          const balance = await mantleContract.balanceOf(account);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    updateBalance();
    // Set up event listener for transfers
    if (mantleContract) {
      mantleContract.on("Transfer", (from, to, value) => {
        if (to.toLowerCase() === account?.toLowerCase()) {
          updateBalance();
        }
      });
    }

    return () => {
      if (mantleContract) {
        mantleContract.removeAllListeners("Transfer");
      }
    };
  }, [mantleContract, account]);

  const claimReward = async () => {
    if (!mantleContract || !account)
      throw new Error("Contract or account not initialized");

    try {
      const tx = await mantleContract.distributeReward(account);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw error;
    }
  };

  return (
    <ContractContext.Provider value={{ mantleContract, balance, claimReward }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => useContext(ContractContext);
