/*
 * @source: https://ethernaut.openzeppelin.com/level/0x6545df87f57d21cb096a0bfcc53a70464d062512
 * @author: Alejandro Santander (OpenZeppelin)
 */

pragma solidity ^0.5.0;

contract Token {

  mapping(address => uint) balances;
  uint public totalSupply;

  constructor() public {
    balances[msg.sender] = totalSupply = 100000;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0);
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
  }
}
