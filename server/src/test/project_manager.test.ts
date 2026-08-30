import assert from "assert";
import { ProjectManager } from "../projects/projectManager.js";
import { IProjectDetailsProvider } from "../projects/projectDetailsProvider.js";

function provider(reload: () => IProjectDetailsProvider): IProjectDetailsProvider {
    return { reloadDetails: reload } as IProjectDetailsProvider;
}

suite("Project Manager", () => {
    test("a newly discovered project is clean", () => {
        const manager = new ProjectManager();
        let reloads = 0;
        const project = provider(() => {
            reloads++;
            return project;
        });

        manager.setActiveProject(project);
        manager.reloadDetails();

        assert.strictEqual(reloads, 0);
    });

    test("a dirty project reloads once until another change", () => {
        const manager = new ProjectManager();
        let reloads = 0;
        const project = provider(() => {
            reloads++;
            return project;
        });

        manager.setActiveProject(project);
        manager.setDirtyState(true);
        manager.reloadDetails();
        manager.reloadDetails();

        assert.strictEqual(reloads, 1);
    });

    test("a failed reload can be retried", () => {
        const manager = new ProjectManager();
        let reloads = 0;
        const project = provider(() => {
            reloads++;

            if (reloads === 1) {
                throw new Error("reload failed");
            }

            return project;
        });

        manager.setActiveProject(project);
        manager.setDirtyState(true);

        assert.throws(() => manager.reloadDetails(), /reload failed/);
        manager.reloadDetails();

        assert.strictEqual(reloads, 2);
    });
});
