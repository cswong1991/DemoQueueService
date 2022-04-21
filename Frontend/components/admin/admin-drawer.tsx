import * as React from 'react';
import { useRouter } from 'next/router'
import { Collapse, Divider, Drawer, IconButton, List, ListItemButton, ListItemText, styled } from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { signOut } from 'next-auth/react';

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

function ProfileChildren() {
    const router = useRouter();

    return (
        <List>
            <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/admin/username')}>
                <ListItemText primary="Username" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/admin/password')}>
                <ListItemText primary="Password" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }} onClick={() => router.push('/admin/access-token')}>
                <ListItemText primary="Access Token" />
            </ListItemButton>
        </List>
    );
}

export default function AdminDrawer(props: any) {
    const router = useRouter();
    const [showProfileC, setShowProfileC] = React.useState(false);

    return (
        <Drawer
            open={props.openDrawer}
            sx={{
                width: props.drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: props.drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="persistent"
        >
            <DrawerHeader>
                <IconButton onClick={() => props.closeDrawer()}>
                    <ChevronLeftIcon />
                </IconButton>
            </DrawerHeader>
            <Divider />

            <List>
                <ListItemButton onClick={() => router.push('/admin/dashboard')}>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <Divider />

                <ListItemButton onClick={() => setShowProfileC(!showProfileC)}>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <Divider />
                <Collapse in={showProfileC}><ProfileChildren /></Collapse>
                <Divider />

                <ListItemButton onClick={() => router.push('/admin/config')}>
                    <ListItemText primary="Config" />
                </ListItemButton>
                <Divider />

                <ListItemButton onClick={() => signOut()}>
                    <ListItemText primary="Logout" />
                </ListItemButton>
                <Divider />
            </List>
        </Drawer>
    );
}