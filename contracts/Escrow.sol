pragma solidity ^0.4.25;

contract Escrow {
    uint256 public price;

    constructor() public payable {
        // the seller creates a Smart Contract
    }

    function cancel() public {
        // the seller cancels created Smart Contract
    }

    function confirmPurchase() public payable {
        // the buyer confirms the purchase
    }

    function confirmReceived() public {
        // the buyer confirms goods received
    }
}