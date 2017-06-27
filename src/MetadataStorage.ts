import {TaskMetadata} from "./TaskMetadata";
import {GulpclassMetadata} from "./GulpclassMetadata";
import * as merge from "merge2";
import * as runSequence from "run-sequence";

/**
 * Storages and registers all gulp classes and their tasks.
 */
export class MetadataStorage {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private taskMetadatas: TaskMetadata[] = [];

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    registerTasks(gulpClass: any) {
        this.taskMetadatas
            .filter(taskMetadata => taskMetadata.classConstructor === metadata.classConstructor)
            .forEach(taskMetadata => this.registerTasks(metadata, taskMetadata));
    }

    addTaskMetadata(metadata: TaskMetadata) {
        this.taskMetadatas.push(metadata);
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------


    private getClassHierarchy(baseClass:Function): Function[] {
      let constructors:Function[] = [];
      let currentConstructor:Function = baseClass;
      while (currentConstructor != Function.prototype) {
        constructors.push(currentConstructor);
        currentConstructor = Object.getPrototypeOf(currentConstructor);
      }
      return constructors;
    }

    private registerTasks(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata) {
        if (!gulpclassMetadata.classInstance)
            gulpclassMetadata.classInstance = new (<any>gulpclassMetadata.classConstructor)();

        if (taskMetadata.dependencies && taskMetadata.dependencies.length) {
            gulpclassMetadata.gulpInstance.task(taskMetadata.name, taskMetadata.dependencies, (cb: Function) => {
                return this.executeTask(gulpclassMetadata, taskMetadata, cb);
            });
        } else {
            gulpclassMetadata.gulpInstance.task(taskMetadata.name, (cb: Function) => {
                return this.executeTask(gulpclassMetadata, taskMetadata, cb);
            });
        }
    }

    private executeTask(gulpclassMetadata: GulpclassMetadata, taskMetadata: TaskMetadata, cb: Function) {
        const methodResult = (<any>gulpclassMetadata.classInstance)[taskMetadata.method](cb);
        if (taskMetadata.isSequence && methodResult instanceof Array) {
            if (typeof methodResult[methodResult.length - 1] !== "function") {
                methodResult.push(cb);
            }

            return runSequence.apply(this, methodResult);
        } else if (taskMetadata.isMerge && methodResult instanceof Array) {
            return merge.apply(this, methodResult);
        } else {
            return methodResult;
        }
    }

}

/**
 * Default metadata storage is used as singleton and can be used to storage all metadatas.
 */
export let defaultMetadataStorage = new MetadataStorage();
