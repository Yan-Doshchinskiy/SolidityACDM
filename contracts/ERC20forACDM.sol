//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract ERC20forACDM is ERC20, AccessControl {

    // variables
    address public contractACDM;

    // roles
    bytes32 private ACDM_CONTRACT = keccak256("ACDM_CONTRACT");

    // constructor
    constructor(string memory name, string memory symbol, address _contractACDM) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ACDM_CONTRACT, _contractACDM);
        contractACDM = _contractACDM;
    }

    // balance changing functions
    function mint(address _account, uint256 _amount) external onlyRole(ACDM_CONTRACT) {
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) external onlyRole(ACDM_CONTRACT) {
        _burn(_account, _amount);
    }

    // change role
    function changeRoleACDM(address _contractACDM)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _revokeRole(ACDM_CONTRACT, contractACDM);
        _grantRole(ACDM_CONTRACT, _contractACDM);
        contractACDM = _contractACDM;
    }
}
