/*
 * @source: https://ethernaut.openzeppelin.com/level/0x234094aac85628444a82dae0396c680974260be7
 * @author: Alejandro Santander (OpenZeppelin)
 * Adapter for solc ^0.5.0 by B. Mueller
 */

pragma solidity ^0.5.0;

import 'SafeMath.sol';

contract Reentrance {
  
  using SafeMath for uint256;
  mapping(address => uint) public balances;

  function donate(address _to) public payable {
    balances[_to] = balances[_to].add(msg.value);
  }

  function balanceOf(address _who) public view returns (uint balance) {
    return balances[_who];
  }

  function withdraw(uint _amount) public {
    if(balances[msg.sender] >= _amount) {
      (bool success, bytes memory retval) = msg.sender.call.value(_amount)("");

	  require(success);

      balances[msg.sender].sub(_amount);
    }
  }

  function() external payable {}
}
