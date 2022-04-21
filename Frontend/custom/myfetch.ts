import { signOut } from "next-auth/react"

export function isValidURL(url: string) {
    try {
        let testURL = new URL(url);
        return ['http:', 'https:'].includes(testURL.protocol);
    } catch {
        alert("Invalid URL");
        return false;
    }
}

export async function myfetch(url: string, options: { [key: string]: any }) {
    return await fetch(url, options).then(res => {
        if (res.status === 401) {
            signOut();
            throw Error('401 Unauthorized');
        }
        return res;
    });
}