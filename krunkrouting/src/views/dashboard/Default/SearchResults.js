import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';


// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, Box, ButtonBase, CardActions, CardContent, Divider, Grid, Menu, MenuItem, Typography, Rating } from '@material-ui/core';

// project imports
import SubCard from './../../../ui-component/cards/SubCard';
import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from './../../../ui-component/cards/MainCard';
import configData from './../../../config';
import SkeletonPopularCard from './../../../ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from './../../../store/constant';
import {CLEAR_SEARCH_RESULTS} from './../../../store/actions'; // SEARCH_RTL

// assets
import axios from 'axios';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import KeyboardArrowUpOutlinedIcon from '@material-ui/icons/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@material-ui/icons/KeyboardArrowDownOutlined';

// assets
import { IconCirclePlus, IconTrash} from '@tabler/icons';

// style constant
const useStyles = makeStyles((theme) => ({
    cardAction: {
        padding: '10px',
        paddingTop: 0,
        justifyContent: 'center'
    },
    primaryLight: {
        color: theme.palette.primary[200],
        cursor: 'pointer'
    },
    divider: {
        marginTop: '12px',
        marginBottom: '12px'
    },
    avatarSuccess: {
        width: '16px',
        height: '16px',
        borderRadius: '5px',
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark,
        marginLeft: '15px'
    },
    successDark: {
        color: theme.palette.success.dark
    },
    avatarError: {
        width: '16px',
        height: '16px',
        borderRadius: '5px',
        backgroundColor: theme.palette.orange.light,
        color: theme.palette.orange.dark,
        marginLeft: '15px'
    },
    errorDark: {
        color: theme.palette.orange.dark
    }
}));



const IndividualSearchElement = ({ isLoading, bar_id, bar_name, bar_address, bar_rating, n_reviews, price_filter}) => {

    const classes = useStyles();
    let str = "$";
    const account = useSelector((state) => state.account);
    const handleVote = () => {
        console.log(bar_id);
        axios
            .post(configData.API_SERVER + 'vote', {"place_id": bar_id, "choice": "True"}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                console.log(response.data);
                
                
            }).catch(function (error) {
            });
    }

    return (
        <Grid container direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item xs={8}>
                <Grid container direction="column">
                    {/* <Grid container direction="column" spacing={1} > */}
                        <Grid item>
                            <Typography variant="h4" color="inherit">
                                {bar_name}
                            </Typography>
                        {/* </Grid> */}
                    </Grid>
                    <Grid item>
                        <Grid container direction="row" justifyContent="flex-start" spacing={1}>
                            <Grid item lg={1.5} xs={1.5} justifyContent="center">
                                <Typography variant="h5" color="inherit">
                                    {bar_rating}
                                </Typography>
                            </Grid>
                            <Grid item lg={5} xs={7} justifyContent="center">
                                <Typography variant="subtitle2" color="inherit">
                                    <Rating name="read-only" value={bar_rating} readOnly precision={0.25} size="small"/>
                                </Typography>
                            </Grid>
                            <Grid item lg={1} xs={1} justifyContent="center">
                                <Typography variant="h5" color="inherit">
                                    ({n_reviews})
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container direction="row" spacing={1} >
                            <Grid item >
                                <Typography variant="h5" color="inherit">
                                    {"Bar   ·"}
                                </Typography>
                            </Grid>
                            <Grid item >
                                <Typography variant="h5" color="inherit">
                                {str + str.repeat(price_filter)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/* <Grid container direction="column" spacing={1} > */}
                    <Grid item>
                            <Typography variant="subtitle1" color="inherit">
                                {bar_address}
                            </Typography>
                        {/* </Grid> */}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={4} justifyContent="flex-end" alignItems="right">
                <Box display="flex" justifyContent="flex-end">
                    <ButtonBase onClick={handleVote} sx={{ borderRadius: '12px' }}>
                        <Avatar variant="rounded" className={classes.headerAvatar}>
                            <IconCirclePlus stroke={1.5} size="1.3rem" />
                        </Avatar>
                    </ButtonBase>
                </Box>
            </Grid>
        </Grid>
    );

};
//-----------------------|| DASHBOARD DEFAULT - POPULAR CARD ||-----------------------//

const SearchResultsCard = ({ isLoading }) => {
    
    const classes = useStyles();
    const account = useSelector((state) => state.account);
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        dispatch({type: CLEAR_SEARCH_RESULTS});
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const shouldRender = (account && account.search_results && account.search_results.length !==0)? !isLoading: 0 
    console.log(shouldRender);
    console.log("FETCHED search results")
    console.log(account.search_results);
    return (
        <React.Fragment>
            {!shouldRender ? (
                <SkeletonPopularCard />
            ) : (
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <Grid container alignContent="center" justifyContent="space-between">
                                    <Grid item>
                                        <Typography variant="h2">Search Results</Typography>
                                    </Grid>
                                    <Grid item>
                                    <DeleteIcon
                                            className={classes.primaryLight}
                                            aria-controls="menu-popular-card"
                                            aria-haspopup="true"
                                            onClick={handleClick}
                                        />
                                        {/* <MoreHorizOutlinedIcon
                                            fontSize="small"
                                            className={classes.primaryLight}
                                            aria-controls="menu-popular-card"
                                            aria-haspopup="true"
                                            onClick={handleClick}
                                        /> */}
                                        {/* <Menu
                                            id="menu-popular-card"
                                            anchorEl={anchorEl}
                                            keepMounted
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            variant="selectedMenu"
                                            anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right'
                                            }}
                                            transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right'
                                            }}
                                        >
                                            <MenuItem onClick={handleClose}> Today</MenuItem>
                                            <MenuItem onClick={handleClose}> This Month</MenuItem>
                                            <MenuItem onClick={handleClose}> This Year </MenuItem>
                                        </Menu> */}
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* <Grid item xs={12} sx={{ pt: '16px !important' }}>
                                <BajajAreaChartCard />
                            </Grid> */}
                            <Grid item xs={12}>
                                {account.search_results.map((result) => (
                                    <SubCard>
                                        <IndividualSearchElement
                                            key={result.place_id}
                                            bar_id={result.place_id}
                                            bar_name={result.name}
                                            bar_address={result.address}
                                            bar_rating={result.rating}
                                            n_reviews={result.user_ratings_total}
                                            price_filter={result.price_level}
                                        />
                                    </SubCard>
                                ))}
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions className={classes.cardAction}>
                        <Button size="small" disableElevation>
                            View All
                            <ChevronRightOutlinedIcon />
                        </Button>
                    </CardActions>
                </MainCard>
            )}
        </React.Fragment>
    );
};

SearchResultsCard.propTypes = {
    isLoading: PropTypes.bool
};

export default SearchResultsCard;
