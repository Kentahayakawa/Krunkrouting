import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { FINAL_SCHEDULE, CURRENT_ROUTE} from '../../../../store/actions'; // SEARCH_RTL
import { IconRun, IconPlayerTrackNext } from '@tabler/icons';
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
    const dispatch = useDispatch();
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
            .post(configData.API_SERVER + 'groups', {"group_id": account.user.group_id}, {headers: {Authorization: `${account.token}` }})
            .then(function(response){
                if(response.data.group.leader._id === account.user._id){
                    axios
                        .post(configData.API_SERVER + 'groups/finalize', {}, {headers: {Authorization: `${account.token}`}})
                        .then(function(response2){
                
                            if(response2.data.success){
                                let tempbarlist = []
                                for(let i=0; i<response2.data.Final.length; i++){
                                    tempbarlist.push({
                                        bar_id: response2.data.Final[i].place.place_id, 
                                        bar_name: response2.data.Final[i].place.name,
                                        bar_address: response2.data.Final[i].place.address,
                                        bar_ordering: response2.data.Final[i].event_ordering,
                                        g_id: response2.data.Final[i].group_id,
                                    })
                                }
                                dispatch({
                                    type: FINAL_SCHEDULE,
                                    payload: { final_schedule: tempbarlist}
                                });
                                console.log(tempbarlist);
                                setBarList(tempbarlist);
                            }
                        })
                        .catch(function (error){
                    });

                    axios
                        .post(configData.API_SERVER + 'events/next', {}, {headers: {Authorization: `${account.token}`}})
                        .then(function(response2){
                
                            if(response2.data.success){
                                dispatch({
                                    type: CURRENT_ROUTE,
                                    payload: { 
                                        orglat: response2.data.start_coords.lat,
                                        orglng: response2.data.start_coords.lng,
                                        destlat: response2.data.end_coords.lat,
                                        destlng: response2.data.end_coords.lng,
                                    }
                                });
                                console.log("CURRENT_ROTE");
                                console.log(response2.data.start_coords.lat, response2.data.start_coords.lng, response2.data.end_coords.lat, response2.data.end_coords.lng);
                            }
                        })
                        .catch(function (error){
                    });

                }
            })
            .catch(function(error){

            });
        }

        const handleMoveGroup = () =>{
            axios
                .post(configData.API_SERVER + 'groups/move', {}, {headers: {Authorization: `${account.token}` }})
                .then(function(response){
                    console.log("Moving the group");
                    console.log(response.data);
                })
                .catch(function(error){
                    console.log(error);
                });
            
            axios
                .post(configData.API_SERVER + 'events/checkin', {}, {headers: {Authorization: `${account.token}` }})
                .then(function(response){
                    console.log("Checking In to the event");
                    console.log(response.data);
                })
                .catch(function(error){
                    console.log(error);
                });
        }



    return (
        <React.Fragment>
            <Box component="span" className={classes.box}>
                <ButtonBase onClick={handleMoveGroup} sx={{ borderRadius: '12px' }}>
                    <Avatar
                        variant="rounded"
                        className={classes.headerAvatar}
                        ref={anchorRef}
                        aria-controls={open ? 'menu-list-grow' : undefined}
                        aria-haspopup="true"
                        onClick={handleToggle}
                        color="inherit"
                    >
                        <IconPlayerTrackNext stroke={1.5} size="2.3rem" />
                    </Avatar>
                </ButtonBase>
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
