#!/usr/bin/env node
/**
 * This programs simulates an RBAC system
 * Author : Vipul Sharma
 */
// imports
import * as cli from "./controller/Prompt";
import Role from "./models/Role";
import User from "./models/User";
import ActionType from "./models/ActionType";
import Resource from "./models/Resource";
import { ACCESS_LEVELS } from "./constants/constant";
import chalk from "chalk";
import Database from "./database/db";
// imports ends

var clear = require("clear");

// init variables and database
const db: Database = new Database();
db.initDB();
const users: User[] = db.users; //store all users here
const roles: Role[] = db.roles; //store all roles here
const resources: Resource[] = db.resources; //store all resource here
const actionTypes: ActionType[] = db.actionTypes; //store all actionTypes here
const quittingText = "Quitting...";
let currentUser: User = db.getCurrentUser(); // get the init current user i.e admin

/**
 * Restarts the CLI menu after waiting for some seconds.(Helps to display info before clearing the console)
 */
const restart = () => {
  console.log(chalk.green("Restarting in 3 Seconds ..."));
  setTimeout(() => {
    main();
  }, 3000);
};

/**
 * Checks if user can access the requested resource and perform action on it
 * @param resource : Resource the user is trying to access
 * @param accessLevelRequested The Access level at which the user is trying to access
 * @returns Boolean , i.e if user can access the resource or not
 */
const checkIfUserCanAccessResource = (
  resource: Resource,
  accessLevelRequested: string
) => {
  //get action type which allows the requested access to the resource
  const actionNameList = actionTypes
    .filter((at: ActionType) => {
      return (
        at.resource.name == resource.name && at.action == accessLevelRequested
      );
    })
    .map((v) => v.name);

  //const actionNameList = actionsForResource.map((v) => v.name);
  if (actionNameList.length < 0) return false;
  else {
    return currentUser.roles.some((role: Role) => {
      return role.actions.some((action: ActionType) => {
        if (actionNameList.includes(action.name)) {
          return true;
        }
      });
    });
    return false;
  }
};
/**
 * Main Method to start the program
 */
const main = async () => {
  clear();
  console.log(
    chalk.yellow.underline(
      `Welcome ${chalk.yellowBright(
        currentUser.name
      )} , select an option below: `
    )
  );
  let selectedOption;
  if (currentUser.name == "Admin")
    selectedOption = await cli.mainMenuAdmin().catch(() => {
      console.log(chalk.red(quittingText));
    });
  else
    selectedOption = await cli.mainMenuUser().catch(() => {
      console.log(chalk.red(quittingText));
    });

  if (!selectedOption) process.exit(0);
  if (selectedOption.id == 0) {
    // Change user
    console.log("Select user to login As");
    //remove current user
    const otherUsers = users.filter(
      (user: User) => user.name != currentUser.name
    );
    if (!otherUsers || otherUsers.length <= 0) {
      console.log(
        chalk.red("No Users to switch to! , create user first . Going Back")
      );
      restart();
    }
    const selectedUser = await cli.listUsersPrompt(otherUsers).catch((e) => {
      restart();
    });
    if (selectedUser) {
      const password = await cli.getInput("Password: ");
      if (password == selectedUser.value.password) {
        console.log("Successfully logged in as " + selectedUser.value.name);
        currentUser = selectedUser.value;
        restart();
      } else {
        console.log(chalk.red("Invalid Password"));
        restart();
      }
    }
  } else if (selectedOption.id == 1) {
    // create a new user
    const newUserQuestion = "Please provide username. ";
    const passwordQuestion = "Please provide user pass. ";
    let id = users.length + 1; //increment id by 1
    const username = await cli.getInput(newUserQuestion);
    const existingUser = users.filter((user) => user.name == username);
    if (existingUser && existingUser.length > 0) {
      console.log("Username Already exists Choose Another.");
      restart();
    }
    const password = await cli.getInput(passwordQuestion);

    const user = new User(id, username, password);
    users.push(user);
    console.log(chalk.green("User Created !"));
    restart();
  } else if (selectedOption.id == 2) {
    // Assign role to user
    const selectedUser = await cli.listUsersPrompt(users).catch((e) => {
      restart();
    });
    if (selectedUser) {
      const selectedRole = await cli.listRolesPrompt(roles).catch((e) => {
        restart();
      });
      if (selectedRole) {
        const result = selectedUser.value.addRole(selectedRole.value);
        if (!result) {
          console.log("Unable to assign role as role already present.");
          restart();
        } else {
          console.log("Role Successfully Assigned");
          restart();
        }
      }
    }
  } else if (selectedOption.id == 3) {
    // Remove role of user
    const selectedUser = await cli.listUsersPrompt(users).catch((e) => {
      restart();
    });
    if (selectedUser) {
      if (selectedUser.value.roles.length <= 0) {
        console.log(
          chalk.yellowBright(selectedUser.value.name),
          chalk.red(" user has No roles assigned. ")
        );
        restart();
      }
      const selectedRole = await cli
        .listRolesPrompt(selectedUser.value.roles)
        .catch((e) => {
          restart();
        });
      if (selectedRole && selectedRole.value) {
        selectedUser.value.removeRole(selectedRole.value);
        console.log(
          "Removed Role ",
          selectedRole.value.name,
          "from ",
          selectedUser.value ? selectedUser.value.name : "User"
        );
        restart();
      }
    }
  } else if (selectedOption.id == 4) {
    // view roles

    if (currentUser.roles.length <= 0) {
      console.log(chalk.red("No Roles Assigned"));
    } else {
      console.log("You have following roles assigned to you");
      currentUser.roles.forEach((role: Role, i: number) => {
        console.log(i, role.name);
      });
    }

    restart();
  } else if (selectedOption.id == 5) {
    //Access Resource
    console.log("Select Resource you want to Access.");
    const selectedResource = await cli
      .listResourcePrompt(resources)
      .catch((e) => {
        restart();
      });
    if (selectedResource) {
      const accessLevelRequested = await cli
        .listPrompt(Object.values(ACCESS_LEVELS))
        .catch((e) => {
          restart();
        });

      if (accessLevelRequested) {
        const accessCheck = checkIfUserCanAccessResource(
          selectedResource.value,
          accessLevelRequested.value
        );
        if (accessCheck) {
          console.log(
            chalk.green("Success !! You can access the resource -> "),
            selectedResource.value.name,
            chalk.green(" to "),
            accessLevelRequested.value
          );
        } else {
          console.log(
            chalk.red("You cannot access the resource -> "),
            selectedResource.value.name,
            chalk.red(" to "),
            accessLevelRequested.value
          );
        }
      }
    }
    restart();
  } else if (selectedOption.id == 6) {
    console.log(chalk.red("You sure you want to Quit!"));
    const sureQuit = await cli.getInput("y or n");
    if (sureQuit == "y") {
      console.log(chalk.red(quittingText));
      process.exit(0);
    } else {
      restart();
    }
  }
};

// Execution starts here
try {
  main();
} catch (e) {
  console.log(chalk.red(quittingText));
  process.exit(0);
}
// execution Ends
