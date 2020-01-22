/*
  Write a correctness check for the signed integer _add function
*/

pragma solidity ^0.5.9;

contract FixedMath {

    /// @dev Adds two numbers, reverting on overflow.
    function _add(int256 a, int256 b) public pure returns (int256 c) {
        c = a + b;
        if (c > 0 && a < 0 && b < 0) {
            revert();
        }
        if (c < 0 && a > 0 && b > 0) {
            revert();
        }
    }    
}

contract VerifyFixedMath is FixedMath {

    // The sum of two positive numbers or zero and a positive number must be a positive number
    function EnsureAddNoOverflow(int256 a, int256 b) public pure returns (int256) {
        
        // Add code here
    }

    //The sum of two negative numbers or zero and a negative number must be a negative number
    function EnsureAddNoUnderflow(int256 a, int256 b) public pure returns (int256) {

        // Add code here

    }

}