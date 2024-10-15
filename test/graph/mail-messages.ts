import { expect } from "chai";
import "@pnp/graph/users";
import "@pnp/graph/mail";
import { getRandomString, stringIsNullOrEmpty } from "@pnp/core";
import getValidUser from "./utilities/getValidUser.js";
import { Message, MailFolder as IMailFolderType } from "@microsoft/microsoft-graph-types";
import { IUser } from "@pnp/graph/users";

describe("Mail: Messages", function () {
    let user: IUser;
    let testUserName: string;
    let inboxFolder = null;
    let draftFolder = null;

    const draftMessage: Message = {
        subject: "PnPjs Test Message",
        importance: "low",
        body: {
            contentType: "html",
            content: "This is a test message!",
        },
        toRecipients: [
            {
                emailAddress: {
                    address: "AdeleV@contoso.onmicrosoft.com",
                },
            },
        ],
    };

    // Ensure we have the data to test against
    before(async function () {

        if (!this.pnp.settings.enableWebTests || stringIsNullOrEmpty(this.pnp.settings.testUser)) {
            this.skip();
        }

        const userInfo = await getValidUser.call(this);
        user = this.pnp.graph.users.getById(userInfo.userPrincipalName);
        testUserName = userInfo.userPrincipalName;
        draftMessage.toRecipients[0].emailAddress.address = testUserName;
        const mailFolders: IMailFolderType[] = await user.mailFolders();
        if (mailFolders.length >= 0) {
            const inbox = mailFolders.find((f) => f.displayName === "Inbox");
            inboxFolder = inbox?.id || mailFolders[0].id;
            const draft = mailFolders.find((f) => f.displayName === "Draft");
            draftFolder = draft?.id || mailFolders[0].id;
        }

        if (inboxFolder === null || draftFolder === null) {
            this.skip();
        }
    });

    // Clean up testing categories
    after(async function () {
        if (!stringIsNullOrEmpty(testUserName)) {
            // TBD
        }
        return;
    });

    it("Mail: Message List", async function () {
        const messages = await user.messages();
        return expect(messages).is.not.null;
    });

    it("Mail: Message List (Delta)", async function () {
        const messagesDelta = await user.mailFolders.getById(inboxFolder).messages.delta()();
        return expect(messagesDelta).haveOwnProperty("values");
    });

    it("Mail: Create Draft Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        m.subject = `PnPjs Test Message ${getRandomString(8)}`;
        const draft = await user.messages.add(m);
        const success = (draft !== null);
        if (success) {
            await user.messages.getById(draft.id).delete();
        }
        return expect(success).to.be.true;
    });

    it("Mail: Update Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        const newSubject = `PnPjs Test Message ${getRandomString(8)}`;
        m.subject = `PnPjs Test Message ${getRandomString(8)}`;
        const draft = await user.messages.add(m);
        let success = false;
        if (draft !== null) {
            const update = await user.messages.getById(draft.id).update({ subject: newSubject });
            if (update !== null) {
                success = (update.subject === newSubject);
                await user.messages.getById(update.id).delete();
            }
        }
        return expect(success).to.be.true;
    });

    // This logs to the console when it passes, ignore those messages
    it("Mail: Delete Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        const draft = await user.messages.add(m);
        let success = false;
        if (draft !== null) {
            await user.messages.getById(draft.id).delete();
            try {
                const found = await user.messages.getById(draft.id)();
                if (found?.id === null) {
                    success = true;
                }
            } catch (e) {
                success = true;
            }
        }
        return expect(success).to.be.true;
    });

    it("Mail: Copy Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        m.subject = `PnPjs Test Message ${getRandomString(8)}`;
        const draft = await user.messages.add(m);
        let success = false;
        if (draft !== null) {
            const messageCopy = await user.messages.getById(draft.id).copy(inboxFolder);
            if (messageCopy !== null) {
                success = true;
                await user.messages.getById(messageCopy.id).delete();
            }
        }
        return expect(success).to.be.true;
    });

    it("Mail: Move Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        m.subject = `PnPjs Test Message ${getRandomString(8)}`;
        const draft: Message = await user.messages.add(m);
        let success = false;
        if (draft !== null) {
            const messageMove = await user.messages.getById(draft.id).move(inboxFolder);
            if (messageMove !== null) {
                success = (messageMove.subject === draft.subject);
                await user.messages.getById(messageMove.id).delete();
            }
        }
        return expect(success).to.be.true;
    });

    // Do not test sending draft message

    it.skip("Mail: Send Draft Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        m.subject = `PnPjs Test Message ${getRandomString(8)}`;
        const draft = await user.messages.add(m);
        if (draft !== null) {
            await user.messages.getById(draft.id).send();
            return true;
        } else {
            return false;
        }
    });

    it("Mail: Send Message", async function () {
        const m = JSON.parse(JSON.stringify(draftMessage));
        m.subject = `PnPjs Test Message ${getRandomString(8)}`;
        let success = false;
        try{
            await user.sendMail(m, false);
            success = true;
        }catch(err){
            // do nothing
        }
        return success;
    });

    // Cannot guarantee that there is email message in the inbox suitable to reply to
    it.skip("Mail: Create Draft Reply Message", async function () {
        const inboxMessage = await user.mailFolders.getById(inboxFolder).messages.top(1)();
        if (inboxMessage.length === 1) {
            let success = false;
            const draft = await user.messages.getById(inboxMessage[0].id).createReply();
            if (draft !== null) {
                success = true;
                await user.messages.getById(draft.id).delete();
            }
            return success;
        } else {
            this.skip();
        }
    });

    it.skip("Mail: Send Reply Message", async function () {
        // Skipping because it would possibly send an email to someone who didn't expect it
    });

    // Cannot guarantee that there is email message in the inbox suitable to reply to
    it.skip("Mail: Create Draft Reply-All Message", async function () {
        const inboxMessage = await user.mailFolders.getById(inboxFolder).messages.top(1)();
        if (inboxMessage.length === 1) {
            let success = false;
            const draft = await user.messages.getById(inboxMessage[0].id).createReplyAll();
            if (draft !== null) {
                success = true;
                await user.messages.getById(draft.id).delete();
            }
            return success;
        } else {
            this.skip();
        }
    });

    it.skip("Mail: Send Reply-All Message", async function () {
        // Skipping because it would possibly send an email to someone who didn't expect it
    });

    it("Mail: Create Draft Forward Message", async function () {
        const inboxMessage = await user.mailFolders.getById(inboxFolder).messages.top(1)();
        if (inboxMessage.length === 1) {
            const m = JSON.parse(JSON.stringify(draftMessage));
            m.subject = `PnPjs Test Message ${getRandomString(8)}`;
            let success = false;
            const draft = await user.messages.getById(inboxMessage[0].id).createForward(m);
            if (draft !== null) {
                success = true;
                await user.messages.getById(draft.id).delete();
            }
            return success;
        } else {
            this.skip();
        }
    });

    it.skip("Mail: Forward Message", async function () {
        // Skipping because it would possibly send an email to someone who didn't expect it
    });
});
