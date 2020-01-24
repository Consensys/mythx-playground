pragma solidity ^0.5.0;

contract PrimeFactorizationBounty {
    
    event AssertionFailed(string message);

    // We're pretty sure this number is prime. If we're wrong we're in trouble. 
    uint256 public largePrime = 973013;

    constructor() public payable {
      // Deploy this contract with a bounty payout
      require(msg.value >= 1 ether);
    }

    // The bounty can be claimed by anyone who can factor our `largePrime` number
    function claimFactorizationBounty(uint256 x, uint256 y) external {
        // input validation
        require(x > 1 && y > 1, "One doesn't count");
        require(x< largePrime && y < largePrime, "No sense looking too high");
        
        if (x*y == largePrime) {
          msg.sender.call.value(address(this).balance)("");
          // Insert an assertion event so that we can use MythX to search for prime factors before we deploy.
          emit AssertionFailed("Turns out it's not prime."); 
        }
    }
}