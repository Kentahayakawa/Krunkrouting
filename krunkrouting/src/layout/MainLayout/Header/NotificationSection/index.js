import React from 'react';
import { useSelector } from 'react-redux';
import configData from '../../../../config';
// material-ui
import { makeStyles, useTheme } from '@material-ui/styles';
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    CardActions,
    CardContent,
    Chip,
    ClickAwayListener,
    Divider,
    Grid,
    Paper,
    Popper,
    Stack,
    TextField,
    Typography,
    useMediaQuery
} from '@material-ui/core';



// assets
import { IconRun } from '@tabler/icons';
import axios from 'axios';

// style constant
const useStyles = makeStyles((theme) => ({
    ScrollHeight: {
        height: '100%',
        maxHeight: 'calc(100vh - 205px)',
        overflowX: 'hidden'
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        transition: 'all .2s ease-in-out',
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        '&[aria-controls="menu-list-grow"],&:hover': {
            background: theme.palette.secondary.dark,
            color: theme.palette.secondary.light
        }
    },
    cardContent: {
        padding: '0px !important'
    },
    notificationChip: {
        color: theme.palette.background.default,
        backgroundColor: theme.palette.warning.dark
    },
    divider: {
        marginTop: 0,
        marginBottom: 0
    },
    cardAction: {
        padding: '10px',
        justifyContent: 'center'
    },
    paddingBottom: {
        paddingBottom: '16px'
    },
    box: {
        marginLeft: '16px',
        marginRight: '24px',
        [theme.breakpoints.down('sm')]: {
            marginRight: '16px'
        }
    },
    bodyPPacing: {
        padding: '16px 16px 0'
    },
    textBoxSpacing: {
        padding: '0px 16px'
    }
}));

// notification status options
const status = [
    {
        value: 'all',
        label: 'All Notification'
    },
    {
        value: 'new',
        label: 'New'
    },
    {
        value: 'unread',
        label: 'Unread'
    },
    {
        value: 'other',
        label: 'Other'
    }
];

//-----------------------|| NOTIFICATION ||-----------------------//

const NotificationSection = () => {
    const classes = useStyles();
    const theme = useTheme();
    const matchesXs = useMediaQuery(theme.breakpoints.down('sm'));

    const account = useSelector((state) => state.account);
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');
    const [barList, setBarList] = React.useState([]);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };



    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const handleFinalize = () =>{
        axios
            .post(configData.API_SERVER + 'groups', {"group_id": account.user._id}, {headers: {Authorization: `${account.token}` }})
            .then(function(response){
                if(response.data.group.leader._id == account.user._id){
                    axios
                        .post(configData.API_SERVER + 'groups/finalize', {}, {headers: {Authorization: `${account.token}`}})
                        .then(function(response2){
                            console.log(response2.data);
                            if(response2.data.success){
                                let tempbarlist = []
                                for(const evs in response2.data.Final){
                                    tempbarlist.push({
                                        bar_id: evs.id, 
                                        bar_name: evs.place,
                                        bar_ordering: evs.event_ordering,
                                        g_id: evs.group_id,
                                    })
                                }
                                setBarList(tempbarlist);
                            }
                        })
                        .catch(function (error){
                    });
                }
            })
            .catch(function(error){

            });
        }



    return (
        <React.Fragment>
            <Box component="span" className={classes.box}>
                <ButtonBase onClick={handleFinalize} sx={{ borderRadius: '12px' }}>
                    <Avatar
                        variant="rounded"
                        className={classes.headerAvatar}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                        color="inherit"
                    >
                        <IconRun stroke={1.5} size="2.3rem" />
                    </Avatar>
                </ButtonBase>
            </Box>
            
        </React.Fragment>
    );
};

export default NotificationSection;
