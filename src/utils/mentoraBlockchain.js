import Web3 from 'web3';
import * as mentoraAbi from './Mentora.json';

class MentoraClient {
  constructor(providerUrl, contractAddress, privateKey = null) {
    this.web3 = new Web3(providerUrl);
    this.contractABI = mentoraAbi.abi;
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
  
  async getOwner() {
    return await this.contract.methods.owner().call();
  }
  
  async getPlatformFee() {
    const fee = await this.contract.methods.platformFeePercent().call();
    return parseInt(fee);
  }
  
  async getCourseCount() {
    const count = await this.contract.methods.courseCounter().call();
    return parseInt(count);
  }

  async getAllCourses() {
    const courseCount = await this.getCourseCount();
    const courses = [];
    
    for (let i = 1; i <= courseCount; i++) {
      try {
        const courseInfo = await this.getCourseInfo(i);
        const courseStats = await this.getCourseStats(i);
        courses.push({...courseInfo, ...courseStats});
      } catch (error) {
        console.error(`Error fetching course ${i}:`, error);
      }
    }
    
    return courses;
  }
  
  async createCourse(
    title,
    description,
    category,
    thumbnailIpfsHash,
    contentIpfsHash,
    difficulty,
    duration,
    price,
    moduleCount
  ) {
    const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
    
    const tx = this.contract.methods.createCourse(
      title,
      description,
      category,
      thumbnailIpfsHash,
      contentIpfsHash,
      difficulty,
      duration,
      priceWei,
      moduleCount
    );
    
    return this._sendTransaction(tx);
  }
  
  async updateCourseContent(courseId, contentIpfsHash, moduleCount) {
    const tx = this.contract.methods.updateCourseContent(
      courseId,
      contentIpfsHash,
      moduleCount
    );
    
    return this._sendTransaction(tx);
  }
  
  async updateMaterialCount(courseId, materialCount) {
    const tx = this.contract.methods.updateMaterialCount(
      courseId,
      materialCount
    );
    
    return this._sendTransaction(tx);
  }
  
  async updateCourse(
    courseId,
    title,
    description,
    thumbnailIpfsHash,
    contentIpfsHash,
    price,
    isActive,
    moduleCount
  ) {
    const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
    
    const tx = this.contract.methods.updateCourse(
      courseId,
      title,
      description,
      thumbnailIpfsHash,
      contentIpfsHash,
      priceWei,
      isActive,
      moduleCount
    );
    
    return this._sendTransaction(tx);
  }
  
  async delistCourse(courseId) {
    const tx = this.contract.methods.delistCourse(courseId);
    return this._sendTransaction(tx);
  }
  
  async purchaseCourse(courseId, price) {
    const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
    const tx = this.contract.methods.purchaseCourse(courseId);
    return this._sendTransaction(tx, { value: priceWei });
  }
  
  async requestRefund(courseId) {
    const tx = this.contract.methods.requestRefund(courseId);
    return this._sendTransaction(tx);
  }
  
  async processRefund(courseId, buyerAddress) {
    const tx = this.contract.methods.processRefund(courseId, buyerAddress);
    return this._sendTransaction(tx);
  }
  
  async creatorWithdraw() {
    const tx = this.contract.methods.creatorWithdraw();
    return this._sendTransaction(tx);
  }
  
  async ownerWithdraw() {
    const tx = this.contract.methods.ownerWithdraw();
    return this._sendTransaction(tx);
  }
  
  async changePlatformFee(newFeePercent) {
    const tx = this.contract.methods.changePlatformFee(newFeePercent);
    return this._sendTransaction(tx);
  }
  
  async getCourseInfo(courseId) {
    const courseInfo = await this.contract.methods.getCourseInfo(courseId).call();
    return {
      id: parseInt(courseInfo.id),
      title: courseInfo.title,
      description: courseInfo.description,
      category: courseInfo.category,
      thumbnailIpfsHash: courseInfo.thumbnailIpfsHash,
      difficulty: parseInt(courseInfo.difficulty),
      duration: parseInt(courseInfo.duration)
    };
  }

  async getCourseStats(courseId) {
    const stats = await this.contract.methods.getCourseStats(courseId).call();
    return {
      creator: stats.creator,
      isActive: stats.isActive,
      price: this.web3.utils.fromWei(stats.price, 'ether'),
      totalSales: parseInt(stats.totalSales),
      moduleCount: parseInt(stats.moduleCount),
      enrolledUsers: parseInt(stats.enrolledUsers)
    };
  }

  async getCourseContent(courseId) {
    return await this.contract.methods.getCourseContent(courseId).call();
  }
  
  async getCoursePreview(courseId) {
    return await this.contract.methods.getCoursePreview(courseId).call();
  }
  
  async getUserCourseCount(userAddress) {
    const count = await this.contract.methods.getUserCourseCount(userAddress).call();
    return parseInt(count);
  }
  
  async getCreatorCourseCount(creatorAddress) {
    const count = await this.contract.methods.getCreatorCourseCount(creatorAddress).call();
    return parseInt(count);
  }
  
  async hasUserPurchasedCourse(userAddress, courseId) {
    return await this.contract.methods.hasUserPurchasedCourse(userAddress, courseId).call();
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

export { MentoraClient };