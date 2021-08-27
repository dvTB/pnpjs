import { TimelinePipe } from "@pnp/core";
import { Queryable2 } from "@pnp/queryable";

export function SPTagging(): TimelinePipe<Queryable2> {

    return (instance: Queryable2) => {

        instance.on.pre(async function (this: Queryable2 & { TagSymbol?: string }, url, init, result) {

            let clientTag = "PnPCoreJS:$$Version$$:";

            // TODO:: testing only
            clientTag = "PnPCoreJS:3.0.0-exp:";

            // make our best guess based on url to the method called
            const { pathname } = new URL(url);
            // remove anything before the _api as that is potentially PII and we don't care, just want to get the called path to the REST API
            clientTag += pathname.substr(pathname.indexOf("_api/") + 5).split("/").map((value, index, arr) => index === arr.length - 1 ? value : value[0]).join(".");

            if (clientTag.length > 32) {
                clientTag = clientTag.substr(0, 32);
            }

            init.headers["X-ClientService-ClientTag"] = clientTag;

            return [url, init, result];
        });

        return instance;
    };
}