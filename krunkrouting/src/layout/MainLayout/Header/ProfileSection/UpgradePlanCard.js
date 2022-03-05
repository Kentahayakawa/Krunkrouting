import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { Button, Card, CardContent, Grid, Link, Stack, Typography } from '@material-ui/core';

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
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '19px solid ',
            borderColor: theme.palette.secondary.main,
            borderRadius: '50%',
            top: '65px',
            right: '-150px'
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            width: '200px',
            height: '200px',
            border: '3px solid ',
            borderColor: theme.palette.secondary.main,
            borderRadius: '50%',
            top: '145px',
            right: '-70px'
        }
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

const UpgradePlanCard = () => {
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <Grid container direction="column" justifyContent="center">
                <Grid container direction="row" justifyContent="center">
                    <Typography variant="h4">
                        Group Code
                    </Typography>
                </Grid>
                <Grid container direction = "row" justifyContent="center">
                    <Typography variant="subtitle2" className={classes.tagLine}>
                        Open-source full-stack seed project.
                    </Typography>
                </Grid>
                <Grid container direction="row" justifyContent="center">
                    <Stack direction="column" justifyContent="center">
                        See Product
                    </Stack>
                </Grid>
            </Grid>
        </Card>
    );
};

export default UpgradePlanCard;
