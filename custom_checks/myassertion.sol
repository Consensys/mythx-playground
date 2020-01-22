pragma solidity >=0.4.22 <0.6.0;

contract MyAssertion {
  event AssertionFailed(string message);
  
  // "Vanilla" Solidity assertion
  
  uint256 impossible = 0xbf * 0x7;
  
  function assertion1(uint256 x) public {
    
    assert(x != impossible);
  }    

  // MythX-style assertion
  
  function assertion(uint256 x) public {
      
    if (x == impossible) {
        emit AssertionFailed("Secret value uncovered!");     
    }

  }
}