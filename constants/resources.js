// Description: Constants for db table names as resources and their relationships
import { pluralizeString, singularizeString } from "../utils/pluralizeStr.js";
import { convertSnakeToCamel } from "../utils/caseConverter.js";
import { ShoppingBasket, Home, Group, ListTodoIcon } from "lucide-react-native";
//name should match the route name AND the db table name\
//joint_resources is an array of resources that are joined to this resource or this resource is joined to
//for example, households are joined to user_households
//alt: alternative terms for this resource that are acceptable
//joins: array of resources that this join resource is associating to this resource
//for example, related_suppliers is related to suppliers
//relationship: relationship type between resources
//m2m: many to many
//1:m: one to many
//m:1: many to one

const resources = [
  {
    name: "user_households",
    joint_resources: [],
    alt: [],
    joins: ["user", "households"],
    relationship: "m2m",
  },
  {
    name: "households",
    joint_resources: ["user_households"],
    alt: [],
    joins: [],
    relationship: null,
  },
  {
    name: "inventories",
    joint_resources: ["user_inventories"],
    alt: [],
    joins: [],
    relationship: null,
  },
  {
    name: "products",
    joint_resources: [],
    alt: [],
    joins: [],
    relationship: null,
  },
  {
    name: "tasks",
    joint_resources: [],
    alt: [],
    joins: [],
    relationship: null,
  },
  {
    name: "suppliers",
    joint_resources: ["related_suppliers"],
    alt: ["vendor", "retailer"],
    joins: [],
    relationship: null,
  },
  {
    name: "profiles",
    joint_resources: [],
    alt: ["user"],
    joins: [],
    relationship: null,
  },
  {
    name: "related_suppliers",
    joint_resources: [],
    alt: [],
    joins: ["suppliers", "suppliers"],
    relationship: "m2m",
  },
  {
    name: "task_assignments",
    joint_resources: [],
    alt: [],
    joins: [],
    relationship: null,
  },
  {
    name: "user_inventories",
    joint_resources: [],
    alt: [],
    joins: ["profiles", "inventories"],
    relationship: "m2m",
  },
];

const baseResources = [];
resources.forEach((resource) => {
  //add non-joined resources to baseResources
  if (
    resource.name.includes("_") ||
    resource?.relationship === null ||
    resource?.joins?.length === 0
  ) {
    baseResources.push(resource);
  }
  //add alts for current
  else if (resource.name.includes("_")) {
    const resourceWords = resource.name.split("_");
    let newAltsArray = [
      //add singularized version of joint resource name
      ...convertSnakeToCamel(
        resourceWords.map((word) => singularizeString(word).join("_"))
      ),
    ];
    resource.alt.concat(newAltsArray);
  }
});

const resourceIconMap = [
  { label: "Households", value: "user_households", icon: Home },
  { label: "Inventories", value: "inventories", icon: Group },
  { label: "Products", value: "products", icon: ShoppingBasket },
  {
    label: "Household Members",
    value: "user_households",
    icon: UserSearchIcon,
  },
  { label: "Tasks", value: "tasks", icon: ListTodoIcon },
];

const resourcesMap = new Map();

export { resourcesMap, resourceIconMap };

export default resources;
