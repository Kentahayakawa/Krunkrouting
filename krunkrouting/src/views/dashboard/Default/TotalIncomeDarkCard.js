import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Box, ButtonBase, Card, CardContent, InputAdornment, Grid, List, ListItem, ListItemAvatar, ListItemText, OutlinedInput, Popper, Typography } from '@material-ui/core';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import { useDispatch, useSelector } from 'react-redux';

import axios from 'axios';
// project imports
import MainCard from './../../../ui-component/cards/MainCard';
import TotalIncomeCard from './../../../ui-component/cards/Skeleton/TotalIncomeCard';
import Transitions from './../../../ui-component/extended/Transitions';
import configData from './../../../config';


import { GROUP_JOIN} from './../../../store/actions'; // SEARCH_RTL


// assets
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import { IconAdjustmentsHorizontal, IconSearch} from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        backgroundColor: theme.palette.primary.dark,
        color: theme.palette.primary.light,
        overflow: 'hidden',
        position: 'relative',
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(210.04deg, ' + theme.palette.primary[200] + ' -50.94%, rgba(144, 202, 249, 0) 83.49%)',
            borderRadius: '50%',
            top: '-30px',
            right: '-180px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: 'linear-gradient(140.9deg, ' + theme.palette.primary[200] + ' -14.02%, rgba(144, 202, 249, 0) 77.58%)',
            borderRadius: '50%',
            top: '-160px',
            right: '-130px'
        }
    },
    content: {
        padding: '16px !important'
    },
    avatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.primary[800],
        color: '#fff'
    },
    cardHeading: {
        fontSize: '2.225rem',
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
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));

//-----------------------|| DASHBOARD - TOTAL INCOME DARK CARD ||-----------------------//

const TotalIncomeDarkCard = ({ isLoading }) => {
    const classes = useStyles();
    const [value, setValue] = useState('');
    const anchorOrigin={vertical: 'top', horizontal: 'left'};
    const transformOrigin={ vertical: 'top', horizontal: 'left'};
    const dispatch = useDispatch();
    const account = useSelector((state) => state.account);

    const handleJoin = () => {
        axios
            .post(configData.API_SERVER + 'groups/join', {"invite_code": value}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                if(response.data){
                    if(response.data.status){
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
                <MainCard border={false} className={classes.card} contentClass={classes.content}>
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
                                                            <Avatar variant="rounded" className={classes.headerAvatar} {...bindToggle(popupState)}>
                                                                <IconSearch stroke={1.5} size="1rem" />
                                                            </Avatar>
                                                        </ButtonBase>
                                                    </Box>
                                                    <Popper {...bindPopper(popupState)} transition className={classes.popperContainer} anchorOrigin={anchorOrigin} transformOrigin={transformOrigin}>
                                                        {({ TransitionProps }) => (
                                                            <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
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
            )}
        </React.Fragment>
    );
};

TotalIncomeDarkCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalIncomeDarkCard;

