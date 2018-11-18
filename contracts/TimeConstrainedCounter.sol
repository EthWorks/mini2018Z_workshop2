pragma solidity ^0.4.25;

contract TimeConstrainedCounter {
    uint32 public value;

    uint256 public startTime;
    uint256 public endTime;

    constructor(uint256 _startTime, uint256 _endTime) public {
        require(_startTime >= now);
        require(_endTime >= _startTime);

        startTime = _startTime;
        endTime = _endTime;
        value = 0;
    }

    function increment() public {
        require(isInTime());
        value += 1;
    }

    function isInTime() public constant returns (bool) {
        return now >= startTime && now <= endTime;
    }
}
