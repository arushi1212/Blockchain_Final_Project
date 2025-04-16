const { expect } = require("chai");
const { ethers } = require("hardhat");

describe ("Marketplace", function () {
    let MovieTicket;
    let movieTicket;
    let admin;
    let user1;
    let user2;
    let Token;
    let token;

    const initialSupply = ethers.parseEther("1000");
    const ticketPrice = ethers.parseEther("10");

    beforeEach(async function () {
      [admin, user1, user2] = await ethers.getSigners();

      // Deploy a mock ERC20 token
      Token = await ethers.getContractFactory("MyToken");
      token = await Token.deploy("TestToken", "TT", initialSupply);
      await token.waitForDeployment();

      // Deploy MovieTicket contract with the ERC20 token address
      MovieTicket = await ethers.getContractFactory("MovieTicket");
      movieTicket = await MovieTicket.deploy(token.target);
      await movieTicket.waitForDeployment();

      // Transfer tokens to users
      await token.transfer(user1.address, ethers.parseEther("100"));
      await token.transfer(user2.address, ethers.parseEther("100"));

      // Users approve MovieTicket contract to spend tokens
      await token.connect(user1).approve(movieTicket.target, ethers.parseEther("100"));
      await token.connect(user2).approve(movieTicket.target, ethers.parseEther("100"));
    });
    

    describe("Admin Controls", function () {
      it("should allow admin to add a movie", async function () {
        await movieTicket.connect(admin).addMovie("Inception", ticketPrice, 50, 0);
  
        const movie = await movieTicket.movies(0);
        expect(movie.title).to.equal("Inception");
        expect(movie.price).to.equal(ticketPrice);
        expect(movie.totalseats).to.equal(50);
        expect(movie.availableseats).to.equal(50);
      });
  
      it("should not allow non-admin to add a movie", async function () {
        await expect(
          movieTicket.connect(user1).addMovie("Avengers", ticketPrice, 50, 0)
        ).to.be.revertedWith("Only the admin can do this.");
      });

      it("should not allow adding a movie with 0 seats", async function () {
        await expect(
          movieTicket.connect(admin).addMovie("EmptyShow", ticketPrice, 0, 0)
        ).to.be.revertedWith("Total seats must be greater than 0");
    });
  });

    describe("Buy Tickets", function () {
      beforeEach(async function () {
        await movieTicket.connect(admin).addMovie("Dune", ticketPrice, 2, 0);
      });
  
      it("should allow user to buy a ticket with tokens", async function () {
        await movieTicket.connect(user1).buyTicket("Dune");
  
        const movie = await movieTicket.movies(0);
        expect(movie.availableseats).to.equal(1);
      });
  
      it("should fail if user has not approved enough tokens", async function () {
        await token.connect(user1).approve(movieTicket.target, ethers.parseEther("5")); // too low
  
        await expect(
          movieTicket.connect(user1).buyTicket("Dune")
        ).to.be.revertedWith("Transfer failed");
      });
  
      it("should fail if movie is full", async function () {
        await movieTicket.connect(user1).buyTicket("Dune");
        await movieTicket.connect(user2).buyTicket("Dune");
  
        await expect(
          movieTicket.connect(admin).buyTicket("Dune")
        ).to.be.revertedWith("movie is full");
      });
  
      it("should fail if movie doesn't exist", async function () {
        await expect(
          movieTicket.connect(user1).buyTicket("NonExistentMovie")
        ).to.be.revertedWith("movie does not exist");
      });
  
      it("should track ticket holders", async function () {
        await movieTicket.connect(user1).buyTicket("Dune");
        await movieTicket.connect(user2).buyTicket("Dune");
  
        const movie = await movieTicket.movies(0);
        expect(movie.ticketHolders.length).to.equal(2);
      });
    });

});


