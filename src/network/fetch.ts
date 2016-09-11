import fetch from "isomorphic-fetch";
import {v4} from "node-uuid";

import {manageResponseErrors, ManagedErrorResponse} from "./error-parsing";
import {requestStore} from "./store";

type DataType = "json" | "string";

async function coreFetch<RS>(url: string, method: string, responseType: DataType, data?: any, contentType?: DataType): Promise<any> {
    const body = data ? JSON.stringify(data) : undefined;
    const headers = contentType ? {"Content-Type": contentType === "json" ? "application/json" : "text/plain"} : undefined;
    const id = v4();
    requestStore.updateRequest({id, url, status: "pending"});
    try {
        const response = await fetch(url, {method, body, headers, credentials: "include"});
        if (response.status >= 200 && response.status < 300) {
            requestStore.updateRequest({id, url, status: "success"});
            if (responseType === "json") {
                return await response.json<RS>();
            } else {
                return await response.text();
            }
        } else {
            requestStore.updateRequest({id, url, status: "error"});
            console.error(`${response.status} error when calling ${url}`);
            return Promise.reject<ManagedErrorResponse>(manageResponseErrors(await response.json()));
        }
    } catch (e) {
        requestStore.updateRequest({id, url, status: "error"});
        const error = `"${e.message}" error when calling ${url}`;
        console.error(error);
        return Promise.reject<string>(error);
    }
}

export async function httpDelete(url: string, responseType: "string"): Promise<string>;
export async function httpDelete<RS>(url: string, responseType?: "json"): Promise<RS>;
export async function httpDelete<RS>(url: string, responseType: DataType = "json") {
    return coreFetch(url, "DELETE", responseType);
}

export async function httpGet(url: string, responseType: "string"): Promise<string>;
export async function httpGet<RS>(url: string, responseType?: "json"): Promise<RS>;
export async function httpGet<RS>(url: string, responseType: DataType = "json") {
    return coreFetch(url, "GET", responseType);
}

export async function httpPost(url: string, data: string, responseType: "string", contentType: "string"): Promise<string>;
export async function httpPost<RQ>(url: string, data: RQ, responseType: "string", contentType?: "json"): Promise<string>;
export async function httpPost<RS>(url: string, data: string, responseType: "json", contentType: "string"): Promise<RS>;
export async function httpPost<RQ, RS>(url: string, data: RQ, responseType?: "json", contentType?: "json"): Promise<RS>;
export async function httpPost<RQ, RS>(url: string, data: RQ, responseType: DataType = "json", contentType: DataType = "json") {
    return coreFetch(url, "POST", responseType, data, contentType);
}

export async function httpPut(url: string, data: string, responseType: "string", contentType: "string"): Promise<string>;
export async function httpPut<RQ>(url: string, data: RQ, responseType: "string", contentType?: "json"): Promise<string>;
export async function httpPut<RS>(url: string, data: string, responseType: "json", contentType: "string"): Promise<RS>;
export async function httpPut<RQ, RS>(url: string, data: RQ, responseType?: "json", contentType?: "json"): Promise<RS>;
export async function httpPut<RQ, RS>(url: string, data: RQ, responseType: DataType = "json", contentType: DataType = "json") {
    return coreFetch(url, "PUT", responseType, data, contentType);
}
