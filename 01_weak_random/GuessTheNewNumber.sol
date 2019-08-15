/*
 * @source: https://capturetheether.com/challenges/lotteries/guess-the-new-number/
 * @author: Steve Marx
 * Modified by B. Mueller
 * NOTE: In the original version the player needs to guess an uint8. 
 * This was changed to an uint256 because solc 0.5.0 disallows casting a bytes32 variable to uint8.
 */

pragma solidity ^0.5.0;

contract GuessTheNewNumberChallenge {

    constructor() public payable {
        require(msg.value == 1 ether);
    }

    function guess(uint256 n) public payable {
        require(msg.value == 1 ether);
        uint256 answer = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), now)));

        if (n == answer) {
            msg.sender.transfer(2 ether);
        }
    }
}
