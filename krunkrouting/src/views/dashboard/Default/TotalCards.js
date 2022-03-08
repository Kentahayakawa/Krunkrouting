import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, List, ListItem, ListItemText, Box, ButtonBase, Card, CardContent, InputAdornment, Grid, ListItemAvatar, OutlinedInput, Popper, Typography } from '@material-ui/core';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import TotalIncomeCard from './../../../ui-component/cards/Skeleton/TotalIncomeCard';
import Transitions from './../../../ui-component/extended/Transitions';
import configData from './../../../config';
import { IconSearch } from '@tabler/icons';
import { GROUP_JOIN} from './../../../store/actions'; // SEARCH_RTL


// assets

// style constant
const useStyles = makeStyles((theme) => ({

    card1: {
        backgroundColor: theme.palette.secondary.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
    },
    card2: {
        backgroundColor: theme.palette.error.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
    },
    card3: {
        backgroundColor: theme.palette.warning.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        // '&>div': {
        //     position: 'relative',
        //     zIndex: 5
        // },
        // '&:after': {
        //     content: '""',
        //     position: 'absolute',
        //     width: '210px',
        //     height: '210px',
        //     background: theme.palette.primary[800],
        //     borderRadius: '50%',
        //     zIndex: 1,
        //     top: '-85px',
        //     right: '-95px',
        //     [theme.breakpoints.down('xs')]: {
        //         top: '-105px',
        //         right: '-140px'
        //     }
        // },
        // '&:before': {
        //     content: '""',
        //     position: 'absolute',
        //     zIndex: 1,
        //     width: '210px',
        //     height: '210px',
        //     background: theme.palette.primary[800],
        //     borderRadius: '50%',
        //     top: '-125px',
        //     right: '-15px',
        //     opacity: 0.5,
        //     [theme.breakpoints.down('xs')]: {
        //         top: '-155px',
        //         right: '-70px'
        //     }
        // }
    },
    content: {
        padding: '16px !important'
    },
    content2: {
        padding: '20px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.dark
    },
    avatar2: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.dark
    },
    avatar3: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.primary[800],
        color: '#fff',
        marginTop: '8px'
    },
    avatarCircle: {
        ...theme.typography.smallAvatar,
        cursor: 'pointer',
        backgroundColor: theme.palette.primary[200],
        color: theme.palette.primary.dark
    },
    cardHeading: {
        fontSize: '2.225rem',
        fontWeight: 500,
        marginRight: '8px',
        marginTop: '14px',
        marginBottom: '6px'
    },
    cardHeading2: {
        fontSize: '2.125rem',
        fontWeight: 500,
        marginRight: '8px',
        marginTop: '14px',
        marginBottom: '6px'
    },
    
    primary: {
        color: '#fff'
    },
    secondary: {
        color: theme.palette.primary.light,
        marginTop: '5px'
    },
    secondary2: {
        color: theme.palette.grey[500],
        marginTop: '5px'
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    },
    circleIcon: {
        transform: 'rotate3d(1, 1, 1, 45deg)'
    },
    subHeading: {
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.primary[200]
    }
}));

//-----------------------|| DASHBOARD - TOTAL INCOME DARK CARD ||-----------------------//

const TotalCards = ({ isLoading }) => {
    const classes = useStyles();
    const [value, setValue] = useState('');
    const anchororigin={vertical: 'top', horizontal: 'left'};
    const transformorigin={ vertical: 'top', horizontal: 'left'};
    const dispatch = useDispatch();
    const account = useSelector((state) => state.account);
    let group_invite_code = account ? account.user._group_invite_code : "123";
    const [groupCode, setGroupCode] = useState(group_invite_code);


    const handleRemove = () =>{
        axios
            .post(configData.API_SERVER + 'groups/create', {}, {headers: {Authorization: `${account.token}`}} 
                )
                .then(function (response) {
                    if(response.data){
                        if(response.data.status){
                            setGroupCode(response.data.group.invite_code);
                            dispatch({
                                type: GROUP_JOIN,
                                payload: { user: account.user, group: response.data.group, group_invite_code: response.data.group.invite_code}
                            });
                            console.log(response.data.group);
                        }
                        else{
                            console.log(response.data);
                        }
                    }
                })
                .catch(function (error) {
                    console.log('error - ', error);
                });
    }

    const handleJoin = () => {
        axios
            .post(configData.API_SERVER + 'groups/join', {"invite_code": value}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                //console.log(value);
                if(response.data){
                    if(response.data.status){
                        setGroupCode(response.data.group.invite_code);
                        dispatch({
                            type: GROUP_JOIN,
                            payload: { user: account.user, group: response.data.group, group_invite_code: response.data.group.invite_code}
                        });
                        console.log(response.data.group);
                    }
                    else{
                        console.log(response.data);
                    }
                }
            })
            .catch(function (error) {
                console.log('error - ', error);
            });
    }

    return (
        <React.Fragment>
            {isLoading ? (
                <TotalIncomeCard />
            ) : (
            
                <Grid container direction = "row" >
                    {/* //TotalOrderLineChartCard */}
                    <Grid item lg={4} xs={12}>     
                        <MainCard border={false} className={classes.card1} contentClass={classes.content2}>
                            <Grid container direction="column">
                                <Grid item sx={{ mb: 0.75 }}>
                                    <Grid container alignItems="center">
                                        <Grid item xs={12}>
                                            <Grid container justifyContent="center">
                                                <Grid item>
                                                    <Typography className={classes.cardHeading2}>Group Code: {" "}{groupCode}</Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </MainCard>
                    </Grid>



                    {/* TotalIncomeDarkCard */}
                    <Grid item lg={4} xs={12}>
                        <MainCard border={false} className={classes.card3} contentClass={classes.content2}>
                            <Grid container direction="row" spacing={2}>
                                <Grid item xs={4} lg={6}>
                                    <Grid container justifyContent="center">
                                        <Grid item>
                                            <Typography className={classes.cardHeading}>Join Group</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={8} lg={6}>
                                    <Grid container direction="column" spacing={6} alignItems="stretch">
                                        <Grid item xs={8} >
                                            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                                                <PopupState variant="popper" popupId="demo-popup-popper">
                                                    {(popupState) => (
                                                        <React.Fragment>
                                                            <Box
                                                                sx={{
                                                                    ml: 2
                                                                }}
                                                            >
                                                                <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                    <Avatar variant="rounded" className={classes.avatar} {...bindToggle(popupState)}>
                                                                        <IconSearch stroke={1.5} size="1rem" />
                                                                    </Avatar>
                                                                </ButtonBase>
                                                            </Box>
                                                            <Popper {...bindPopper(popupState)} transition className={classes.popperContainer} anchororigin={anchororigin} transformorigin={transformorigin}>
                                                                {({ TransitionProps }) => (
                                                                    <Transitions type="zoom" {...TransitionProps} sx={{ transformorigin: 'center left' }}>
                                                                        <Card className={classes.card}>
                                                                            <CardContent className={classes.cardContent}>
                                                                                <Grid container alignItems="center" justifyContent="space-between">
                                                                                    <Grid item>
                                                                                        <OutlinedInput
                                                                                            className={classes.searchControl}
                                                                                            id="input-search-header"
                                                                                            value={value}
                                                                                            onChange={(e) => setValue(e.target.value)}
                                                                                            placeholder="Search"
                                                                                            endAdornment={
                                                                                                <InputAdornment position="end">
                                                                                                    <ListItemAvatar>
                                                                                                        <Avatar variant="rounded" onClick={handleJoin} className={classes.avatar}>
                                                                                                            <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                                                                                                        </Avatar>
                                                                                                    </ListItemAvatar>
                                                                                                </InputAdornment>
                                                                                            }
                                                                                            aria-describedby="search-helper-text"
                                                                                            inputProps={{
                                                                                                'aria-label': 'weight'
                                                                                            }}
                                                                                        />
                                                                                    </Grid>
                                                                                </Grid>
                                                                            </CardContent>
                                                                        </Card>
                                                                    </Transitions>
                                                                )}
                                                            </Popper>
                                                        </React.Fragment>
                                                    )}
                                                </PopupState>
                                            </Box>
                                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                                <OutlinedInput
                                                    className={classes.searchControl}
                                                    id="input-search-header"
                                                    value={value}
                                                    onChange={(e) => setValue(e.target.value)}
                                                    placeholder="Search"
                                                    endAdornment={
                                                        <InputAdornment position="end">
                                                            <ListItemAvatar>
                                                                <Avatar variant="rounded" onClick={handleJoin} className={classes.avatar}>
                                                                    <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                        </InputAdornment>
                                                    }
                                                    aria-describedby="search-helper-text"
                                                    inputProps={{
                                                        'aria-label': 'weight'
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </MainCard>
                    </Grid>




                {/* TotalIncomeLightCard */}
                <Grid item lg={4} xs={12}>     
                        <ButtonBase onClick={handleRemove}>
                        <MainCard className={classes.card2} contentClass={classes.content2}>
                            <List className={classes.padding}>
                                <ListItem alignItems="center" disableGutters className={classes.padding}>
                                    <ListItemText
                                        sx={{
                                            mt: 0.45,
                                            mb: 0.45
                                        }}
                                        className={classes.padding}
                                        primary= {<Typography className={classes.cardHeading2}> Leave Group </Typography>}
                                    />
                                </ListItem>
                            </List>
                        </MainCard>
                    </ButtonBase>
                </Grid>
            </Grid>
            )}
        </React.Fragment>
    );
};

TotalCards.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalCards;
