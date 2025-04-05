import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import EduChain from '../artifacts/contracts/EduChain.sol/EduChain.json';

// Replace with your deployed contract address
const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";

export function useContract() {
    const [contract, setContract] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initContract = async () => {
            try {
                // Check if MetaMask is installed
                if (!window.ethereum) {
                    throw new Error("Please install MetaMask to use this application");
                }

                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                // Create Web3Provider instance
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                
                // Get the signer
                const signer = provider.getSigner();

                // Create contract instance
                const contractInstance = new ethers.Contract(
                    contractAddress,
                    EduChain.abi,
                    signer
                );

                setContract(contractInstance);
            } catch (err) {
                console.error("Failed to initialize contract:", err);
                setError(err.message);
            }
        };

        initContract();

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                initContract();
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        // Cleanup listeners
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', initContract);
            }
        };
    }, []);

    return { contract, error };
}

// Add a helper hook for wallet connection
export function useWallet() {
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error("Please install MetaMask to use this application");
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            // Get chain ID
            const chainId = await window.ethereum.request({
                method: 'eth_chainId'
            });

            setAccount(accounts[0]);
            setChainId(chainId);
        } catch (err) {
            console.error("Failed to connect wallet:", err);
            setError(err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    useEffect(() => {
        // Check if already connected
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        window.ethereum.request({ method: 'eth_chainId' })
                            .then(chainId => setChainId(chainId));
                    }
                });

            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                setAccount(accounts[0] || null);
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                setChainId(chainId);
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners();
            }
        };
    }, []);

    return {
        account,
        chainId,
        isConnecting,
        error,
        connectWallet
    };
}
