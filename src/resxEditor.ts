import * as path from "path";
import * as vscode from "vscode";
import { getNonce } from "./util";
import { ResxJsonHelper } from "./resxJsonHelper";
import { ObjectOfStrings, js2resx, resx2js } from "resx";
import { ResxData } from "./resxData";

export class ResxEditor {
    private readonly context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public getHtmlForWebview(webview: vscode.Webview): string {

        const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "out", "webpanelScript.js")));
        const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "styles", "webpanel.css")));

        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy"
                content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link href="${styleUri}" rel="stylesheet" />
            <title>ResxFileName</title>    
        </head>
        <body>
            <div id="container" class="topdiv">
                <div id="leftThing">
                    <button class="largeButtonStyle" id="addButton">Add New Resource</button>
                </div>
            
                <div id="middleThing">
                    <div id="diverr" class="error"></div>
                </div>
                
                <div id="rightThing">
                    <button class="smallButtonStyle" id="switchToEditor">Switch to Text Editor</button>
                </div>
            </div>
            <table id="tbl">
                <thead class="tableFixHead thead th">
                    <th>Key</th>
                    <th>Value</th>
                    <th>Comment</th>
                    <th> </th>
                </thead>
                <tbody>
                </tbody>
            </table>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>
        `;
    }

    /**
     * Add a new key value back to text editor 
     */
    public async addNewKeyValue(document: vscode.TextDocument, json: any) {
        var newObj = JSON.parse(json);
        var docDataList = await ResxJsonHelper.getJsonData(document.getText());

        //var pos = docDataList.map((x) => { return x?._attributes?.name; }).indexOf(newObj._attributes.name);
        let exists = false;
        Object(docDataList).keys.forEach((key: string) => {
            if (key == newObj._attributes.name) {
                exists = true;
            }
        });

        //avoid adding data with same key
        if (!exists) {
            docDataList.key = newObj._attributes.name;
            //docDataList.value = newObj._attribut
        }
        else {
            // commented for now. its triggering twice 
            vscode.window.showErrorMessage(`Data with same key ${newObj._attributes.name} already exists`);
        }
        return this.updateTextDocument(document, JSON.stringify(docDataList));
    }

    /**
     * Delete an existing scratch from a document.
     */
    public async deleteKeyValue(document: vscode.TextDocument, json: any) {

        console.log("deleteKeyValue start");

        var deletedJsObj = JSON.parse(json);

        var currentData = await ResxJsonHelper.getJsonData(document.getText());

        console.log(`Datalist before deleting ${deletedJsObj._attributes.name} : ${JSON.stringify(currentData)}`);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let exists = false;
        //var pos = currentData.map(function (e) { return e?._attributes?.name; }).indexOf(deletedJsObj._attributes.name);
        Object(currentData).keys.forEach((x: string) => {
            if (x === deletedJsObj._attributes.name) {
                exists = true;
                delete currentData[x];
            }});

  
        console.log("deleteKeyValue end");
        return this.updateTextDocument(document, JSON.stringify(currentData));
    }


    public async updateTextDocument(document: vscode.TextDocument, dataListJson: any) {
        console.log("updateTextDocument start");

        var dataList = JSON.parse(dataListJson);
        const edit = new vscode.WorkspaceEdit();

        const currentJsObj: any = await resx2js(document.getText(), true);

        var currentJs: Record<string, ResxData> = {};

        Object.entries(currentJsObj).forEach(([key, value]) => {
            let oos = value as ObjectOfStrings;
            if (value) {
                let resx = new ResxData(oos.value, oos.comment ?? null);
                currentJs[key] = resx;
            }
        });


        console.log(`Before datalist - ${JSON.stringify(currentJs)} `);

        if (dataList) {
            switch (dataList.length) {
                case 0:
                    delete currentJs.root;
                    break;
                case 1:
                    currentJs.root = dataList[0];
                    break;
                default:
                    currentJs.root = dataList;
                    break;
            }
        }
        else {
            console.log("Empty data : red flag");

            //currentJs.root = {};
        }
        console.log(`After datalist - ${JSON.stringify(currentJs.root)} `);

        //
        // export interface ObjectOfStrings {
        //     [key: string]: string;
        // }
        let oos = { key: "" };
        var resx = await js2resx(oos)
        console.log("Updated resx" + resx);
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            resx);

        console.log("updateTextDocument end");
        return vscode.workspace.applyEdit(edit);
    }
}
