//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// Interface for ERC20 token
interface IERC20 {
    function transferFrom(address sender, address recipient, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
}

contract MovieTheater {
    IERC20 public token;
    address public owner;
    uint256 public moviecount = 0;

    constructor() {
        owner = msg.sender;
    }

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    struct Movie {
        string title;
        uint256 price; 
        uint256 totalseats;
        uint256 availableseats;
        uint256 ticketsPurchased;
        address[] ticketHolders;
    }

    mapping(uint => Movie) private movies; //movies contans all the individual Movie structs

    //actions only the owner can perform
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the admin can do this.");
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

        movies[moviecount] = Movie({
            title: _title,
            price: _price,
            totalseats: _totalseats,
            availableseats: _totalseats,
            ticketsPurchased: 0;
        });

        moviecount++;
    }
    // Funtion to purchase movie tickets
    function buyMovie(string name) { 
        uint balance = token.balanceof(msg.sender);
        uint movieID = 0;
        for (int i = 0; i < moviecount; i++) {
            if (movies[moviecount].title == name) {
                movieID = i;
            }
        }
        require(movieID != 0, "movie does not exist");
        require(movies[movieID].availableseats != 0, "movie is full");
        require(balance > movies[movieID].price, "Insufficient funds");
        bool success = token.transferFrom(msg.sender, address(this), _amount);
        require(success, "Transfer failed");
        movies[movieID].availableseats--;
        movies[movieID].ticketHolders[movies[movieID]] = msg.sender;
        movies[movieID].ticketsPurchased++;
        
    }
}
