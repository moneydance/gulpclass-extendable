export function construct(constructor, args) {
    var c : any = function () {
      return constructor.apply(this, args);
    }
    c.prototype = constructor.prototype;
    return new c();
  }

export function getClassHierarchy(baseObject:any): Function[] {
  let constructors:Function[] = [];
  let currentConstructor:Function = baseObject.constructor;
  let currentObject = baseObject;
  while (currentObject !== Object.prototype) {
    constructors.push(currentConstructor);
    currentObject = Object.getPrototypeOf(currentObject)
    currentConstructor = currentObject.constructor;
  }
  return constructors;
}

