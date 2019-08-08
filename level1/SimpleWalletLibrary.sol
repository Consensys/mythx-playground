// SimpleWalletLibrary
// A simplified version of the (in)famous multi-sig, daily-limited account proxy/wallet.
// @authors:
// Gav Wood <g@ethdev.com>
// Adapted by B. Mueller

pragma solidity ^0.5.0;

contract WalletEvents {
  // EVENTS

  // this contract only has six types of events: it can accept a confirmation, in which case
  // we record owner and operation (hash) alongside it.
  event Confirmation(address owner, bytes32 operation);
  event Revoke(address owner, bytes32 operation);

  // some others are in the case of an owner changing.
  event OwnerChanged(address oldOwner, address newOwner);
  event OwnerAdded(address newOwner);
  event OwnerRemoved(address oldOwner);

  // the last one is emitted if the required signatures change
  event RequirementChanged(uint newRequirement);

  // Funds has arrived into the wallet (record how much).
  event Deposit(address _from, uint value);
  // Single transaction going out of the wallet (record who signed for it, how much, and to whom it's going).
  event SingleTransact(address owner, uint value, address to, bytes data, address created);
  // Multi-sig transaction going out of the wallet (record who signed for it last, the operation hash, how much, and to whom it's going).
  event MultiTransact(address owner, bytes32 operation, uint value, address to, bytes data, address created);
  // Confirmation still needed for a transaction.
  event ConfirmationNeeded(bytes32 operation, address initiator, uint value, address to, bytes data);
}

contract WalletAbi {
  // Revokes a prior confirmation of the given operation
  function revoke(bytes32 _operation) external;

  // Replaces an owner `_from` with another `_to`.
  function changeOwner(address _from, address _to) external;

  function addOwner(address _owner) external;

  function removeOwner(address _owner) external;

  function changeRequirement(uint _newRequired) external;

  function isOwner(address _addr) view public returns (bool);

  function hasConfirmed(bytes32 _operation, address _owner) external view returns (bool);

  // (re)sets the daily limit. needs many of the owners to confirm. doesn't alter the amount already spent today.
  function setDailyLimit(uint _newLimit) external;

  function execute(address _to, uint _value, bytes calldata _data) external returns (bytes32 o_hash);
  function confirm(bytes32 _h) public returns (bool o_success);
}

contract SimpleWalletLibrary is WalletEvents {
  // TYPES

  // struct for the status of a pending operation.
  struct PendingState {
    uint yetNeeded;
    uint ownersDone;
    uint index;
  }

  // Transaction structure to remember details of transaction lest it need be saved for a later call.
  struct Transaction {
    address to;
    uint value;
    bytes data;
  }

 // FIELDS
  address constant _walletLibrary = 0xCAfEcAfeCAfECaFeCaFecaFecaFECafECafeCaFe;

  // the number of owners that must confirm the same operation before it is run.
  uint public m_required;
  // pointer used to find a free slot in m_owners
  uint public m_numOwners;

  uint public m_dailyLimit;
  uint public m_spentToday;
  uint public m_lastDay;

  // list of owners
  uint[256] m_owners;

  uint constant c_maxOwners = 250;
  // index on the list of owners to allow reverse lookup
  mapping(uint => uint) m_ownerIndex;
  // the ongoing operations.
  mapping(bytes32 => PendingState) m_pending;
  bytes32[] m_pendingIndex;

  // pending transactions we have at present.
  mapping (bytes32 => Transaction) m_txs;

  // MODIFIERS

  // simple single-sig function modifier.
  modifier onlyowner {
    if (isOwner(msg.sender))
      _;
  }

  // determines today's index.
  function today() private view returns (uint) { return now / 1 days; }  

  // constructor - stores initial daily limit and records the present day's index.
  function initDaylimit(uint _limit) public only_uninitialized {
    m_dailyLimit = _limit;
    m_lastDay = today();
  }

  // throw unless the contract is not yet initialized.
  modifier only_uninitialized { if (m_numOwners > 0) revert(); _; }

  // constructor - just pass on the owner array to the multiowned and
  // the limit to daylimit
  function initWallet(address[] memory _owners, uint _required, uint _daylimit) public only_uninitialized {
    initDaylimit(_daylimit);
    initMultiowned(_owners, _required);
  }
  
    // constructor is given number of sigs required to do protected "onlymanyowners" transactions
  // as well as the selection of addresses capable of confirming them.
  function initMultiowned(address[] memory _owners, uint _required) internal only_uninitialized {
    m_numOwners = _owners.length + 1;
    m_owners[1] = uint(msg.sender);
    m_ownerIndex[uint(msg.sender)] = 1;
    
    m_required = _required;
  }
  
  // METHODS

  // gets called when no other function matches
  function() external payable {
    // just being sent some cash?
    if (msg.value > 0)
      emit Deposit(msg.sender, msg.value);
  }
  
  function isOwner(address _addr) public view returns (bool) {
    return m_ownerIndex[uint(_addr)] > 0;
  }

  // kills the contract sending everything to `_to`.
  function kill(address payable _to) onlyowner external {
    selfdestruct(_to);
  }

}
