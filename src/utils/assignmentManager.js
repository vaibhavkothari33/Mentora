import Web3 from 'web3';
import * as assignmentManagerAbi from './AssignmentManager.json';

class AssignmentManagerClient {
  constructor(providerUrl, contractAddress, privateKey = null) {
    this.web3 = new Web3(providerUrl);
    this.contractABI = assignmentManagerAbi.abi;
    this.contractAddress = contractAddress;
    this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
    
    if (privateKey) {
      this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(this.account);
      this.defaultAccount = this.account.address;
    }
  }
  
  setDefaultAccount(account) {
    this.defaultAccount = account;
  }

  async createAssignment(title, description, question, evaluationCriteria, metaPrompt) {
    const tx = this.contract.methods.createAssignment(
      title,
      description,
      question,
      evaluationCriteria,
      metaPrompt
    );
    
    return this._sendTransaction(tx);
  }

  async updateAssignment(
    assignmentId,
    title,
    description,
    question,
    evaluationCriteria,
    metaPrompt
  ) {
    const tx = this.contract.methods.updateAssignment(
      assignmentId,
      title,
      description,
      question,
      evaluationCriteria,
      metaPrompt
    );
    
    return this._sendTransaction(tx);
  }

  async deactivateAssignment(assignmentId) {
    const tx = this.contract.methods.deactivateAssignment(assignmentId);
    return this._sendTransaction(tx);
  }

  async getAssignmentCount() {
    return await this.contract.methods.assignmentCounter().call();
  }

  async getAllAssignments() {
    const assignmentCount = await this.getAssignmentCount();
    const assignments = [];
    
    for (let i = 0; i < assignmentCount; i++) {
      const assignment = await this.getAssignment(i);
      assignments.push(assignment);
    }
    
    return assignments;
  }    

  async getAssignment(assignmentId) {
    const result = await this.contract.methods.getAssignment(assignmentId).call();
    return {
      title: result[0],
      description: result[1],
      question: result[2],
      evaluationCriteria: result[3],
      metaPrompt: result[4],
      createdAt: parseInt(result[5]),
      creator: result[6],
      isActive: result[7]
    };
  }

  async getAssignmentQuestion(assignmentId) {
    return await this.contract.methods.getAssignmentQuestion(assignmentId).call();
  }

  async getAssignmentEvaluationCriteria(assignmentId) {
    return await this.contract.methods.getAssignmentEvaluationCriteria(assignmentId).call();
  }

  async getAssignmentMetaPrompt(assignmentId) {
    return await this.contract.methods.getAssignmentMetaPrompt(assignmentId).call();
  }

  async _sendTransaction(tx, options = {}) {
    const from = options.from || this.defaultAccount;
    if (!from) throw new Error('No from address specified');
    
    const gas = options.gas || await tx.estimateGas({ from });
    const gasPrice = options.gasPrice || await this.web3.eth.getGasPrice();
    const value = options.value || '0';
    
    const txParams = {
      from,
      to: this.contractAddress,
      data: tx.encodeABI(),
      gas,
      gasPrice,
      value
    };
    
    if (this.account && from === this.account.address) {
      const signedTx = await this.web3.eth.accounts.signTransaction(txParams, this.account.privateKey);
      return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
    
    return this.web3.eth.sendTransaction(txParams);
  }
}

export { AssignmentManagerClient }; 