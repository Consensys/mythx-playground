pragma solidity ^0.5.0;

contract SimpleDSChief {
    mapping(bytes32=>address) public slates;
    mapping(address=>bytes32) public votes;
    mapping(address=>uint256) public approvals;
    mapping(address=>uint256) public deposits;

    function lock(uint wad) public {
        deposits[msg.sender] = add(deposits[msg.sender], wad);
        addWeight(wad, votes[msg.sender]);
    }

    function free(uint wad) public {
        deposits[msg.sender] = sub(deposits[msg.sender], wad);
        subWeight(wad, votes[msg.sender]);
    }

    function voteYays(address yay) public returns (bytes32) {
        bytes32 slate = etch(yay);
        voteSlate(slate);

        return slate;
    }

    function etch(address yay) public returns (bytes32 slate) {
        bytes32 hash = keccak256(abi.encodePacked(yay));

        slates[hash] = yay;

        return hash;
    }
    
    function voteSlate(bytes32 slate) public {
        uint weight = deposits[msg.sender];
        subWeight(weight, votes[msg.sender]);
        votes[msg.sender] = slate;
        addWeight(weight, votes[msg.sender]);
    }

    function addWeight(uint weight, bytes32 slate) internal {
        address yay = slates[slate];
        approvals[yay] = add(approvals[yay], weight);
    }

    function subWeight(uint weight, bytes32 slate) internal {
        address yay = slates[slate];
        approvals[yay] = sub(approvals[yay], weight);
    }

    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x);
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x);
    }
    
}

contract VerifySimpleDSChief is SimpleDSChief {
    
    constructor() public {
        lockForActor(msg.sender, 1);
        lockForActor(0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF, 1);
        lockForActor(0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa, 1);
    }
    
    function lockForActor(address addr, uint amount) internal {
        deposits[addr] = amount;
        addWeight(amount, votes[addr]);                
    }

    modifier checkInvariants {

        _;

        /* Write an invariant that ensures that the approval weight of the address
        voted for by the user >= the balance of the user.
        */
    }

    function voteYays(address yay) public checkInvariants returns (bytes32) {
        return super.voteYays(yay);
    }

    function etch(address yay) public checkInvariants returns (bytes32 slate) {
        return super.etch(yay);
    }
    
    function voteSlate(bytes32 slate) public checkInvariants {
        super.voteSlate(slate);
    }

}