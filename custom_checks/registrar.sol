/*
 * @source: https://ethernaut.openzeppelin.com/level/0xe83cf387ddfd13a2db5493d014ba5b328589fb5f
 * @author: Adrian Manning (OpenZeppelin)
 */

pragma solidity ^0.4.23;
// A Locked Name Registrar
contract Locked {
    bool public unlocked = false;  // registrar locked, no name updates
    
    struct NameRecord { // map hashes to addresses
        bytes32 name; // 
        address mappedAddress;
    }
    mapping(address => NameRecord) public registeredNameRecord; // records who registered names 
    mapping(bytes32 => address) public resolve; // resolves hashes to addresses
    
    function register(bytes32 _name, address _mappedAddress) public {
        // set up the new NameRecord
        NameRecord newRecord;
        newRecord.name = _name;
        newRecord.mappedAddress = _mappedAddress;
        resolve[_name] = _mappedAddress;
        registeredNameRecord[msg.sender] = newRecord;
        require(unlocked); // only allow registrations if contract is unlocked
    }

    
}