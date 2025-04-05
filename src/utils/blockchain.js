import Web3 from 'web3';
import * as courseMarketplaceABI from './CourseMarketplace.json';

class CourseMarketplaceClient {
  constructor(providerUrl, contractAddress, privateKey = null) {
    this.web3 = new Web3(providerUrl);
    
    // Contract ABI - you would need to extract this from your compiled contract
    this.contractABI = courseMarketplaceABI.abi;
    
    // Contract address
    this.contractAddress = contractAddress;
    
    // Initialize contract instance
    this.contract = new this.web3.eth.Contract(this.contractABI, this.contractAddress);
    
    // Set up account if private key is provided
    if (privateKey) {
      this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      this.web3.eth.accounts.wallet.add(this.account);
      this.defaultAccount = this.account.address;
    }
  }
  
  // Set the default account for transactions
  setDefaultAccount(account) {
    this.defaultAccount = account;
  }
  
  // Get contract owner
  async getOwner() {
    return await this.contract.methods.owner().call();
  }
  
  // Get platform fee percentage
  async getPlatformFee() {
    const fee = await this.contract.methods.platformFeePercent().call();
    return parseInt(fee);
  }
  
  // Get total number of courses
  async getCourseCount() {
    const count = await this.contract.methods.courseCounter().call();
    return parseInt(count);
  }

  // Get all courses
  async getAllCourses() {
    const courseCount = await this.getCourseCount();
    const courses = [];
    
    for (let i = 1; i <= courseCount; i++) {
      try {
        const courseInfo = await this.getCourseInfo(i);
        courses.push(courseInfo);
      } catch (error) {
        console.error(`Error fetching course ${i}:`, error);
      }
    }
    
    return courses;
  }
  
  // Create a new course
  async createCourse(title, description, thumbnailIpfsHash, introVideoIpfsHash, duration, price, options = {}) {
    const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
    
    const tx = this.contract.methods.createCourse(
      title,
      description,
      thumbnailIpfsHash,
      introVideoIpfsHash,
      duration,
      priceWei
    );
    
    return this._sendTransaction(tx, options);
  }
  
  // Add a module to a course
  async addModule(courseId, moduleTitle, moduleIpfsHash, options = {}) {
    const tx = this.contract.methods.addModule(
      courseId,
      moduleTitle,
      moduleIpfsHash
    );
    
    return this._sendTransaction(tx, options);
  }
  
  // Add material to a module
  async addMaterial(courseId, moduleIndex, materialIpfsHash, options = {}) {
    const tx = this.contract.methods.addMaterial(
      courseId,
      moduleIndex,
      materialIpfsHash
    );
    
    return this._sendTransaction(tx, options);
  }
  
  // Update course details
  async updateCourse(courseId, title, description, thumbnailIpfsHash, introVideoIpfsHash, price, isActive, options = {}) {
    const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
    
    const tx = this.contract.methods.updateCourse(
      courseId,
      title,
      description,
      thumbnailIpfsHash,
      introVideoIpfsHash,
      priceWei,
      isActive
    );
    
    return this._sendTransaction(tx, options);
  }
  
  // Update a module
  async updateModule(courseId, moduleIndex, moduleTitle, moduleIpfsHash, options = {}) {
    const tx = this.contract.methods.updateModule(
      courseId,
      moduleIndex,
      moduleTitle,
      moduleIpfsHash
    );
    
    return this._sendTransaction(tx, options);
  }
  
  // Delist a course
  async delistCourse(courseId, options = {}) {
    const tx = this.contract.methods.delistCourse(courseId);
    return this._sendTransaction(tx, options);
  }
  
  // Purchase a course
  async purchaseCourse(courseId, price, options = {}) {
    const priceWei = this.web3.utils.toWei(price.toString(), 'ether');
    
    const tx = this.contract.methods.purchaseCourse(courseId);
    return this._sendTransaction(tx, { value: priceWei, ...options });
  }
  
  // Request a refund
  async requestRefund(courseId, options = {}) {
    const tx = this.contract.methods.requestRefund(courseId);
    return this._sendTransaction(tx, options);
  }
  
  // Process a refund (owner only)
  async processRefund(courseId, buyerAddress, options = {}) {
    const tx = this.contract.methods.processRefund(courseId, buyerAddress);
    return this._sendTransaction(tx, options);
  }
  
  // Creator withdraws their balance
  async creatorWithdraw(options = {}) {
    const tx = this.contract.methods.creatorWithdraw();
    return this._sendTransaction(tx, options);
  }
  
  // Owner withdraws platform fees
  async ownerWithdraw(options = {}) {
    const tx = this.contract.methods.ownerWithdraw();
    return this._sendTransaction(tx, options);
  }
  
  // Change platform fee (owner only)
  async changePlatformFee(newFeePercent, options = {}) {
    const tx = this.contract.methods.changePlatformFee(newFeePercent);
    return this._sendTransaction(tx, options);
  }
  
  // Get course information
  async getCourseInfo(courseId) {
    const courseInfo = await this.contract.methods.getCourseInfo(courseId).call();
    return {
      id: parseInt(courseInfo.id),
      title: courseInfo.title,
      description: courseInfo.description,
      thumbnailIpfsHash: courseInfo.thumbnailIpfsHash,
      creator: courseInfo.creator,
      price: this.web3.utils.fromWei(courseInfo.price, 'ether'),
      isActive: courseInfo.isActive,
      totalSales: parseInt(courseInfo.totalSales),
      moduleCount: parseInt(courseInfo.moduleCount)
    };
  }
  
  // Get course intro video
  async getCourseIntroVideo(courseId) {
    return await this.contract.methods.getCourseIntroVideo(courseId).call();
  }
  
  // Get module titles
  async getModuleTitles(courseId) {
    return await this.contract.methods.getModuleTitles(courseId).call();
  }
  
  // Get module video (requires course purchase)
  async getModuleVideo(courseId, moduleIndex) {
    return await this.contract.methods.getModuleVideo(courseId, moduleIndex).call({
      from: this.defaultAccount
    });
  }
  
  // Get material (requires course purchase)
  async getMaterial(courseId, materialIndex) {
    return await this.contract.methods.getMaterial(courseId, materialIndex).call({
      from: this.defaultAccount
    });
  }
  
  // Get user course count
  async getUserCourseCount(userAddress) {
    const count = await this.contract.methods.getUserCourseCount(userAddress).call();
    return parseInt(count);
  }
  
  // Get creator course count
  async getCreatorCourseCount(creatorAddress) {
    const count = await this.contract.methods.getCreatorCourseCount(creatorAddress).call();
    return parseInt(count);
  }
  
  // Check if user has purchased a course
  async hasUserPurchasedCourse(userAddress, courseId) {
    return await this.contract.methods.hasUserPurchasedCourse(userAddress, courseId).call();
  }
  
  // Get creator balance
  async getCreatorBalance(creatorAddress) {
    const balance = await this.contract.methods.creatorBalance(creatorAddress).call();
    return this.web3.utils.fromWei(balance, 'ether');
  }
  
  // Helper method to send transactions
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
    
    // If we have a private key, sign and send the transaction
    if (this.account && from === this.account.address) {
      const signedTx = await this.web3.eth.accounts.signTransaction(txParams, this.account.privateKey);
      return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
    
    // Otherwise use the connected wallet (e.g. MetaMask)
    return this.web3.eth.sendTransaction(txParams);
  }
}

export { CourseMarketplaceClient };