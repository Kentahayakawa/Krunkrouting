import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';


// material-ui
import { makeStyles } from '@material-ui/styles';
import { Avatar, Button, Box, ButtonBase, CardActions, CardContent, Divider, Grid, Menu, MenuItem, Typography, Rating } from '@material-ui/core';

// project imports
import SubCard from '../../../ui-component/cards/SubCard';
import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from '../../../ui-component/cards/MainCard';
import configData from '../../../config';
import SkeletonPopularCard from '../../../ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from '../../../store/constant';
import {CLEAR_SEARCH_RESULTS} from '../../../store/actions'; // SEARCH_RTL

// assets
import axios from 'axios';
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import RefreshIcon from '@material-ui/icons/Refresh';
import Close from '@material-ui/icons/Close';
import KeyboardArrowUpOutlinedIcon from '@material-ui/icons/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@material-ui/icons/KeyboardArrowDownOutlined';

// assets
import { IconCirclePlus, IconCircleMinus, IconTrash} from '@tabler/icons';

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



const IndividualBarElement = ({ isLoading, bar_id, bar_name, bar_address, bar_rating, n_reviews, price_filter, n_votes}) => {

    const classes = useStyles();
    let str = "$";
    const account = useSelector((state) => state.account);
    const handlePositiveVote = () => {
        console.log(bar_id);
        axios
            .post(configData.API_SERVER + 'vote', {"place_id": bar_id, "choice": "True"}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                console.log(response.data);
            }).catch(function (error) {
            });
    }

    const handleNegativeVote = () => {
        console.log(bar_id);
        axios
            .post(configData.API_SERVER + 'vote', {"place_id": bar_id, "choice": "False"}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                console.log(response.data);
            }).catch(function (error) {
            });
    }

    return (
        <Grid container direction="row" spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} lg={6}>
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
                            <Grid item lg={1} xs={1.5} justifyContent="center">
                                <Typography variant="h5" color="inherit">
                                    {bar_rating}
                                </Typography>
                            </Grid>
                            <Grid item lg={3} xs={5} justifyContent="center">
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
            <Grid item xs={6} lg={6} justifyContent="flex-end" alignItems="right">
                <Grid container direction="row" spacing={1}>
                    <Grid item xs={4}>
                        <Typography variant="subtitle1" color="inherit">
                            {n_votes}
                        </Typography>
                    </Grid>
                    <Grid item xs={4} alignItems="center">
                        <Box display="flex" justifyContent="flex-end" >
                            <ButtonBase onClick={handlePositiveVote} sx={{ borderRadius: '12px' }}>
                                <Avatar variant="rounded" className={classes.headerAvatar}>
                                    <IconCirclePlus stroke={1.5} size="1.3rem" />
                                </Avatar>
                            </ButtonBase>
                        </Box>
                    </Grid>
                    <Grid item xs={4} alignItems="right">
                        <Box display="flex" justifyContent="flex-end">
                            <ButtonBase onClick={handleNegativeVote} sx={{ borderRadius: '12px' }}>
                                <Avatar variant="rounded" className={classes.headerAvatar}>
                                    <IconCircleMinus stroke={1.5} size="1.3rem" />
                                </Avatar>
                            </ButtonBase>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );

};
//-----------------------|| DASHBOARD DEFAULT - POPULAR CARD ||-----------------------//

const BarListCard = ({ isLoading }) => {
    const handleBarList = () => {
        axios
            .post(configData.API_SERVER + 'users', {"user_id": account.user._id}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                if (response.data) {
                    axios
                        .post(configData.API_SERVER + 'groups', {"group_id": response.data.group_id}, {headers: {Authorization: `${account.token}`}} 
                        )
                        .then(function (response2) {
                            if (response2.data.success) {
                                let tempbarlist = []
                                for(const vote in response2.data.group.votes){
                                    tempbarlist.push({
                                        bar_id: response2.data.group.votes[vote]['place']['place_id'], 
                                        bar_name: response2.data.group.votes[vote]['place']['name'],
                                        bar_address: response2.data.group.votes[vote]['place']['address'],
                                        bar_rating: response2.data.group.votes[vote]['place']['rating'],
                                        n_reviews: response2.data.group.votes[vote]['place']['user_ratings_total'],
                                        price_filter: response2.data.group.votes[vote]['place']['price_level'],
                                        n_votes:response2.data.group.votes[vote]['num_votes']
                                    })
                                }
                                tempbarlist.sort((a, b) => a.n_votes - b.n_votes)
                                setBarList(tempbarlist);
                            }
                        }).catch(function (error) {
                        });
                }
            }).catch(function (error) {
            });
        
    }

    const handleDeleteBarList = () => {
        setBarList([]);
    }
    
    const classes = useStyles();
    const account = useSelector((state) => state.account);
    const [barList, setBarList] = React.useState([]);

    console.log("barList");
    console.log(barList);
    return (
        <React.Fragment>
            {isLoading ? (
                <SkeletonPopularCard />
            ) : (
                <MainCard content={false}>
                    <CardContent>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <Grid container alignContent="center" justifyContent="space-between">
                                    <Grid item>
                                        <Typography variant="h2">Bars your group has voted for: Ranked in priority</Typography>
                                    </Grid>
                                    <Grid item>
                                    <RefreshIcon
                                            className={classes.primaryLight}
                                            aria-controls="menu-popular-card"
                                            aria-haspopup="true"
                                            onClick={handleBarList}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* <Grid item xs={12} sx={{ pt: '16px !important' }}>
                                <BajajAreaChartCard />
                            </Grid> */}
                            <Grid item xs={12}>
                                {barList.map((result) => (
                                    <SubCard>
                                        <IndividualBarElement
                                            key={result.place_id}
                                            bar_id={result.place_id}
                                            bar_name={result.bar_name}
                                            bar_address={result.bar_address}
                                            bar_rating={result.bar_rating}
                                            n_reviews={result.n_reviews}
                                            price_filter={result.price_filter}
                                            n_votes={result.n_votes}
                                        />
                                    </SubCard>
                                ))}
                            </Grid>
                        </Grid>
                    </CardContent>
                </MainCard>
            )}
        </React.Fragment>
    );
};

BarListCard.propTypes = {
    isLoading: PropTypes.bool
};

export default BarListCard;
