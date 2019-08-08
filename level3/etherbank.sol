pragma solidity ^0.5.0;

contract EtherBank {
  mapping (address => uint) public balances;
  uint min_withdraw = 1 ether;

  constructor() public payable{
      require(msg.value == 10 ether);
  }

  function deposit() payable public {
    balances[msg.sender] += msg.value;
  }

  function withdraw(uint _amount) public {
    require(_amount >= min_withdraw);
    require(balances[msg.sender] >= _amount);
    balances[msg.sender] -= _amount;
    msg.sender.transfer(_amount);
  }

  function refund() public {
    require(balances[msg.sender] > 0);
    msg.sender.transfer(balances[msg.sender]);
  }
  function getBalance(address addr) view public returns(uint){
    return balances[addr];
  }

  function getBankBalance() view public returns(uint){
    return address(this).balance;
  }

}
