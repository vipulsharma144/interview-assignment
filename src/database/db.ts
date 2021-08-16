import Role from "../models/Role";
import User from "../models/User";
import ActionType from "../models/ActionType";
import Resource from "../models/Resource";
import { ACCESS_LEVELS } from "../constants/constant";

/**
 * Class to handle data storage in memory
 */
export default class Database {
  users: User[] = []; //store all users here
  roles: Role[] = []; //store all roles here
  resources: Resource[] = []; //store all resource here
  actionTypes: ActionType[] = []; //store all actionTypes here
  currentUser: User = new User(1, "Admin", "hello"); // the logged in user

  initDB = () => {
    //create dummy resources
    const res1 = new Resource("/new/resource-1");
    const res2 = new Resource("/new/resource-2");
    const res3 = new Resource("/new/resource-3");
    this.resources.push(...[res1, res2, res3]); //push to main resource var

    // create all test actions

    const allActions: { [key: string]: ActionType } = {};
    //automatically generate actions for all resource and all access levels
    this.resources.forEach((resource, resourceIndex) => {
      Object.values(ACCESS_LEVELS).forEach((accessLevel, alIndex) => {
        const action = new ActionType(
          `${accessLevel}_RES${resourceIndex + 1}`,
          ACCESS_LEVELS[accessLevel],
          resource
        );
        allActions[action.name] = action;
      });
    });
    this.actionTypes.push(...Object.values(allActions));

    // create test roles and assign respective actions to roles
    const reader = new Role("reader", [
      allActions["READ_RES1"],
      allActions["READ_RES2"],
      allActions["READ_RES3"],
    ]);
    const creator = new Role("creator", [
      allActions["CREATE_RES1"],
      allActions["CREATE_RES2"],
      allActions["CREATE_RES3"],
    ]);
    const updater = new Role("updater", [
      allActions["UPDATE_RES1"],
      allActions["UPDATE_RES2"],
      allActions["UPDATE_RES3"],
    ]);
    const remover = new Role("remover", [
      allActions["DELETE_RES1"],
      allActions["DELETE_RES2"],
      allActions["DELETE_RES3"],
    ]);

    this.roles.push(...[reader, creator, updater, remover]);

    // push test users
    this.users.push(new User(2, "User Creator", "hello", [creator]));
    this.users.push(new User(3, "User Reader", "hello", [reader]));
    this.users.push(new User(4, "User Updater", "hello", [updater]));
    this.users.push(new User(5, "User Remover", "hello", [remover]));

    this.setAdminUser();
  };

  /**
   * create Admin User
   */
  setAdminUser = () => {
    const adminRole = new Role("admin", this.actionTypes); // user can access all resources anyways
    this.roles.push(adminRole);
    let adminUser: User = new User(1, "Admin", "hello", [adminRole]); // let default user be Admin
    this.users.push(adminUser);
    this.currentUser = adminUser;
  };
  /**
   *
   * @returns User : Returns currently set user
   */
  getCurrentUser = (): User => {
    return this.currentUser;
  };
}
