import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';


// material-ui
import { makeStyles } from '@material-ui/styles';
import { CardContent,  Grid, Typography } from '@material-ui/core';

// project imports
import SubCard from '../../../ui-component/cards/SubCard';
import MainCard from '../../../ui-component/cards/MainCard';
import configData from '../../../config';
import SkeletonPopularCard from '../../../ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from '../../../store/constant';

// assets
import axios from 'axios';
import RefreshIcon from '@material-ui/icons/Refresh';
import Close from '@material-ui/icons/Close';


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



const IndividualMemberElement = ({ isLoading, user_id, username, email, role}) => {

    return (
        <Grid container direction="column">
            <Grid item>
                <Typography variant="h4" color="inherit">
                    {username}
                </Typography>
            </Grid>
            <Grid item>
                <Typography variant="h6" color="inherit">
                    {role}
                </Typography>
            </Grid>
            <Grid item>
                <Typography variant="h6" color="inherit">
                    {email}
                </Typography>
            </Grid>
        </Grid>
    );

};
//-----------------------|| DASHBOARD DEFAULT - POPULAR CARD ||-----------------------//

const MemberCard = ({ isLoading }) => {
    const handleMember = () => {
        let tempmembers = []
        axios
            .post(configData.API_SERVER + 'users', {"user_id": account.user._id}, {headers: {Authorization: `${account.token}`}} 
            )
            .then(function (response) {
                console.log(response.data);
                if (response.data) {
                    axios
                        .post(configData.API_SERVER + 'groups', {"group_id": response.data.group_id}, {headers: {Authorization: `${account.token}`}} 
                        )
                        .then(function (response2) {
                            console.log(response2.data);
                            if (response2.data.success) {
                                for (let i = 0; i < response2.data.group.members.length; i++) {
                                    tempmembers.push({
                                        user_id: response2.data.group.members[i]._id,
                                        username: response2.data.group.members[i].username,
                                        email: response2.data.group.members[i].email,
                                        role: "Member"
                                    });
                                }
                                for (let i = 0; i < response2.data.group.members.length; i++) {
                                    if (tempmembers[i].user_id === response2.data.group.leader._id){
                                        tempmembers[i].role = "Leader";
                                        var b = tempmembers[i];
                                        tempmembers[i] = tempmembers[0];
                                        tempmembers[0] = b;
                                    }

                                }
                                for (let i = 0; i < response2.data.group.members.length; i++) {
                                    if (tempmembers[i].user_id === account.user._id){
                                        tempmembers[i].username = "You";
                                        var b = tempmembers[i];
                                        tempmembers[i] = tempmembers[0];
                                        tempmembers[0] = b;
                                    }

                                }
                                setMembers(tempmembers);
                                console.log("GET GROUP");
                                console.log(response2.data.group);
                                console.log(tempmembers);
                            }
                        }).catch(function (error) {
                        });
                }
            }).catch(function (error) {
            });
    }

    const handleDeleteMember = () => {
        setMembers([]);
    }
    
    
    const classes = useStyles();
    const account = useSelector((state) => state.account);




    // const shouldRender = (account && account.search_results && account.search_results.length !==0)? !isLoading: 0 
    // console.log(shouldRender);
    // console.log(account.search_results);
    const [members, setMembers] = React.useState([]);


    console.log(members);
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
                                        <Typography variant="h2">Members in your group</Typography>
                                    </Grid>
                                    <Grid item>
                                    <RefreshIcon
                                            className={classes.primaryLight}
                                            aria-controls="menu-popular-card"
                                            aria-haspopup="true"
                                            onClick={handleMember}
                                        />
                                    <Close
                                            className={classes.primaryLight}
                                            aria-controls="menu-popular-card"
                                            aria-haspopup="true"
                                            onClick={handleDeleteMember}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            {/* <Grid item xs={12} sx={{ pt: '16px !important' }}>
                                <BajajAreaChartCard />
                            </Grid> */}
                            <Grid item xs={12}>
                                {members.map((result) => (
                                    <SubCard>
                                        <IndividualMemberElement
                                            key={result.user_id}
                                            user_id={result.user_id}
                                            username={result.username}
                                            email={result.email}
                                            role={result.role}
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

MemberCard.propTypes = {
    isLoading: PropTypes.bool
};

export default MemberCard;
