import ActionType from "./ActionType";
export default class Role {
  name: string;
  actions: ActionType[];

  constructor(name: string, actions: ActionType[]) {
    this.name = name;
    this.actions = actions;
  }
}
