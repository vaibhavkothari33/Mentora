import { useState, useEffect } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { useMentoraContract } from '../hooks/useMentoraContract';

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const { initialize, error: clientError } = useMentoraContract();

  useEffect(() => {
    checkMetaMaskInstallation();
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const checkMetaMaskInstallation = () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsMetaMaskInstalled(true);
      // Check if already connected
      window.ethereum.request({ method: 'eth_accounts' })
        .then(handleAccountsChanged);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const newAccount = accounts[0];
      setAccount(newAccount);
      if (onConnect) onConnect(newAccount);
    } else {
      setAccount('');
      if (onConnect) onConnect('');
    }
  };

  const connectWallet = async () => {
    if (isMetaMaskInstalled) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        handleAccountsChanged(accounts);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {!account ? (
        <button
          onClick={connectWallet}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
        >
          <FaEthereum className="text-xl" />
          <span>{isMetaMaskInstalled ? 'Connect MetaMask' : 'Install MetaMask'}</span>
        </button>
      ) : (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex items-center space-x-2">
          <FaEthereum />
          <span>
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      )}
      {clientError && (
        <div className="text-red-500 text-sm">
          Client error: {clientError}
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 