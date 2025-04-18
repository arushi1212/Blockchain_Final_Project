//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

//theatre contract inheriting from ERC20
contract theatre is ERC20 {
    address public owner;
    uint256 public moviecount = 0;

    // Constructor that initializes the ERC20 token with a name and symbol
    constructor() ERC20("MockToken", "MTK") {
        owner = msg.sender;
        _mint(owner, 1000000 ether); // Mint initial supply to owner (1M tokens)
    }
    

    struct Movie {
        string title;
        uint256 price; 
        uint256 totalseats;
        uint256 availableseats;
        address[] ticketHolders;
    }

    mapping(uint => Movie) public movies; //movies contans all the individual Movie structs

    //actions only the owner can perform
    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin can perform this action");
        _;
    }

    //double checking movie existence
    modifier movieExists(uint movieid) {
        require(movieid < moviecount, "Movie does not exist.");
        _;
    }

    function addMovie(
        string memory _title,
        uint256 _price,
        uint256 _totalseats
    ) public onlyOwner {
        require(_price > 0, "Price must be more than 0");
        require(_totalseats > 0, "Total seats must be more than 0"); 

        address[] memory emptyArray = new address[](0);

        movies[moviecount] = Movie({
            title: _title,
            price: _price,
            totalseats: _totalseats,
            availableseats: _totalseats,
            ticketHolders: emptyArray
        });

        moviecount++;
    }

    // Funtion to purchase movie tickets
    function buyTicket(string memory name) external{ 
        uint balance = balanceOf(msg.sender);
        uint movieID = moviecount;
        for (uint i = 0; i < moviecount; i++) {
            if (keccak256(abi.encodePacked(movies[i].title)) == keccak256(abi.encodePacked(name))) {
                movieID = i;
                break;
            }
        }
        require(movieID < moviecount, "movie does not exist");
        require(movies[movieID].availableseats != 0, "movie is full");

        uint256 price = movies[movieID].price;

        require(balance >= price, "Insufficient funds");
        
        //bool success = transferFrom(msg.sender, address(this), movies[movieID].price);
        //require(success, "Transfer failed");

        _transfer(msg.sender, address(this), price);
        
        movies[movieID].availableseats--;
        movies[movieID].ticketHolders.push(msg.sender);   
    }

    // Custom function: Mint new tokens (only by owner)
    function mintTokens(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Custom function: Burn tokens (user burns their own tokens)
    function burnTokens(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function getTicketHolders(uint movieId) public view returns (address[] memory) {
        require(movieId < moviecount, "Invalid movie ID");
        return movies[movieId].ticketHolders;
    }
}


