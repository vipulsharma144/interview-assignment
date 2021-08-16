/**
 * Used to render prompts to user to get Input
 * uses cli-select and readline
 */
import User from "../models/User";
import cli from "cli-select";
import chalk from "chalk";
import Role from "../models/Role";
import ActionType from "../models/ActionType";
import Resource from "../models/Resource";

/**
 * get input from user as string
 * @param question The text to display for user input
 * @returns string
 */
export const getInput = (question: string): Promise<string> => {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // readline.on("SIGINT", () => {
  //   console.log("Quitting");
  // });
  return new Promise((resolve, reject) => {
    readline.question(question, (value: string) => {
      readline.close();
      if (value && value != "") resolve(value);
      else reject("error");
    });
  });
};

export const mainMenuAdmin = () => {
  const options = {
    values: [
      "Login as another User",
      "Create User",
      "Assign Role",
      "Unassign Role",
      "View My Roles",
      "Access Resource",
      "Quit",
    ],
  };
  return cli(options);
};

export const mainMenuUser = () => {
  const options = {
    values: {
      0: "Login as another User",
      4: "View My Roles",
      5: "Access Resource",
      6: "Quit",
    },
  };
  return cli(options);
};

export const listUsersPrompt = (users: User[]) => {
  const options = {
    values: users,
    valueRenderer: (value: User, selected: boolean) => {
      if (selected) {
        return chalk.underline(value.name);
      }
      return value.name;
    },
  };
  return cli(options);
};

export const listRolesPrompt = (roles: Role[]) => {
  const options = {
    values: roles,
    valueRenderer: (value: Role, selected: boolean) => {
      if (selected) {
        return chalk.underline(value.name);
      }
      return value.name;
    },
  };
  return cli(options);
};

export const listActionTypePrompt = (role: Role) => {
  const options = {
    values: role.actions,
    valueRenderer: (value: ActionType, selected: boolean) => {
      if (selected) {
        return chalk.underline(value.name);
      }
      return value.name;
    },
  };
  return cli(options);
};

export const listResourcePrompt = (resource: Resource[]) => {
  const options = {
    values: resource,
    valueRenderer: (value: Resource, selected: boolean) => {
      if (selected) {
        return chalk.underline(value.name);
      }
      return value.name;
    },
  };
  return cli(options);
};

export const listPrompt = (values: string[]) => {
  const options = {
    values: values,
  };
  return cli(options);
};
