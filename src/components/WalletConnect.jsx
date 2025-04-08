// import { useState, useEffect } from 'react';
// import { FaEthereum } from 'react-icons/fa';
// import { useMentoraContract } from '../hooks/useMentoraContract';

// const WalletConnect = ({ onConnect }) => {
//   const [account, setAccount] = useState('');
//   const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
//   const { initialize, error: clientError } = useMentoraContract();

//   useEffect(() => {
//     checkMetaMaskInstallation();
//     // Listen for account changes
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', handleAccountsChanged);
//     }
//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//       }
//     };
//   }, []);

//   const checkMetaMaskInstallation = () => {
//     if (typeof window.ethereum !== 'undefined') {
//       setIsMetaMaskInstalled(true);
//       // Check if already connected
//       window.ethereum.request({ method: 'eth_accounts' })
//         .then(handleAccountsChanged);
//     }
//   };

//   const handleAccountsChanged = (accounts) => {
//     if (accounts.length > 0) {
//       const newAccount = accounts[0];
//       setAccount(newAccount);
//       if (onConnect) onConnect(newAccount);
//     } else {
//       setAccount('');
//       if (onConnect) onConnect('');
//     }
//   };

//   const connectWallet = async () => {
//     if (isMetaMaskInstalled) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: 'eth_requestAccounts'
//         });
//         handleAccountsChanged(accounts);
//       } catch (error) {
//         console.error('Error connecting wallet:', error);
//       }
//     } else {
//       window.open('https://metamask.io/download/', '_blank');
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4">
//       {!account ? (
//         <button
//           onClick={connectWallet}
//           className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
//         >
//           <FaEthereum className="text-xl" />
//           <span>{isMetaMaskInstalled ? 'Connect MetaMask' : 'Install MetaMask'}</span>
//         </button>
//       ) : (
//         <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center space-x-2">
//           <FaEthereum />
//           <span>
//             {account.slice(0, 6)}...{account.slice(-4)}
//           </span>
//         </div>
//       )}
//       {clientError && (
//         <div className="text-red-500 text-sm">
//           Client error: {clientError}
//         </div>
//       )}
//     </div>
//   );
// };

// export default WalletConnect; 


import { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { useMentoraContract } from '../hooks/useMentoraContract';

// Network configurations
const NETWORKS = {
  OPENCAMPUS: {
    id: 656476,
    name: 'Open Campus Codex',
    icon: '🎓' // Emoji for Open Campus
  },
  SEPOLIA: {
    id: 11155111, // Sepolia testnet
    name: 'Sepolia',
    icon: '🔷' // Emoji for Sepolia
  },
  ARB_SEPOLIA: {
    id: 421614, // Arbitrum Sepolia
    name: 'Arbitrum Sepolia',
    icon: '⚡' // Emoji for Arbitrum
  }
};

const WalletConnect = ({ onConnect, requiredNetwork = 'OPENCAMPUS' }) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { initialize, error: clientError } = useMentoraContract();

  // Get the currently required network based on the prop
  const currentRequiredNetwork = NETWORKS[requiredNetwork] || NETWORKS.OPENCAMPUS;
  
  useEffect(() => {
    if (isConnected && address) {
      // Notify parent component when wallet connects
      if (onConnect) onConnect(address);
      
      // Initialize your contract if needed
      initialize?.();
    }
  }, [address, isConnected, onConnect, initialize]);

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: currentRequiredNetwork.id });
    }
  };

  const isOnRequiredNetwork = chainId === currentRequiredNetwork.id;

  return (
    <div className="flex items-center flex-wrap gap-4">
      {/* RainbowKit's ConnectButton handles wallet connection UI */}
      <ConnectButton showBalance={false} />
      
      {/* Show switch network button if connected but not on required network */}
      {isConnected && !isOnRequiredNetwork && (
        <button
          onClick={handleSwitchNetwork}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>Switch to {currentRequiredNetwork.name}</span>
        </button>
      )}
      
      {/* Show network indicator if on required network */}
      {isConnected && isOnRequiredNetwork && (
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2">
          <span>{currentRequiredNetwork.icon} {currentRequiredNetwork.name}</span>
        </div>
      )}
      
      {/* Display contract errors if any */}
      {clientError && (
        <div className="text-red-500 text-sm">
          Client error: {clientError}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;