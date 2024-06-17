import { expect } from "chai";
import "@pnp/graph/sites";
import "@pnp/graph/taxonomy";
import { ITermSet } from "@pnp/graph/taxonomy";

describe("Taxonomy", function () {

    before(function () {

        if (!this.pnp.settings.enableWebTests) {
            this.skip();
        }
    });

    describe("TermStore", function () {
        it("-invoke", async function () {

            const info = await this.pnp.graph.termStore();
            return expect(info).has.property("id");
        });

        it("groups", async function () {
            const info = await this.pnp.graph.termStore.groups();

            if (info === undefined || info.length < 1) {
                return expect(info).to.be.an("Array");
            }

            return expect(info[0]).has.property("id");
        });

        // TODO: sets gives API not found error on termStore... need to remove/or fix.
        it.skip(".sets", async function () {
            const url = this.pnp.graph.termStore.sets.toRequestUrl();
            console.log(`Sets: ${url}`);
            const info = await this.pnp.graph.termStore.sets();
            if (info === undefined || info.length < 1) {
                return expect(info).to.be.an("Array");
            }

            return expect(info[0]).has.property("id");
        });

        it("groups.getById", async function () {

            const info = await this.pnp.graph.termStore.groups();

            if (info === undefined || info.length < 1) {
                return expect(info).to.be.an("Array");
            }

            const group = await this.pnp.graph.termStore.groups.getById(info[0].id)();

            return expect(group).has.property("id");
        });

        // TODO: sets gives API not found error on termStore... need to remove/or fix.
        it.skip(".sets.getById", async function () {

            const info = await this.pnp.graph.termStore.sets();

            if (info === undefined || info.length < 1) {
                return expect(info).to.be.an("Array");
            }

            const set = await this.pnp.graph.termStore.sets.getById(info[0].id)();
            return expect(set).has.property("id");
        });
    });
    /**
     * Term Sets
     */
    describe("TermSets", function () {
        let termset: ITermSet = null;

        before(async function () {
            const groups = await this.pnp.graph.termStore.groups();

            if (groups === undefined || groups?.length < 1) {
                this.skip();
            }
            const groupId = groups[0].id;

            const sets = await this.pnp.graph.termStore.groups.getById(groupId).sets();
            if (sets === undefined || sets?.length < 1) {
                this.skip();
            }
            const termsetId = sets[0].id;
            termset = this.pnp.graph.termStore.groups.getById(groupId).sets.getById(termsetId);
        });

        it("terms", async function () {
            const terms = await termset.terms();
            return expect(terms).to.be.an("Array");
        });

        it("children", async function () {
            const children = await termset.children();
            return expect(children).to.be.an("Array");
        });

        it("relations", async function () {
            const relations = await termset.relations();
            return expect(relations).to.be.an("Array");
        });

        it("getTermById", async function () {
            const terms = await termset.terms();
            if (terms.length < 1) {
                return;
            }
            const termById = await termset.getTermById(terms[0].id)();
            return expect(termById).has.property("id");
        });
    });

    /**
     * Terms
     */
    describe("Terms", function () {
        let term = null;

        before(async function () {
            const groups = await this.pnp.graph.termStore.groups();

            if (groups === undefined || groups?.length < 1) {
                this.skip();
            }
            const groupId = groups[0].id;

            const sets = await this.pnp.graph.termStore.groups.getById(groupId).sets();

            if (sets === undefined || sets?.length < 1) {
                this.skip();
            }
            const setId = sets[0].id;

            const terms = await this.pnp.graph.termStore.groups.getById(groupId).sets.getById(setId).terms();
            if (terms === undefined || terms?.length < 1) {
                this.skip();
            }
            const termId = terms[0].id;
            term = this.pnp.graph.termStore.groups.getById(groupId).sets.getById(setId).terms.getById(termId);
        });

        it("getById", async function () {
            const info = await term();
            return expect(info).has.property("id");
        });

        it("term.children", async function () {
            const children = await term.children();
            return expect(children).to.be.an("Array");
        });

        it("term.relations", async function () {
            const relations = await term.relations();
            return expect(relations).to.be.an("Array");
        });
    });
});
