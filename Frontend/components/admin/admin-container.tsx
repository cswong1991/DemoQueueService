import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@mui/material';
import AdminDrawer from '../../components/admin/admin-drawer';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== 'open' })<{ open?: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  })
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{ open?: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  })
}));

export default function AdminContainer(props: any) {
  const { status } = useSession();
  const [openDrawer, setOpenDrawer] = React.useState(true);

  React.useEffect(() => {
    setOpenDrawer(localStorage.getItem('openDrawer') === 'true');
  }, []);

  const drawerToggle = (newStatus: boolean) => {
    setOpenDrawer(newStatus);
    localStorage.setItem('openDrawer', newStatus.toString());
  }

  return (
    <>
      {(status === "loading") ? (<div>Loading...</div>) : (
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" open={openDrawer}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => drawerToggle(true)}
                edge="start"
                sx={{ mr: 2, ...(openDrawer && { display: 'none' }) }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Queue Service
              </Typography>
              {(status === "authenticated") ?
                (<Button color="inherit" onClick={() => signOut()}>Logout</Button>) :
                (<Button color="inherit" onClick={() => signIn()}>Login</Button>)
              }
            </Toolbar>
          </AppBar>
          <AdminDrawer drawerWidth={drawerWidth} openDrawer={openDrawer} closeDrawer={() => drawerToggle(false)} />
          <Main open={openDrawer}>
            <DrawerHeader />
            {props.children}
          </Main>
        </Box>
      )}
    </>
  );
}