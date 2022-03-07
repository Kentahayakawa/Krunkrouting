import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { Grid } from '@material-ui/core';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import SearchResultsCard from './SearchResults';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from './TotalIncomeDarkCard';
import TotalIncomeLightCard from './TotalIncomeLightCard';
import MemberCard from './MemberCard';

import { gridSpacing } from './../../../store/constant';

//-----------------------|| DEFAULT DASHBOARD ||-----------------------//

const Dashboard = () => {
    const [isLoading, setLoading] = useState(true);
    const account = useSelector((state) => state.account);
    useEffect(() => {
        setLoading(false);
    }, []);

    if(!(account && account.search_results && account.search_results.length!== 0)){
        return (
            <Grid container justifyContent="flex-end" direction="row" spacing={gridSpacing}>
                <Grid item xs={12}>
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item lg={6} md={6} sm={6} xs={12}>
                                    <TotalOrderLineChartCard isLoading={isLoading} />
                                </Grid>
                                <Grid item lg={6} md={12} sm={12} xs={12}>
                                    <Grid container spacing={gridSpacing}>
                                        <Grid item sm={6} xs={12} md={6} lg={12}>
                                            <TotalIncomeDarkCard isLoading={isLoading} />
                                        </Grid>
                                        <Grid item sm={6} xs={12} md={6} lg={12}>
                                            <TotalIncomeLightCard isLoading={isLoading} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={gridSpacing}>
                                <Grid item xs={12} md={12}>
                                    <MemberCard isLoading={isLoading} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
    return (
        <Grid container justifyContent="flex-end" direction="row" spacing={gridSpacing}>
            <Grid item xs={12} lg={4}>
                <Grid container>
                    <Grid item xs={12}>
                        <SearchResultsCard isLoading={isLoading} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12} lg={8}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item lg={6} md={6} sm={6} xs={12}>
                                <TotalOrderLineChartCard isLoading={isLoading} />
                            </Grid>
                            <Grid item lg={6} md={12} sm={12} xs={12}>
                                <Grid container spacing={gridSpacing}>
                                    <Grid item sm={6} xs={12} md={6} lg={12}>
                                        <TotalIncomeDarkCard isLoading={isLoading} />
                                    </Grid>
                                    <Grid item sm={6} xs={12} md={6} lg={12}>
                                        <TotalIncomeLightCard isLoading={isLoading} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12} md={12}>
                                <MemberCard isLoading={isLoading} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
