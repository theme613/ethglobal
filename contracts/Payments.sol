// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Payments
 * @dev This contract manages PYUSD payments between users.
 * It requires users to approve this contract to spend their PYUSD tokens.
 */
contract Payments is Ownable {
    IERC20 public pyusdToken;

    event PaymentSent(address indexed from, address indexed to, uint256 amount);

    /**
     * @dev Sets the PYUSD token address.
     * @param _pyusdTokenAddress The address of the PYUSD ERC20 token contract.
     */
    constructor(address _pyusdTokenAddress) Ownable(msg.sender) {
        pyusdToken = IERC20(_pyusdTokenAddress);
    }

    /**
     * @dev Allows a user to send PYUSD to another user.
     * The sender must have approved this contract to spend at least the `amount` of PYUSD.
     * @param _to The recipient's address.
     * @param _amount The amount of PYUSD to send.
     */
    function sendPayment(address _to, uint256 _amount) external {
        require(_to != address(0), "Payments: cannot send to the zero address");
        require(_amount > 0, "Payments: amount must be greater than zero");

        // The contract needs to be approved by the sender to spend the amount
        uint256 allowance = pyusdToken.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Payments: check token allowance");

        // Transfer the tokens from the sender to the recipient
        bool success = pyusdToken.transferFrom(msg.sender, _to, _amount);
        require(success, "Payments: token transfer failed");

        emit PaymentSent(msg.sender, _to, _amount);
    }

    /**
     * @dev Allows the owner to update the PYUSD token address.
     * @param _pyusdTokenAddress The new address of the PYUSD token contract.
     */
    function setTokenAddress(address _pyusdTokenAddress) external onlyOwner {
        pyusdToken = IERC20(_pyusdTokenAddress);
    }
}
