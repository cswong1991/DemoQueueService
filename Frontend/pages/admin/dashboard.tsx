import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useSession } from 'next-auth/react';
import * as React from 'react';
import AdminContainer from '../../components/admin/admin-container';
import { isValidURL, myfetch } from '../../custom/myfetch';

function Content() {
    const { data: session } = useSession();
    const [serviceStatus, setServiceStatus] = React.useState();
    const [runtimeData, setRuntimeData] = React.useState<{ [key: string]: any }[]>([]);

    var refreshSchedular: any = null;
    React.useEffect(() => {
        getStatus();
        refreshSchedular = setInterval(getStatus, 10 * 1000);
        return () => { clearInterval(refreshSchedular) }
    }, []);

    const getStatus = () => {
        let requiredURL = (process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ?? "") + (process.env.NEXT_PUBLIC_ENDPOINT_QUEUE_STATUS ?? "");
        if (isValidURL(requiredURL)) {
            myfetch(requiredURL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": "Bearer " + session?.access_token
                }
            }).then(res => {
                if (res.status === 200) {
                    res.json().then(newData => {
                        setRuntimeData(newData ?? []);
                        setServiceStatus(newData?.at(-1)['serviceStatus']);
                    });
                }
            });
        }
    }

    const statusToggle = (event: object, value: any) => {
        if (value === null) { return; }
        let requiredURL = (process.env.NEXT_PUBLIC_API_BASE_ENDPOINT ?? "") + (
            value ? (process.env.NEXT_PUBLIC_ENDPOINT_QUEUE_START ?? "") : (process.env.NEXT_PUBLIC_ENDPOINT_QUEUE_STOP ?? "")
        );
        if (isValidURL(requiredURL)) {
            myfetch(requiredURL, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": "Bearer " + session?.access_token
                }
            }).then(res => {
                if (res.status === 200) {
                    setServiceStatus(value);;
                }
            });
        }
    }

    return (
        <Box>
            <ToggleButtonGroup
                exclusive
                sx={{ mb: 5 }}
                value={serviceStatus}
                onChange={statusToggle}
            >
                <ToggleButton color="success" value={true}>Start</ToggleButton>
                <ToggleButton color="warning" value={false}>Stop</ToggleButton>
            </ToggleButtonGroup>

            <ResponsiveContainer width="100%" height={500}>
                <LineChart data={runtimeData}>
                    <XAxis hide={true} dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="inQueueItems" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

export default function Username() {
    return (
        <AdminContainer><Content /></AdminContainer>
    );
}