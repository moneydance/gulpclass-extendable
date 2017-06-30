import { defaultMetadataStorage } from "./MetadataStorage";
import { construct } from "./utils";

/**
 * Registers a class from which tasks will be loaded.
 * You can optionally specify your gulp instance if you want to register tasks specifically there.
 */
export function Gulpclass(target:any) {
  var f:any = function(...args:any[]) {
    let instance = construct(target, args);
    Object.setPrototypeOf(instance, target.prototype);
    if (new.target === target) {
      defaultMetadataStorage.registerTasks(instance);
    }
    return instance;
  }
  f.prototype = target.prototype;
  return f;
}

/**
 * Registers a task with the given name. If name is not specified then object's method name will be used.
 */
export function Task(name?: string, dependencies?: string[]): Function {
    return function(target: Function, key: string) {
        defaultMetadataStorage.addTaskMetadata({
            classConstructor: target.constructor,
            method: key,
            name: name || key,
            dependencies: dependencies || []
        });
    }
}

/**
 * Tasks will be run in sequence when using this annotation.
 */
export function SequenceTask(name?: string): Function {
    return function(target: Function, key: string) {
        defaultMetadataStorage.addTaskMetadata({
            classConstructor: target.constructor,
            method: key,
            name: name || key,
            dependencies: [],
            isSequence: true
        });
    }
}

/**
 * Tasks will be run merged when using this annotation.
 */
export function MergedTask(name?: string): Function {
    return function(target: Function, key: string) {
        defaultMetadataStorage.addTaskMetadata({
            classConstructor: target.constructor,
            method: key,
            name: name || key,
            dependencies: [],
            isMerge: true
        });
    }
}
