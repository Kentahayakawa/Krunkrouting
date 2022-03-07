import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// material-ui
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, useTheme } from '@material-ui/styles';
import { Avatar, Box, ButtonBase, Card, CardContent, Grid, InputAdornment, OutlinedInput, Popper } from '@material-ui/core';
import configData from '../../../../config';
// third-party
import {
    ClickAwayListener,
    Paper,
    Slider,
    Typography,
    useMediaQuery
} from '@material-ui/core';

import axios from 'axios';
import MainCard from '../../../../ui-component/cards/MainCard';
import SubCard from '../../../../ui-component/cards/MainCard';
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from '../../../../ui-component/extended/Transitions';
import { PRICE_FILTER, DISTANCE_FILTER, RATING_FILTER, SEARCH_RESULTS, CLEAR_SEARCH_RESULTS} from '../../../../store/actions'; // SEARCH_RTL

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX, IconGlassFull } from '@tabler/icons';

function valueText(value) {
    return `${value}px`; 
}


// style constant
const useStyles = makeStyles((theme) => ({
    searchControl: {
        width: '434px',
        marginLeft: '16px',
        paddingRight: '16px',
        paddingLeft: '16px',
        '& input': {
            background: 'transparent !important',
            paddingLeft: '5px !important'
        },
        [theme.breakpoints.down('lg')]: {
            width: '250px'
        },
        [theme.breakpoints.down('md')]: {
            width: '100%',
            marginLeft: '4px',
            background: '#fff'
        }
    },
    startAdornment: {
        fontSize: '1rem',
        color: theme.palette.grey[500]
    },
    headerAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.secondary.light,
        color: theme.palette.secondary.dark,
        '&:hover': {
            background: theme.palette.secondary.dark,
            color: theme.palette.secondary.light
        }
    },
    closeAvatar: {
        ...theme.typography.commonAvatar,
        ...theme.typography.mediumAvatar,
        background: theme.palette.orange.light,
        color: theme.palette.orange.dark,
        '&:hover': {
            background: theme.palette.orange.dark,
            color: theme.palette.orange.light
        }
    },
    popperContainer: {
        zIndex: 1100,
        width: '99%',
        top: '-55px !important',
        padding: '0 12px',
        [theme.breakpoints.down('sm')]: {
            padding: '0 10px'
        }
    },
    cardContent: {
        padding: '12px !important'
    },
    card: {
        background: '#fff',
        [theme.breakpoints.down('sm')]: {
            border: 0,
            boxShadow: 'none'
        }
    }
}));

//-----------------------|| SEARCH INPUT ||-----------------------//

const SearchSection = () => {
    const theme = useTheme();
    const classes = useStyles();
    const dispatch = useDispatch();

    const [value, setValue] = useState('');
    const [open, setOpen] = React.useState(false);
    const [minprice, setMinPrice] = React.useState(0);
    const [maxprice, setMaxPrice] = React.useState(4);
    const [minrating, setMinRating] = React.useState(0);
    const [distbias, setDistBias] = React.useState(10);
    const account = useSelector((state) => state.account);
    const handlePrice = (event, [newMinValue, newMaxValue]) => {
        setMinPrice(newMinValue);
        setMaxPrice(newMaxValue);
    };
    useEffect(() => {
        dispatch({ type: PRICE_FILTER, payload: {minprice: minprice, maxprice: maxprice}});
    }, [dispatch, minprice, maxprice]);
    
    const handleRating = (event, Value) => {
        setMinRating(Value);
    };
    useEffect(() => {
        dispatch({ type: RATING_FILTER, payload: {minrating: minrating}});
    }, [dispatch, minrating]);

    const handleDistBias = (event, Value) => {
        setDistBias(Value);
    };
    useEffect(() => {
        dispatch({ type: DISTANCE_FILTER, payload: {distbias: distbias}});
    }, [dispatch, distbias]);

    
    const matchesXs = useMediaQuery(theme.breakpoints.down('sm'));

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
    const handleSearch = () => {
        axios
            .get( configData.API_SERVER + 'places', {
                params: {   name: value,
                            distance_bias: account.distbias,
                            min_price: account.minprice,
                            max_price: account.maxprice,
                            min_rating: account.minrating },
                headers: { Authorization: `${account.token}` } 
            })
            .then(function (response) {
                if(response.data){
                    if(response.data.status){
                        dispatch({type: CLEAR_SEARCH_RESULTS});
                    }
                    else{
                        dispatch({
                            type: SEARCH_RESULTS,
                            payload: { search_results: response.data}
                        });
                        console.log("SEARCH RESULTS");
                        console.log(response.data);
                    }
                }
                else{
                    dispatch({type: CLEAR_SEARCH_RESULTS});
                }
            })
            .catch(function (error) {
                dispatch({type: CLEAR_SEARCH_RESULTS});
                console.log('error - ', error);
            });
    }

    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            anchorRef.current.focus();
        }
        prevOpen.current = open;
    }, [open]);

    return (
        <React.Fragment>
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
                                        <IconSearch stroke={1.5} size="1.2rem" />
                                    </Avatar>
                                </ButtonBase>
                            </Box>
                            <Popper {...bindPopper(popupState)} transition className={classes.popperContainer}>
                                {({ TransitionProps }) => (
                                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                                        <Card className={classes.card}>
                                            <CardContent className={classes.cardContent}>
                                                <Grid container alignItems="center" justifyContent="space-between">
                                                    <Grid item xs>
                                                        <OutlinedInput
                                                            className={classes.searchControl}
                                                            id="input-search-header"
                                                            value={value}
                                                            onChange={(e) => setValue(e.target.value)}
                                                            placeholder="Search"
                                                            startAdornment={
                                                                <InputAdornment position="start">
                                                                    <IconSearch
                                                                        stroke={1.5}
                                                                        size="1rem"
                                                                        className={classes.startAdornment}
                                                                    />
                                                                </InputAdornment>
                                                            }
                                                            endAdornment={
                                                                <InputAdornment position="end">
                                                                    <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                        <Avatar variant="rounded" className={classes.headerAvatar}>
                                                                            <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                                                        </Avatar>
                                                                    </ButtonBase>
                                                                    <Box
                                                                        sx={{
                                                                            ml: 2
                                                                        }}
                                                                    >
                                                                        <ButtonBase sx={{ borderRadius: '12px' }}>
                                                                            <Avatar
                                                                                variant="rounded"
                                                                                className={classes.closeAvatar}
                                                                                {...bindToggle(popupState)}
                                                                            >
                                                                                <IconX stroke={1.5} size="1.3rem" />
                                                                            </Avatar>
                                                                        </ButtonBase>
                                                                    </Box>
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
                    startAdornment={
                        <InputAdornment position="start">
                            <IconSearch stroke={1.5} size="1rem" className={classes.startAdornment} />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            
                            <ButtonBase onClick={handleToggle} sx={{ borderRadius: '12px' }}>
                                <Avatar ref={anchorRef} variant="rounded" className={classes.headerAvatar}>
                                    <IconAdjustmentsHorizontal stroke={1.5} size="1.3rem" />
                                </Avatar>
                            </ButtonBase>
                        </InputAdornment>
                    }
                    aria-describedby="search-helper-text"
                    inputProps={{
                        'aria-label': 'weight'
                    }}
                />
                
            </Box>
            <ButtonBase onClick={handleSearch} sx={{ borderRadius: '12px' }}>
                    <Avatar ref={anchorRef} variant="rounded" className={classes.headerAvatar}>
                        <IconGlassFull stroke={1.5} size="1.3rem" />
                    </Avatar>
                </ButtonBase>
            <Popper
                placement={matchesXs ? 'bottom' : 'bottom-end'}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [matchesXs ? 5 : 0, 20]
                            }
                        }
                    ]
                }}
            >
                {({ TransitionProps }) => (
                    <Transitions in={open} {...TransitionProps}>
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                                    <CardContent className={classes.cardContent}>
                                        <Grid container direction="column" spacing={3}>
                                            <Grid item xs={12}>
                                                {/* border radius */}
                                                <SubCard title="Price Filter">
                                                    <Grid item xs={12} container spacing={0.5} alignItems="center" sx={{ mt: 2.5 }}>
                                                        <Grid item>
                                                            <Typography variant="h6" color="secondary">
                                                                $
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs>
                                                            <Slider
                                                            size="small"
                                                            value={[minprice, maxprice]}
                                                            onChange={handlePrice}
                                                            getAriaValueText={valueText}
                                                            aria-labelledby="discrete-slider-small-steps"
                                                            min={0}
                                                            max={4}
                                                            defaultValue={[0, 4]}
                                                            color="secondary"
                                                            sx={{
                                                                '& .MuiSlider-valueLabel': {
                                                                    color: 'secondary.light'
                                                                }
                                                            }}
                                                        />
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="h6" color="secondary">
                                                                $$$$
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </SubCard>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {/* border radius */}
                                                <SubCard title="Min Rating Filter">
                                                    <Grid item xs={12} container spacing={0.5} alignItems="center" sx={{ mt: 2.5 }}>
                                                        <Grid item>
                                                            <Typography variant="h6" color="secondary">
                                                                0
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs>
                                                            <Slider
                                                            size="small"
                                                            value={minrating}
                                                            onChange={handleRating}
                                                            getAriaValueText={valueText}
                                                            min={0}
                                                            max={5}
                                                            track="inverted"
                                                            color="secondary"
                                                            sx={{
                                                                '& .MuiSlider-valueLabel': {
                                                                    color: 'secondary.light'
                                                                }
                                                            }}
                                                        />
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="h6" color="secondary">
                                                                5
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </SubCard>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {/* border radius */}
                                                <SubCard title="Distance Filter">
                                                    <Grid item xs={12} container spacing={0.5} alignItems="center" sx={{ mt: 2.5 }}>
                                                        <Grid item>
                                                            <Typography variant="h6" color="secondary">
                                                                0
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs>
                                                            <Slider
                                                            size="small"
                                                            value={distbias}
                                                            onChange={handleDistBias}
                                                            getAriaValueText={valueText}
                                                            min={0}
                                                            max={50}
                                                            color="secondary"
                                                            sx={{
                                                                '& .MuiSlider-valueLabel': {
                                                                    color: 'secondary.light'
                                                                }
                                                            }}
                                                        />
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="h6" color="secondary">
                                                                50 miles
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </SubCard>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </MainCard>
                            </ClickAwayListener>
                        </Paper>
                    </Transitions>
                )}
            </Popper>
        </React.Fragment>
    );
};

export default SearchSection;
