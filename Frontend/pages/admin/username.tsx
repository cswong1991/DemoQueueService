import { Box, Button, TextField } from '@mui/material';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import AdminContainer from '../../components/admin/admin-container';
import { isValidURL, myfetch } from '../../custom/myfetch';

function Content() {
    const { data: session } = useSession();

    const updateUsername = (event: any) => {
        event.preventDefault();
        let updateURL = (process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ?? "") + (process.env.NEXT_PUBLIC_ENDPOINT_UPDATE_USERNAME ?? "");
        if (isValidURL(updateURL)) {
            myfetch(updateURL, {
                method: 'POST',
                body: JSON.stringify({
                    username: event.target.username.value,
                    password: event.target.password.value
                }),
                headers: {
                    "Content-Type": "application/json",
                    "authorization": "Bearer " + session?.access_token
                }
            }).then(res => {
                if (res.status === 200) {
                    window.location.reload();
                    alert("Update successful");
                } else {
                    alert("Fail to update");
                }
            });
        }
    }

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { m: 1 },
            }}
            autoComplete="off"
            onSubmit={updateUsername}
        >
            <div>
                <TextField
                    fullWidth
                    required
                    id="username"
                    label="Username (min: 4, max: 20)"
                />
            </div>
            <div>
                <TextField
                    fullWidth
                    required
                    id="password"
                    type="password"
                    label="Password (min: 4)"
                />
            </div>
            <div>
                <Button type="submit" variant="outlined" sx={{ m: 1 }}>Update</Button>
            </div>
        </Box>
    );
}

export default function Username() {
    return (
        <AdminContainer><Content /></AdminContainer>
    );
}