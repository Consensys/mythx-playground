pragma solidity ^0.4.25;

contract Wallet {
    uint[] private bonusCodes;
    address public owner;

    constructor() public {
        bonusCodes = new uint[](0);
        owner = msg.sender;
    }

    function () public payable {
    }

    function PushBonusCode(uint c) public {
        bonusCodes.push(c);
    }

    function PopBonusCode() public {
        require(0 <= bonusCodes.length);
        bonusCodes.length--;
    }

    function UpdateBonusCodeAt(uint idx, uint c) public {
        require(idx < bonusCodes.length);
        bonusCodes[idx] = c;
    }

    function Destroy() public {
        require(msg.sender == owner);
        selfdestruct(msg.sender);
    }
}

contract VerifyWallet is Wallet {

	modifier checkInvariants {
		address _owner_pre = owner;

		_;

        /* Write a postcondition that ensures that the owner doesn't change unless the transaction
        originates from the previous owner. */

	}

     function PushBonusCode(uint c) public checkInvariants {
         super.PushBonusCode(c);
     }

    function PopBonusCode() public checkInvariants {
     super.PopBonusCode();
    }

    function UpdateBonusCodeAt(uint idx, uint c) public checkInvariants {
        super.UpdateBonusCodeAt(idx, c);
    }

    function Destroy() public checkInvariants {
        super.Destroy();
    }

}
