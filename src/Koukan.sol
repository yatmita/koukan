// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {KoukanVault} from "./KoukanVault.sol";

contract Koukan is ERC721, Ownable, ReentrancyGuard {
    address public currentImpl;
    uint256 public mintFee;
    uint256 public nextId;
    mapping(uint256 => address) public vaults;

    error ZeroAddress();
    error ZeroAmount();
    error InsufficientFee();
    error Soulbound();

    event VaultCreated(
        uint256 indexed tokenId,
        address indexed maker,
        address indexed counterparty,
        address vault,
        address offeredToken,
        uint256 offeredAmount,
        address wantedToken,
        uint256 wantedAmount
    );
    event Locked(uint256 tokenId);
    event ImplUpdated(address indexed oldImpl, address indexed newImpl);
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _impl) ERC721("koukan", "KKN") Ownable(msg.sender) {
        if (_impl == address(0)) revert ZeroAddress();
        currentImpl = _impl;
    }

    function create(
        address counterparty,
        address offeredToken,
        uint256 offeredAmount,
        address wantedToken,
        uint256 wantedAmount
    ) external payable nonReentrant returns (uint256 tokenId, address vault) {
        if (msg.value < mintFee) revert InsufficientFee();
        if (counterparty == address(0)) revert ZeroAddress();
        if (wantedToken == address(0)) revert ZeroAddress();
        if (offeredAmount == 0) revert ZeroAmount();
        if (wantedAmount == 0) revert ZeroAmount();

        tokenId = nextId++;
        vault = Clones.clone(currentImpl);
        vaults[tokenId] = vault;

        _safeMint(msg.sender, tokenId);
        emit Locked(tokenId);

        KoukanVault(payable(vault)).initialize(
            address(this),
            tokenId,
            msg.sender,
            counterparty,
            offeredToken,
            offeredAmount,
            wantedToken,
            wantedAmount
        );

        emit VaultCreated(tokenId, msg.sender, counterparty, vault, offeredToken, offeredAmount, wantedToken, wantedAmount);
    }

    function setMintFee(uint256 newFee) external onlyOwner {
        emit MintFeeUpdated(mintFee, newFee);
        mintFee = newFee;
    }

    function setImpl(address newImpl) external onlyOwner {
        if (newImpl == address(0)) revert ZeroAddress();
        emit ImplUpdated(currentImpl, newImpl);
        currentImpl = newImpl;
    }

    function withdrawFees(address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        (bool ok,) = to.call{value: address(this).balance}("");
        require(ok, "ETH transfer failed");
    }

    function locked(uint256) external pure returns (bool) {
        return true;
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }

    function transferFrom(address, address, uint256) public pure override {
        revert Soulbound();
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert Soulbound();
    }

    function approve(address, uint256) public pure override {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert Soulbound();
    }
}
