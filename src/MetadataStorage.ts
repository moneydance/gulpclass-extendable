import {TaskMetadata} from "./TaskMetadata";
import * as merge from "merge2";
import * as gulp from "gulp";
import * as runSequence from "run-sequence";

/**
 * Storages and registers all gulp classes and their tasks.
 */
export class MetadataStorage {

    private taskMetadatas: TaskMetadata[] = [];

    registerTasks(gulpClassInstance: any) {
        const classHierarchy = this.getClassHierarchy(gulpClassInstance.constructor);
        let associatedTaskMetadatas:TaskMetadata[] = [];
        // find top level class tasks first. Dont register task with name already associated, that task has been overridden.
        for (let classConstructor of classHierarchy) {
            associatedTaskMetadatas = associatedTaskMetadatas.concat(
              (this.taskMetadatas.filter(taskMetadata =>
                (taskMetadata.classConstructor === classConstructor) &&
                !(associatedTaskMetadatas.some(associatedTaskMetadata =>
                  taskMetadata.name === associatedTaskMetadata.name
                ))
              ))
            );
        }
        associatedTaskMetadatas.forEach(associatedTaskMetadata => this.registerTask(gulpClassInstance, associatedTaskMetadata));
    }

    addTaskMetadata(metadata: TaskMetadata) {
        this.taskMetadatas.push(metadata);
    }

    private getClassHierarchy(baseClass:Function): Function[] {
      let constructors:Function[] = [];
      let currentConstructor:Function = baseClass;
      while (currentConstructor != Function.prototype) {
        constructors.push(currentConstructor);
        currentConstructor = Object.getPrototypeOf(currentConstructor);
      }
      return constructors;
    }

    private registerTask(gulpClassInstance: any, taskMetadata: TaskMetadata) {
        if (taskMetadata.dependencies && taskMetadata.dependencies.length) {
            gulp.task(taskMetadata.name, taskMetadata.dependencies, (cb: Function) => {
                return this.executeTask(gulpClassInstance, taskMetadata, cb);
            });
        } else {
            gulp.task(taskMetadata.name, (cb: Function) => {
                return this.executeTask(gulpClassInstance, taskMetadata, cb);
            });
        }
    }

    private executeTask(gulpClassInstance: any, taskMetadata: TaskMetadata, cb: Function) {
        const methodResult = (gulpClassInstance)[taskMetadata.method](cb);
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

export let defaultMetadataStorage = new MetadataStorage();
