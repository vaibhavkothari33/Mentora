// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CertificateNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Certificate {
        uint256 courseId;
        string studentName;
        uint256 completionDate;
        string ipfsHash; // For certificate metadata
        uint256 score;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => bool) public courseCertificates; // courseId => hasCertificate

    constructor() ERC721("EduChain Certificate", "EDUCERT") Ownable(msg.sender) {}

    event CertificateMinted(
        uint256 indexed tokenId,
        uint256 indexed courseId,
        address student,
        uint256 score
    );

    function mintCertificate(
        address student,
        uint256 courseId,
        string memory studentName,
        string memory ipfsHash,
        uint256 score
    ) external onlyOwner returns (uint256) {
        require(!courseCertificates[courseId], "Certificate already minted for this course");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(student, newTokenId);

        certificates[newTokenId] = Certificate({
            courseId: courseId,
            studentName: studentName,
            completionDate: block.timestamp,
            ipfsHash: ipfsHash,
            score: score
        });

        courseCertificates[courseId] = true;

        emit CertificateMinted(newTokenId, courseId, student, score);
        return newTokenId;
    }

    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certificates[tokenId];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
} 