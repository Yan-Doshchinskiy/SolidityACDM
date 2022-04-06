//SPDX-License-Identifier: UNLICENSED

pragma experimental ABIEncoderV2;
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC20forACDM.sol";


contract ACDM is ReentrancyGuard {
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
        uint256[] orders;
    }

    struct _Order {
        RoundStatus status;
        uint256 amount;
        uint256 price;
        address owner;
    }
    // tokens
    ERC20forACDM public TokenACDM;

    // variables
    uint256 private tokenDecimals; // round duration in seconds
    uint256 private percentageDecimals = 10 ** 3; // round duration in seconds
    uint256 public roundDuration; // round duration in seconds
    uint256 public priceRatioPercent; // the percentage by which the price increases in each subsequent round
    uint256 public priceRatioAmount; // the amount of ETH by which the price increases in each subsequent round
    uint256 public mainReferPercent; // the percentage of the spent currency that the main referral receives in sale round
    uint256 public secReferPercent; // the percentage of the spent currency that the second referral receives in sale round
    uint256 public tradeReferPercent; // the percentage of the spent currency that the each referral receives in trade round
    uint256 private roundId = 1;
    uint256 private orderId = 1;

    // mappings
    mapping(address => _User) private users;
    mapping(uint256 => _Round) private rounds;
    mapping(uint256 => _Order) private orders;

    // events
    event Registered(address indexed _user);
    event RoundStarted(uint256 indexed _id, RoundType indexed _roundType, uint256 _time);
    event TokensSold(address indexed _to, uint256 _amount);
    event TokensTraded(address indexed _from,address indexed _to, uint256 _amount, uint256 _price);
    event OrderCreated(address indexed _owner, uint256 _amount, uint256 _price, uint256 _id);
    event OrderFinished(address indexed _owner, uint256 _id);

    // constructor
    constructor (
        uint256 _roundDuration,
        uint256 _roundSupply,
        uint256 _ethAmount,
        uint256 _priceRatioPercent,
        uint256 _priceRatioAmount,
        uint256 _mainReferPercent,
        uint256 _secReferPercent,
        uint256 _tradeReferPercent,
        address _TokenACDM
    ) {
        TokenACDM = ERC20forACDM(_TokenACDM);
        roundDuration = _roundDuration;
        priceRatioPercent = _priceRatioPercent;
        priceRatioAmount = _priceRatioAmount;
        mainReferPercent = _mainReferPercent;
        secReferPercent = _secReferPercent;
        tradeReferPercent = _tradeReferPercent;
        tokenDecimals = 10 ** TokenACDM.decimals();
        _Round storage round = rounds[roundId];
        round.roundType = RoundType.SALE;
        round.supply = _roundSupply;
        round.ethAmount = _ethAmount;
        round.tokenPrice = round.ethAmount / (round.supply / tokenDecimals);
    }
    // modifiers
    modifier _onlyRegistered() {
        require(users[msg.sender].registered, "USER: user is not registered");
        _;
    }

    // view functions
    function getUserData(address _user) external view returns (_User memory) {
        _User memory currentUser = users[_user];
        require(currentUser.registered, "USER: user is not registered");
        return currentUser;
    }

    function getRoundData(uint256 _id) public view returns (_Round memory) {
        require(_id > 0 && _id <= roundId, "ROUND: expect a valid round id");
        return rounds[_id];
    }

    function getOrderData(uint256 _id) public view returns (_Order memory) {
        require(_id > 0 && _id <= orderId, "ROUND: expect a valid order id");
        return orders[_id];
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
        emit Registered(msg.sender);
    }

    // overloaded without _refer argument
    function registration() external {
        _User storage newUser = users[msg.sender];
        require(!newUser.registered, 'REGISTRATION: the user is already registered');
        newUser.registered = true;
        emit Registered(msg.sender);
    }

    // first round launch
    function launchACDM() external {
        _Round storage currentRound = rounds[1];
        require(currentRound.status == RoundStatus.NONE, "ROUND: round already started");
        currentRound.status = RoundStatus.PROGRESS;
        currentRound.startTime = block.timestamp;
        currentRound.endTime = currentRound.startTime + roundDuration;
        TokenACDM.mint(address(this), getRoundData(roundId).supply);
        emit RoundStarted(roundId, currentRound.roundType, block.timestamp);
    }

    function buyTokens(uint256 _amount) external payable nonReentrant _onlyRegistered {
        _Round storage currentRound = rounds[roundId];
        _User memory user = users[msg.sender];
        bool isSaleRoundActive = currentRound.status == RoundStatus.PROGRESS && currentRound.roundType == RoundType.SALE && block.timestamp < currentRound.endTime;
        require(isSaleRoundActive, "ROUND: the sale round is not active");
        require(currentRound.supply >= _amount, "ROUND: insufficient amount of tokens on the contract balance");
        uint256 expectedETH = currentRound.tokenPrice * _amount / tokenDecimals;
        require(expectedETH <= msg.value, "ROUND: not enough ether sent");
        if (msg.value > expectedETH) {
            _withdraw(msg.sender, msg.value - expectedETH);
        }
        if (user.refers.length > 0) {
            if (user.refers.length >= 1) {
                _withdraw(user.refers[0], expectedETH * mainReferPercent / 100 / percentageDecimals);
            }
            if (user.refers.length == 2) {
                _withdraw(user.refers[1], expectedETH * secReferPercent / 100 / percentageDecimals);
            }
        }
        TokenACDM.transfer(msg.sender, _amount);
        currentRound.supply -= _amount;
        emit TokensSold(msg.sender, _amount);
    }

    function createOrder(uint256 _amount, uint256 _price) external payable _onlyRegistered {
        _Round storage currentRound = rounds[roundId];
        uint256 balance = TokenACDM.balanceOf(msg.sender);
        bool isTradeRoundActive = currentRound.status == RoundStatus.PROGRESS && currentRound.roundType == RoundType.TRADE && block.timestamp < currentRound.endTime;
        require(isTradeRoundActive, "TRADE-ROUND: the trade round is not active");
        require(balance >= _amount, "TRADE-ROUND: not enough token on user balance");
        TokenACDM.transferFrom(msg.sender, address(this), _amount);
        orders[orderId] = _Order({
            status: RoundStatus.PROGRESS,
            amount: _amount,
            price: _price,
            owner: msg.sender
        });
        currentRound.orders.push(orderId);
        emit OrderCreated(msg.sender, _amount, _price, orderId);
        orderId += 1;
    }

    function finishOrder(uint256 _id) external {
        _Order storage currentOrder = orders[_id];
        require(currentOrder.status == RoundStatus.PROGRESS, "TRADE-ROUND: order is not in progress");
        require(msg.sender == address(this) || msg.sender == currentOrder.owner, "TRADE-ROUND: you are not an owner");
        currentOrder.status = RoundStatus.FINISHED;
        if (currentOrder.amount > 0) {
            TokenACDM.transfer(currentOrder.owner, currentOrder.amount);
        }
        emit OrderFinished(msg.sender, _id);
    }

    function buyOrder(uint256 _id, uint256 _amount) external payable nonReentrant _onlyRegistered {
        _Round storage currentRound = rounds[roundId];
        _Order storage currentOrder = orders[_id];
        bool isTradeRoundActive = currentRound.status == RoundStatus.PROGRESS && currentRound.roundType == RoundType.TRADE && block.timestamp < currentRound.endTime;
        require(isTradeRoundActive, "TRADE-ROUND: the trade round is not active");
        require(_id > 0 && _id < orderId, "TRADE-ROUND: the order is not exist");
        require(currentOrder.amount >= _amount, "ROUND: insufficient amount of tokens on the owner balance");
        uint256 expectedETH = currentOrder.price * _amount / tokenDecimals;
        _User memory user = users[currentOrder.owner];
        require(expectedETH <= msg.value, "ROUND: not enough ether sent");
        if (msg.value > expectedETH) {
            _withdraw(msg.sender, msg.value - expectedETH);
        }
        uint256 award = expectedETH;
        if (user.refers.length > 0) {
            uint256 referAmount = expectedETH * tradeReferPercent / 100 / percentageDecimals;
            if (user.refers.length >= 1) {
                _withdraw(user.refers[0], referAmount);
                award -= referAmount;
            }
            if (user.refers.length == 2) {
                _withdraw(user.refers[1], referAmount);
                award -= referAmount;
            }
        }
        _withdraw(currentOrder.owner, award);
        currentRound.ethAmount += expectedETH;
        TokenACDM.transfer(msg.sender, _amount);
        currentOrder.amount -= _amount;
        emit TokensTraded(currentOrder.owner, msg.sender, _amount, currentOrder.price);
    }

    function nextRound() external {
        _Round storage currentRound = rounds[roundId];
        require(
            block.timestamp >= currentRound.endTime
            || (currentRound.roundType == RoundType.SALE && currentRound.supply == 0)
        , "ROUND: the round is not finished");
        _finishRound();
        bool isNextRoundSale = currentRound.roundType == RoundType.TRADE && currentRound.ethAmount > 0;
        if (isNextRoundSale) {
            _startSaleRound();
        } else {
            _startTradeRound();
        }
    }

    // utility functions
    function _startSaleRound() internal {
        _Round storage currentRound = rounds[roundId];
        _Round storage prevRound = rounds[roundId - 1];
        currentRound.status = RoundStatus.PROGRESS;
        currentRound.roundType = RoundType.SALE;
        currentRound.startTime = block.timestamp;
        currentRound.endTime = block.timestamp + roundDuration;
        currentRound.ethAmount = prevRound.ethAmount;
        currentRound.tokenPrice = prevRound.tokenPrice + (prevRound.tokenPrice * priceRatioPercent / 100 / percentageDecimals) + priceRatioAmount;
        currentRound.supply = currentRound.ethAmount * tokenDecimals / currentRound.tokenPrice;
        emit RoundStarted(roundId, RoundType.SALE, block.timestamp);

    }

    function _startTradeRound() internal {
        _Round storage currentRound = rounds[roundId];
        currentRound.status = RoundStatus.PROGRESS;
        currentRound.roundType = RoundType.TRADE;
        currentRound.startTime = block.timestamp;
        currentRound.endTime = block.timestamp + roundDuration;
        emit RoundStarted(roundId, RoundType.TRADE, block.timestamp);
    }

    function _finishRound() internal {
        _Round storage currentRound = rounds[roundId];
        currentRound.status = RoundStatus.FINISHED;
        if (currentRound.supply > 0) {
            TokenACDM.burn(address(this), currentRound.supply);
        }
        for (uint256 i = 1; i <= currentRound.orders.length; i++) {
            _Order memory currentOrder = orders[currentRound.orders[i]];
            if (currentOrder.status != RoundStatus.FINISHED) {
                currentOrder.status = RoundStatus.FINISHED;
                if (currentOrder.amount > 0) {
                    _withdraw(currentOrder.owner, currentOrder.amount);
                }
            }
        }
        roundId += 1;
    }

    function _withdraw(address _to, uint256 _amount) private {
        (bool done,) = _to.call{value : _amount}("");
        require(done, "WITHDRAW: an error occurred while sending ETH");
    }

}
