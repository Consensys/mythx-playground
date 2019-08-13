/*
 * @source: https://ethernaut.openzeppelin.com/level/0x234094aac85628444a82dae0396c680974260be7
 * @author: Alejandro Santander (OpenZeppelin)
 */

pragma solidity ^0.5.0;

import "./openzeppelin-solidity/Ownable.sol";
import "./openzeppelin-solidity/SafeMath.sol";

contract Fallout is Ownable {
  
  using SafeMath for uint256;
  mapping (address => uint) allocations;

  /* constructor */
  function Fal1out() public payable {
    _owner = msg.sender;
    allocations[_owner] = msg.value;
  }

  function allocate() public payable {
    allocations[msg.sender] = allocations[msg.sender].add(msg.value);
  }

  function sendAllocation(address payable allocator) public {
    require(allocations[allocator] > 0);
    allocator.transfer(allocations[allocator]);
  }

  function collectAllocations() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

  function allocatorBalance(address allocator) public view returns (uint) {
    return allocations[allocator];
  }
}