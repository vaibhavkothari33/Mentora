// src/utils/ipfs.js
export const getIPFSGatewayURL = (ipfsURL) => {
    if (!ipfsURL) return '';
    
    const cid = ipfsURL.replace('ipfs://', '');
    return `https://nftstorage.link/ipfs/${cid}`;
  };