// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ToDo} from "../src/ToDo.sol";

/**
 * @title DeployToDo
 * @notice Deployment script for ToDo contract on Mantle Sepolia
 * @dev Run: forge script script/DeployToDo.s.sol --rpc-url https://rpc.sepolia.mantle.xyz --broadcast --private-key <KEY>
 */
contract DeployToDo is Script {
    function run() external returns (ToDo) {
        // The deployer becomes the team lead
        address teamLead = msg.sender;

        vm.startBroadcast();

        ToDo todo = new ToDo(teamLead);

        console.log("ToDo deployed at:", address(todo));
        console.log("Team Lead:", teamLead);
        console.log("Min Stake:", todo.MIN_STAKE());

        vm.stopBroadcast();

        return todo;
    }
}
