export const showResultTransaction = async (fnName: string, api: any, data: any) => {
    console.log(JSON.stringify(data));
    if (data.dispatchError && data.status.isInBlock) {
        if (data.dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(
                data.dispatchError.asModule
            );
            const { docs, method, name, section } = decoded;
            console.log(`${section} - ${name} : ${docs} - txHash: ${data.status.asInBlock.toString()}`);
        }
        return;
    }

    if (data.status.isInBlock) {
        console.log(`[${fnName}] START -----------------------------`);
        console.log(`Transaction is in block. ${data.status.asInBlock}`);
        for (const event of data.events) {
            const { data, method, section } = event.event;
            console.log(section + " " + method);
            for (const i of data) {
                console.log("   " + i.toString());
            }
        }
        console.log(`[${fnName}] END -----------------------------`);
    }
}