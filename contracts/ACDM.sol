//SPDX-License-Identifier: UNLICENSED

pragma experimental ABIEncoderV2;
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./ERC20forACDM.sol";


contract ACDM is AccessControl {
    // enums
    enum RoundStatus {
        NONE,
        PROGRESS,
        FINISHED
    }
    enum RoundType {
        NONE,
        SALE,
        TRADE
    }
    // structs
    struct _User {
        bool registered;
        address[] refers;
    }

    struct _Round {
        RoundStatus status;
        RoundType roundType;
        uint256 startTime;
        uint256 endTime;
        uint256 supply;
        uint256 ethAmount;
        uint256 tokenPrice;
    }
    // tokens
    ERC20forACDM public TokenACDM;

    // variables
    uint256 public roundDuration; // round duration in seconds
    uint256 public priceRatioPercent; // the percentage by which the price increases in each subsequent round
    uint256 public priceRatioAmount; // the amount of ETH by which the price increases in each subsequent round
    uint256 private roundId;

    // mappings
    mapping(address => _User) private users;
    mapping(uint256 => _Round) private rounds;


    // constructor
    constructor (uint256 _roundDuration, uint256 _roundSupply, uint256 _ethAmount, uint256 _priceRatioPercent, uint256 _priceRatioAmount, address _TokenACDM) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        TokenACDM = ERC20forACDM(_TokenACDM);
        roundDuration = _roundDuration;
        priceRatioPercent = _priceRatioPercent;
        priceRatioAmount = _priceRatioAmount;
        roundId = 1;
        _Round storage round = rounds[roundId];
        round.roundType = RoundType.SALE;
        round.supply = _roundSupply;
        round.ethAmount = _ethAmount;
        round.tokenPrice = _getTokenPriceById(roundId);
    }

    // view functions
    function getUserData(address _user) external view returns (_User memory) {
        _User memory currentUser = users[_user];
        require(currentUser.registered, "USER: user is not registered");
        return currentUser;
    }

    function getRoundData(uint256 _id) external view returns (_Round memory) {
        require(_id > 0 && _id <= roundId, "ROUND: expect a valid round id");
        return rounds[_id];
    }

    // registration
    function registration(address _refer) external {
        require(_refer != msg.sender, 'REGISTRATION: you cannot specify yourself as a referral');
        _User storage newUser = users[msg.sender];
        require(!newUser.registered, 'REGISTRATION: the user is already registered');
        newUser.registered = true;
        _User memory referUser = users[_refer];
        if (referUser.registered) {
            newUser.refers.push(_refer);
            if (referUser.refers.length > 0) {
                newUser.refers.push(referUser.refers[0]);
            }
        }
    }

    // overloaded without _refer argument
    function registration() external {
        _User storage newUser = users[msg.sender];
        require(!newUser.registered, 'REGISTRATION: the user is already registered');
        newUser.registered = true;
    }

    // utility functions
    function _getTokenPriceById(uint256 _id) internal view returns (uint256) {
        _Round memory round = rounds[_id];
        return round.ethAmount / round.supply;
    }
}
