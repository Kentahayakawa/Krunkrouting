import React from 'react';
import { useSelector } from 'react-redux';
// material-ui
import { makeStyles } from '@material-ui/styles';
import { Button, Card, CardContent, Grid, Link, Stack, Typography } from '@material-ui/core';

import configData from '../../../../config';
// project imports
import AnimateButton from './../../../../ui-component/extended/AnimateButton';

// style constant
const useStyles = makeStyles((theme) => ({
    card: {
        background: theme.palette.primary.light,
        marginTop: '16px',
        marginBottom: '16px',
        overflow: 'hidden',
        position: 'relative',
    },
    tagLine: {
        color: theme.palette.grey[900],
        opacity: 0.6
    },
    button: {
        color: theme.palette.grey[800],
        backgroundColor: theme.palette.warning.main,
        textTransform: 'capitalize',
        boxShadow: 'none',
        '&:hover': {
            backgroundColor: theme.palette.warning.dark
        }
    }
}));

//-----------------------|| PROFILE MENU - UPGRADE PLAN CARD ||-----------------------//
// /api/groups
const UpgradePlanCard = () => {
    const classes = useStyles();
    const account = useSelector((state) => state.account);
    const group_invite_code = account ? account.group_invite_code : "123";
    return (
        <Card className={classes.card}>
            <Grid container direction="column" spacing={4}>
                <Grid item xs={12}>
                 <Typography variant="h4" align="center">
                        Group Code
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle2" className={classes.tagLine} align="center">
                        {group_invite_code}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Stack direction="column" justifyContent="center" align="center">
                        HELP
                    </Stack>
                </Grid>
            </Grid>
        </Card>
    );
};

export default UpgradePlanCard;
