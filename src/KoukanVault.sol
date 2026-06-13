// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract KoukanVault is Initializable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public constant ETH_SENTINEL = address(0);

    address public factory;
    uint256 public tokenId;
    address public maker;
    address public counterparty;
    address public offeredToken;
    uint256 public offeredAmount;
    address public wantedToken;
    uint256 public wantedAmount;

    bool public fulfilled;

    error ZeroAddress();
    error NotMaker();
    error NotCounterparty();
    error AlreadyFulfilled();
    error AlreadyDeposited();
    error ETHRejected();
    error InsufficientOfferBalance();
    error WrongMsgValue();

    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 returnedAmount);
    event Fulfilled(
        address indexed maker,
        address indexed counterparty,
        address offeredToken,
        uint256 offeredAmount,
        address wantedToken,
        uint256 wantedAmount
    );

    function initialize(
        address _factory,
        uint256 _tokenId,
        address _maker,
        address _counterparty,
        address _offeredToken,
        uint256 _offeredAmount,
        address _wantedToken,
        uint256 _wantedAmount
    ) external initializer {
        if (_factory == address(0)) revert ZeroAddress();
        if (_maker == address(0)) revert ZeroAddress();
        if (_counterparty == address(0)) revert ZeroAddress();
        if (_wantedToken == address(0)) revert ZeroAddress();
        factory = _factory;
        tokenId = _tokenId;
        maker = _maker;
        counterparty = _counterparty;
        offeredToken = _offeredToken;
        offeredAmount = _offeredAmount;
        wantedToken = _wantedToken;
        wantedAmount = _wantedAmount;
    }

    function deposit() external payable {
        if (fulfilled) revert AlreadyFulfilled();
        if (msg.sender != maker) revert NotMaker();

        if (offeredToken == ETH_SENTINEL) {
            if (msg.value != offeredAmount) revert WrongMsgValue();
            // address(this).balance already includes msg.value; subtract to get pre-deposit balance
            if (address(this).balance - msg.value >= offeredAmount) revert AlreadyDeposited();
        } else {
            if (msg.value != 0) revert WrongMsgValue();
            if (IERC20(offeredToken).balanceOf(address(this)) >= offeredAmount) revert AlreadyDeposited();
            IERC20(offeredToken).safeTransferFrom(maker, address(this), offeredAmount);
        }

        emit Deposited(offeredToken, offeredAmount);
    }

    function withdraw() external nonReentrant {
        if (msg.sender != maker) revert NotMaker();
        if (fulfilled) revert AlreadyFulfilled();

        fulfilled = true;

        uint256 returnAmount;
        if (offeredToken == ETH_SENTINEL) {
            returnAmount = address(this).balance;
            (bool ok,) = payable(maker).call{value: returnAmount}("");
            require(ok, "ETH transfer failed");
        } else {
            returnAmount = IERC20(offeredToken).balanceOf(address(this));
            IERC20(offeredToken).safeTransfer(maker, returnAmount);
        }

        emit Withdrawn(offeredToken, returnAmount);
    }

    function fulfill() external nonReentrant {
        if (msg.sender != counterparty) revert NotCounterparty();
        if (fulfilled) revert AlreadyFulfilled();

        uint256 offerBalance = getOfferBalance();
        if (offerBalance < offeredAmount) revert InsufficientOfferBalance();

        fulfilled = true;

        IERC20(wantedToken).safeTransferFrom(counterparty, maker, wantedAmount);

        if (offeredToken == ETH_SENTINEL) {
            (bool ok,) = payable(counterparty).call{value: offerBalance}("");
            require(ok, "ETH transfer failed");
        } else {
            IERC20(offeredToken).safeTransfer(counterparty, offerBalance);
        }

        emit Fulfilled(maker, counterparty, offeredToken, offeredAmount, wantedToken, wantedAmount);
    }

    function getOfferBalance() public view returns (uint256) {
        if (offeredToken == ETH_SENTINEL) {
            return address(this).balance;
        }
        return IERC20(offeredToken).balanceOf(address(this));
    }

    receive() external payable {
        if (msg.sender != maker) revert ETHRejected();
        if (fulfilled) revert ETHRejected();
        if (offeredToken != ETH_SENTINEL) revert ETHRejected();
    }
}
