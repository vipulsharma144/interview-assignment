import Role from "./Role";

export default class User {
  id: number;
  name: string;
  password: string;
  roles: Role[];
  constructor(id: number, name: string, password: string, roles: Role[] = []) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.roles = roles;
  }

  removeRole = (role: Role) => {
    const filteredRole = this.roles.filter((r) => r.name == role.name);
    if (filteredRole.length) {
      this.roles.splice(this.roles.indexOf(filteredRole[0]), 1);
    } else console.log("No Such Role");
  };

  addRole = (role: Role) => {
    const filteredRole = this.roles.filter((r) => r.name == role.name);
    if (filteredRole.length > 0) {
      console.log("Role already Exists for user " + this.name);
      return false;
    } else {
      this.roles.push(role);
      return true;
    }
  };
}
