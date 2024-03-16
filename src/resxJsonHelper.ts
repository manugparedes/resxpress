import { ObjectOfStrings, resx2js } from "resx";
import { ResxData } from "./resxData";

export class ResxJsonHelper {
    /**
     *
     */
     static async getJsonData(text: string): Promise<Record<string, ResxData>> {
        var jsObj: any = await resx2js(text, true);
        var resxKeyValues: Record<string, ResxData> = {};
	
        Object.entries(jsObj).forEach(([key, value]) => {
            let oos = value as ObjectOfStrings;
            if (oos) {
                let resx = new ResxData(oos.value, oos.comment ?? null);
                resxKeyValues[key] = resx;
            }
        });
        
        return resxKeyValues;
    }
}