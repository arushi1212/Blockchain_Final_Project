//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MovieTheater {
    address public owner;
    uint public movieCount = 0;

    constructor() {
        owner = msg.sender;
    }

    //testing
}
