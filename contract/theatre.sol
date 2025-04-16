//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// Interface for ERC20 token
interface IERC20 {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
}



contract MovieTicket {
    IERC20 public token;
    address public owner;
    uint256 public moviecount = 0;

    constructor(address _tokenAddress) {
        owner = msg.sender;
        token = IERC20(_tokenAddress);
    }
    

    struct Movie {
        string title;
        uint256 price; 
        uint256 totalseats;
        uint256 availableseats;
        address[] ticketHolders;
    }

    mapping(uint => Movie) private movies; //movies contans all the individual Movie structs

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
        uint256 _totalseats,
        uint256 _showtime
    ) public onlyOwner {
        require(_price > 0, "Price must be more than 0");
        require(_totalseats > 0, "Total seats must be more than 0"); 

        address[] memory emptyArray;

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
        uint balance = token.balanceOf(msg.sender);
        uint movieID = moviecount;
        for (uint i = 0; i < moviecount; i++) {
            if (keccak256(abi.encodePacked(movies[i].title)) == keccak256(abi.encodePacked(name))) {
                movieID = i;
                break;
            }
        }
        require(movieID < moviecount, "movie does not exist");
        require(movies[movieID].availableseats != 0, "movie is full");
        require(balance > movies[movieID].price, "Insufficient funds");
        bool success = token.transferFrom(msg.sender, address(this), movies[movieID].price);
        require(success, "Transfer failed");
        movies[movieID].availableseats--;
        movies[movieID].ticketHolders.push(msg.sender);

        
    }
}



