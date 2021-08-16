import { ACCESS_LEVELS } from "../constants/constant";
import Resource from "./Resource";
/**
 * Describles the action and resource relationship
 */
export default class ActionType {
  name: string; //auto generated has to be unique
  action: ACCESS_LEVELS;
  resource: Resource;

  constructor(name: string, action: ACCESS_LEVELS, resource: Resource) {
    this.name = name;
    this.action = action;
    this.resource = resource;
  }
}
