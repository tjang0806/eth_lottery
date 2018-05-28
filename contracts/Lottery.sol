pragma solidity ^0.4.17;

//lottery Contract
// user can join the lottery with minimum participation fee of 0.01 ether
// only manager can pick the winner with psudo random way
contract Lottery {
    address public manager;
    address[] public players;

    // constructor
    // the first one who interact with lottery is the manager
    function Lottery() public {
        manager = msg.sender;
    }

    // function for entering the lottery
    function enter() public payable{
        // requirement of minimum 0.01 ether
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }

    // function for random number generation 0 ~ number of users-1
    function random() private view returns (uint){
        return uint (keccak256(block.difficulty, now, players));

    }

    // function for picking the winner
    function pickWinner() public restricted {

        uint index = random() % players.length;
        players[index].transfer(this.balance); // for example 0x109853333
        players = new address[](0);
    }

    // modifier for manager only feature
    modifier restricted(){
         require(msg.sender == manager);
         _;// consider as targer
    }

    // function for gettting list of players
    function getPlayers() public view returns(address[]){
        return players;
    }
}
