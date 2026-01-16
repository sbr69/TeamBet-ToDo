// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ToDo} from "../src/ToDo.sol";

/**
 * @title DeployToDo
 * @notice Deployment script for the ToDo contract on Mantle Sepolia
 * @dev Run with: forge script script/DeployToDo.s.sol --rpc-url https://rpc.sepolia.mantle.xyz --broadcast --private-key <YOUR_PRIVATE_KEY>
 */
contract DeployToDo is Script {
    function run() external returns (ToDo) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the ToDo contract
        ToDo todo = new ToDo();

        console.log("ToDo deployed at:", address(todo));

        vm.stopBroadcast();

        return todo;
    }
}
