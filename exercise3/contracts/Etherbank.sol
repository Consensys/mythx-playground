pragma solidity ^0.4.19;

contract EtherBank {
  mapping (address => uint) public balances;
    
  function deposit(address to) payable public {
    balances[to] += msg.value;
  }
    
  function withdraw(uint amount) public {
    if (balances[msg.sender]>= amount) {
      require(msg.sender.call.value(amount)());
      balances[msg.sender] -= amount;
    }
  }  

  function () payable public {
    balances[msg.sender] += msg.value;
  }

  function getBalance(address addr) view public returns(uint){
    return balances[addr];
  }
}
