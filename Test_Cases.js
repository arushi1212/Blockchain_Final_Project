const { expect } = require("chai");
const { ethers } = require("hardhat");

describe ("Marketplace", function () {
    let MovieTicket;
    let movieTicket;
    let admin;
    let user;
    let movieId;

    beforeEach(async function() {
        [admin, user] = await ethers.getSigners();
        MovieTicket = await ethers.getContractFactory("MovieTicket");
        movieTicket = await MovieTicket.deploy();
    });

    describe("Admin Controls", function() {
        it("should allow admin to add a new movie", async function() {
            const title = "Avengers";
            const price = ethers.parseEther("100"); // 100 ether
            const seats = 100;

            await movieTicket.connect(admin).addMovie(title, price, seats);

            const movie = await movieTicket.movies(1);   //movie id is 1
            expect(movie.title).to.equal(title);
            expect(movie.price).to.equal(price);
            expect(movie.totalSeats).to.equal(seats);
        });

        it("should not allow non-admin to add a movie", async function () {
            await expect(movieTicket.connect(user).addMovie("Spiderman", ethers.parseEther(1), 100)
        ).to.be.revertedWith("Only admin can perform this action");
        });

        it("Should not allow adding a movie with 0 seats", async function() {
            await expect(movieTicket.connect(admin).addMovie("Free Movie", 0, 10)
        ).to.be.revertedWith("Price must be more than 0");
        });
    });

    describe("Buy Tickets", function () {
        const movieTitle = "Batman";
        const moviePrice = ethers.parseEther("1");
        const seats = 2;
    
        beforeEach(async function () {
          await movieTicket.connect(admin).addMovie(movieTitle, moviePrice, seats);
        });
    
        it("should allow user to buy a ticket", async function () {
          await movieTicket.connect(user).buyTicket(0, { value: moviePrice });
    
          const movie = await movieTicket.movies(0);
          expect(movie.availableSeats).to.equal(seats - 1);
    
          const buyers = await movieTicket.getBuyers(0);
          expect(buyers).to.include(user.address);
        });
    
        it("should fail if movie does not exist", async function () {
          await expect(
            movieTicket.connect(user).buyTicket(5, { value: moviePrice })
          ).to.be.revertedWith("Movie does not exist");
        });
    
        it("should fail if no seats are available", async function () {
          await movieTicket.connect(user).buyTicket(0, { value: moviePrice });
          await movieTicket.connect(user2).buyTicket(0, { value: moviePrice });
    
          // Third user attempts when seats are exhausted
          await expect(
            movieTicket.connect(admin).buyTicket(0, { value: moviePrice })
          ).to.be.revertedWith("No seats available");
        });
    
        it("should fail if payment is incorrect", async function () {
          const wrongAmount = ethers.parseEther("0.5");
          await expect(
            movieTicket.connect(user).buyTicket(0, { value: wrongAmount })
          ).to.be.revertedWith("Incorrect payment amount");
        });
    
        it("should track multiple buyers", async function () {
          await movieTicket.connect(user).buyTicket(0, { value: moviePrice });
          await movieTicket.connect(user2).buyTicket(0, { value: moviePrice });
    
          const buyers = await movieTicket.getBuyers(0);
          expect(buyers).to.include.members([user.address, user2.address]);
        });
      });
    
      describe("Withdraw", function () {
        const moviePrice = ethers.parseEther("1");
    
        beforeEach(async function () {
          await movieTicket.connect(admin).addMovie("Avatar", moviePrice, 1);
          await movieTicket.connect(user).buyTicket(0, { value: moviePrice });
        });
    
        it("should allow admin to withdraw funds", async function () {
          const balanceBefore = await ethers.provider.getBalance(admin.address);
          const tx = await movieTicket.connect(admin).withdraw();
          const receipt = await tx.wait();
    
          const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;
          const balanceAfter = await ethers.provider.getBalance(admin.address);
    
          expect(balanceAfter).to.be.closeTo(balanceBefore.add(moviePrice).sub(gasUsed), ethers.parseEther("0.01"));
        });
    
        it("should not allow non-admin to withdraw funds", async function () {
          await expect(movieTicket.connect(user).withdraw()).to.be.revertedWith(
            "Only admin can perform this action"
          );
        });
      });

});


