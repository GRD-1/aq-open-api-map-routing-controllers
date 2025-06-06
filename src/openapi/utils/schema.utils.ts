import {
  SchemaObject,
  ReferenceObject,
} from "routing-controllers-openapi/node_modules/openapi3-ts/dist/model";
import { IRefObject } from "../types";

export function isRefObject(value: unknown): value is IRefObject {
  return (
    typeof value === "object" &&
    value !== null &&
    "$ref" in value &&
    typeof (value as any).$ref === "string"
  );
}

export function findSchemaRefs(obj: unknown, refs: Set<string>): void {
  if (!obj || typeof obj !== "object") return;

  if (isRefObject(obj)) {
    const match = obj.$ref.match(/#\/components\/schemas\/([^/]+)/);
    if (match) {
      refs.add(match[1]);
    }
  }

  if ("items" in obj && obj.items && isRefObject(obj.items)) {
    const match = obj.items.$ref.match(/#\/components\/schemas\/([^/]+)/);
    if (match) {
      refs.add(match[1]);
    }
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => findSchemaRefs(item, refs));
    return;
  }

  for (const value of Object.values(obj)) {
    findSchemaRefs(value, refs);
  }
}

export function findAllNestedTypes(
  obj: unknown,
  foundTypes: Set<string>,
  schemas: Record<string, SchemaObject | ReferenceObject>
): void {
  if (!obj || typeof obj !== "object") return;

  if ("target" in obj && "properties" in obj) {
    Object.values(obj.properties).forEach((prop: any) => {
      if (prop.type && typeof prop.type === "function") {
        foundTypes.add(prop.type.name);

        if (schemas[prop.type.name]) {
          findAllNestedTypes(schemas[prop.type.name], foundTypes, schemas);
        }
      }
    });
  }

  if (Array.isArray(obj)) {
    obj.forEach((item) => findAllNestedTypes(item, foundTypes, schemas));
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === "$ref" && typeof value === "string") {
      const refName = value.split("/").pop();
      if (refName) {
        foundTypes.add(refName);

        if (schemas[refName]) {
          findAllNestedTypes(schemas[refName], foundTypes, schemas);
        }
      }
    } else if (
      key === "items" &&
      value &&
      typeof value === "object" &&
      isRefObject(value)
    ) {
      const refName = value.$ref.split("/").pop();
      if (refName) {
        foundTypes.add(refName);

        if (schemas[refName]) {
          findAllNestedTypes(schemas[refName], foundTypes, schemas);
        }
      }
    } else if (typeof value === "object") {
      findAllNestedTypes(value, foundTypes, schemas);
    }
  }
}

export function updateSchemaRefs(
  obj: unknown,
  schemaAliases: Map<string, string>
): void {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    obj.forEach((item) => updateSchemaRefs(item, schemaAliases));
    return;
  }

  for (const [key, value] of Object.entries(obj)) {
    if (key === "$ref" && typeof value === "string") {
      const refName = value.split("/").pop();
      if (refName && schemaAliases.get(refName)) {
        (obj as any)[key] = value.replace(
          refName,
          schemaAliases.get(refName) || refName
        );
      }
    } else if (
      key === "items" &&
      value &&
      typeof value === "object" &&
      isRefObject(value)
    ) {
      const refName = value.$ref.split("/").pop();
      if (refName && schemaAliases.get(refName)) {
        value.$ref = value.$ref.replace(
          refName,
          schemaAliases.get(refName) || refName
        );
      }
    } else if (typeof value === "object") {
      updateSchemaRefs(value, schemaAliases);
    }
  }
}
