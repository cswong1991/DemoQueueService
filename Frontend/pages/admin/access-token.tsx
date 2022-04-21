import { Box, Button, TextField } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import AdminContainer from '../../components/admin/admin-container';
import { isValidURL, myfetch } from '../../custom/myfetch';

function Content() {
    const { data: session } = useSession();

    const copyToClipBoard = () => {
        if (session && typeof session.access_token === 'string') {
            navigator.clipboard.writeText(session.access_token);
            alert('Copy to clipboard');
        } else {
            alert('Fail to copy access token');
        }
    }

    const renewAccessToken = (event: any) => {
        event.preventDefault();
        let updateURL = (process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ?? "") + (process.env.NEXT_PUBLIC_ENDPOINT_RENEW_ACCESSTOKEN ?? "");
        if (isValidURL(updateURL)) {
            myfetch(updateURL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": "Bearer " + session?.access_token
                }
            }).then(res => {
                if (res.status === 200) {
                    signOut();
                    alert("Renew successful");
                } else {
                    alert("Fail to renew");
                }
            });
        }
    }

    return (
        <Box
            sx={{
                '& .MuiTextField-root': { m: 1 },
            }}
        >
            <div>
                <TextField
                    fullWidth
                    label="Access Token"
                    defaultValue={session?.access_token}
                />
            </div>
            <div>
                <Button type="button" variant="outlined" sx={{ m: 1 }} onClick={copyToClipBoard}>Copy</Button>
                <Button type="button" variant="outlined" sx={{ m: 1 }} onClick={renewAccessToken}>Renew</Button>
            </div>
        </Box>
    );
}

export default function AccessToken() {
    return (
        <AdminContainer><Content /></AdminContainer>
    );
}