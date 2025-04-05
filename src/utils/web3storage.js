// src/utils/web3storage.
function getStorage() {
  return new Web3Storage({ token });
}

export async function uploadFile(file) {
  try {
    console.log('Uploading file:', file.name);
    const client = getStorage();
    const cid = await client.put([file]);
    console.log('File uploaded with CID:', cid);
    return `https://${cid}.ipfs.w3s.link/${file.name}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function uploadJSON(data) {
  try {
    console.log('Uploading JSON data');
    const client = getStorage();
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], 'data.json');
    const cid = await client.put([file]);
    console.log('JSON uploaded with CID:', cid);
    return `https://${cid}.ipfs.w3s.link/data.json`;
  } catch (error) {
    console.error('Error uploading JSON:', error);
    throw new Error('Failed to upload JSON data');
  }
}