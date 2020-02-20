pragma solidity >=0.4.25 <0.7.0;

import "./ConvertLib.sol";

library OwnerHelperLibrary {
	function isOwner(address owner) public returns(bool) {
		return owner == msg.sender;
  	}
}

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!
contract MetaCoin {
	mapping (address => uint) balances;
  	address public owner;
	event Transfer(address indexed _from, address indexed _to, uint256 _value);

	constructor() public {
		owner = msg.sender;
		balances[tx.origin] = 10000;
	}

	modifier onlyOwner() {
    	require(Killable.isOwner(owner));
    	_;
  	}
	
	function transferOwnership(address newOwner) public {
		require(newOwner != address(0));
		owner = newOwner;
  	}

	function kill() public onlyOwner {
		selfdestruct(msg.sender);
	}

	function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		emit Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalanceInEth(address addr) public view returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) public view returns(uint) {
		return balances[addr];
	}
}
