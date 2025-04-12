//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MovieTheater {
    address public owner;
    uint256 public moviecount = 0;

    constructor() {
        owner = msg.sender;
    }

    struct Movie {
        string title;
        uint256 price; 
        uint256 totalseats;
        uint256 availableseats;
        uint256 showtime;
        address[] ticketholders;
        mapping(address => uint) ticketsbought;
    }

    mapping(uint => Movie) public movies;

    modifier onlyowner() {
        require(msg.sender == owner, "Only the admin can do this.");
        _;
    }
}
