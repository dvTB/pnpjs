import { GraphFI } from "../fi.js";
import "./users.js";
import "./groups.js";
import "./sites.js";
import "./lists.js";
import { Drives, IDrives } from "./types.js";

export {
    SpecialFolder,
} from "./users.js";

export {
    encodeSharingUrl,
} from "./funcs.js";

export {
    ResumableUpload,
    IResumableUpload,
    IResumableUploadOptions,
} from "./resumableUpload.js";

export {
    Bundle,
    IBundle,
    Bundles,
    IBundles,
    IBundleDef,
} from "./bundles.js";

export {
    Drive,
    DriveItem,
    DriveItems,
    Drives,
    IDrive,
    IDriveItem,
    IDriveItemAdd,
    IDriveItemAddFolder,
    IDriveItems,
    IDrives,
    IRoot,
    Root,
    ISharingWithMeOptions,
    IItemOptions,
    IPreviewOptions,
    IFileUploadOptions,
    ISensitivityLabel,
    ICheckInOptions,
} from "./types.js";

declare module "../fi" {
    interface GraphFI {
        readonly drives: IDrives;
    }
}

Reflect.defineProperty(GraphFI.prototype, "drives", {
    configurable: true,
    enumerable: true,
    get: function (this: GraphFI) {
        return this.create(Drives);
    },
});

