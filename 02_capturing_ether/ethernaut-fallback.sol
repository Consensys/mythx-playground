/*
 * @source: https://ethernaut.openzeppelin.com/level/0x234094aac85628444a82dae0396c680974260be7
 * @author: Alejandro Santander (OpenZeppelin)
 */

pragma solidity ^0.5.0;

import "./openzeppelin-solidity/Ownable.sol";
import "./openzeppelin-solidity/SafeMath.sol";

contract Fallback is Ownable {
  
  using SafeMath for uint256;
  mapping(address => uint) public contributions;

  constructor() public {
    contributions[msg.sender] = 1000 * (1 ether);
  }

  function contribute() public payable {
    require(msg.value < 0.001 ether);
    contributions[msg.sender] = contributions[msg.sender].add(msg.value);
    if(contributions[msg.sender] > contributions[_owner]) {
      _owner = msg.sender;
    }
  }

  function getContribution() public view returns (uint) {
    return contributions[msg.sender];
  }

  function withdraw() public onlyOwner {
    _owner.transfer(address(this).balance);
  }

  function() payable external {
    require(msg.value > 0 && contributions[msg.sender] > 0);
    _owner = msg.sender;
  }
}
