import { Box, Button, TextField } from '@mui/material';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import AdminContainer from '../../components/admin/admin-container';
import { isValidURL, myfetch } from '../../custom/myfetch';

function Content() {
    const { data: session } = useSession();
    const [configList, setConfigList] = React.useState<{ [key: string]: string | number | null }>({});
    const [configErrors, setConfigErrors] = React.useState<{ [key: string]: any }[]>([]);

    React.useEffect(() => {
        listConfig();
    }, []);

    const listConfig = () => {
        let configListURL = (process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ?? "") + (process.env.NEXT_PUBLIC_ENDPOINT_LIST_CONFIG ?? "");
        if (isValidURL(configListURL)) {
            myfetch(configListURL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": "Bearer " + session?.access_token
                }
            }).then(res => {
                if (res.status === 200) {
                    res.json().then(data => setConfigList(data));
                } else {
                    alert("Fail to get config list");
                }
            });
        }
    }

    const updateConfig = (event: any) => {
        event.preventDefault();
        let updateURL = (process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ?? "") + (process.env.NEXT_PUBLIC_ENDPOINT_UPDATE_CONFIG ?? "");
        if (isValidURL(updateURL)) {
            let payload: { [key: string]: any } = {};
            Object.keys(configList).forEach(e1 => {
                payload[e1] = event.target[e1].value
            });
            myfetch(updateURL, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    "authorization": "Bearer " + session?.access_token
                }
            }).then(
                res => {
                    if (res.status === 200) {
                        alert("Update successful");
                        window.location.reload();
                    } else if (res.status === 403) {
                        res.json().then(errRes => {
                            setConfigErrors(errRes.errors);
                        });
                    } else {
                        alert("Fail to update");
                    }
                }
            );
        }
    }

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { m: 1 },
            }}
            autoComplete="off"
            onSubmit={updateConfig}
        >
            {
                Object.keys(configList).map((e1, i) => {
                    return (
                        <div key={i}>
                            <TextField
                                fullWidth
                                required
                                id={e1}
                                label={e1}
                                defaultValue={configList[e1]}
                                error={configErrors.map(thisErr => thisErr['param']).includes(e1)}
                                helperText={configErrors.filter(thisErr => thisErr['param'] === e1)[0]?.['msg']}
                            />
                        </div>
                    )
                })
            }
            <div>
                <Button type="submit" variant="outlined" sx={{ m: 1 }}>Update</Button>
            </div>
        </Box>
    );
}

export default function Config() {
    return (
        <AdminContainer><Content /></AdminContainer>
    );
}