pragma solidity ^0.5.0;

contract EtherBank {
  mapping (address => uint) public balances;

  constructor() public payable{
      require(msg.value == 10 ether);
  }

  function deposit(address to) payable public {
    balances[to] += msg.value;
  }

  function withdraw(uint amount) public {
    if (balances[msg.sender]>= amount) {
      balances[msg.sender] -= amount;
      (bool success, bytes memory data) = msg.sender.call.value(amount)("");
      require(success);
    }
  }

  function challengeSolved() public view returns(bool){
    if (address(this).balance < 1 ether){
        return true;
    }
    return false;
  }

  function() payable external  {
    balances[msg.sender] += msg.value;
  }

  function getBalance(address addr) view public returns(uint){
    return balances[addr];
  }

  function getBankBalance() view public returns(uint){
    return address(this).balance;
  }
}
