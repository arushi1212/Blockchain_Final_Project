const { expect } = require("chai");
const { ethers } = require("hardhat");

describe ("theatre", function () {
    let theatre;
    let admin;
    let user1;
    let user2;
    let user3;

    const initialSupply = ethers.parseEther("1000");
    const ticketPrice = ethers.parseEther("10");

    beforeEach(async function () {
      [admin, user1, user2, user3] = await ethers.getSigners();

      // Deploy a mock ERC20 token
      const Theatre = await ethers.getContractFactory("theatre");
      theatre = await Theatre.deploy();
      await theatre.waitForDeployment();

      // Transfer tokens to users
      await theatre.transfer(user1.address, ethers.parseEther("100"));
      await theatre.transfer(user2.address, ethers.parseEther("100"));
      await theatre.transfer(user3.address, ethers.parseEther("0.5")); //for insufficient funds test case


      // get the theatre contract address first
      const theatreAddress = await theatre.getAddress();

      // Users approve MovieTicket contract to spend tokens
      await theatre.connect(user1).approve(theatreAddress, ethers.parseEther("1000"));
      await theatre.connect(user2).approve(theatreAddress, ethers.parseEther("1000"));
      await theatre.connect(user2).approve(theatreAddress, ethers.parseEther("1000"));
    });
    

    describe("Admin Controls", function () {
      it("should allow admin to add a movie", async function () {
        await theatre.connect(admin).addMovie("Inception", ticketPrice, 50);
  
        const movie = await theatre.movies(0);
        expect(movie.title).to.equal("Inception");
        expect(movie.price).to.equal(ticketPrice);
        expect(movie.totalseats).to.equal(50);
        expect(movie.availableseats).to.equal(50);
      });
  
      it("should not allow non-admin to add a movie", async function () {
        await expect(
          theatre.connect(user1).addMovie("Avengers", ticketPrice, 50)
        ).to.be.revertedWith("Only admin can perform this action");
      });

      it("should not allow adding a movie with 0 seats", async function () {
        await expect(
          theatre.connect(admin).addMovie("EmptyShow", ticketPrice, 0)
        ).to.be.revertedWith("Total seats must be more than 0");
    });
  });

    describe("Buying Tickets", function () {
      beforeEach(async () => {
        await theatre.connect(admin).addMovie("Dune", ticketPrice, 2);
      });
  
      it("should allow user to buy a ticket with tokens", async function () {
        const initialUser1Balance = await theatre.balanceOf(user1.address);
        await theatre.connect(user1).buyTicket("Dune");
        const finalUser1Balance = await theatre.balanceOf(user1.address);
        const movie = await theatre.movies(0);
        expect(movie.availableseats).to.equal(1);
        expect(finalUser1Balance).to.equal(initialUser1Balance - ticketPrice);

        const theatreAddress = await theatre.getAddress()
        expect(await theatre.balanceOf(theatreAddress)).to.equal(ticketPrice);
      });
  
      it("should fail if user has insufficient funds", async function () {
        await expect(
          theatre.connect(user3).buyTicket("Dune")
        ).to.be.revertedWith("Insufficient funds");
      });
  
      it("should fail if movie is full", async function () {
        await theatre.connect(user1).buyTicket("Dune");
        await theatre.connect(user2).buyTicket("Dune");
  
        await expect(
          theatre.connect(admin).buyTicket("Dune")
        ).to.be.revertedWith("movie is full");
      });
  
      it("should fail if movie doesn't exist", async function () {
        await expect(
          theatre.connect(user1).buyTicket("NonExistentMovie")
        ).to.be.revertedWith("movie does not exist");
      });
  
      it("should track ticket holders", async function () {
        await theatre.connect(user1).buyTicket("Dune");
        await theatre.connect(user2).buyTicket("Dune");
  
        const movie = await theatre.movies(0);
        const holders = await theatre.getTicketHolders(0);
        expect(holders.length).to.equal(2);
        expect(holders).to.include.members([user1.address, user2.address]);
      });
    });

});


