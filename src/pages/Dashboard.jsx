import React from 'react';
import WelcomeCard from '../components/dashboard/WelcomeCard';
import AlertCard from '../components/dashboard/AlertCard';
import { DeviceStatsCard, SoilDensityCard } from '../components/dashboard/StatsCharts';
import DroneCard from '../components/dashboard/DroneCard';

const Dashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 fade-in pb-10">
            {/* Header / Title Section if needed, but WelcomeCard covers it */}

            {/* Row 1: Welcome & Stats */}
            <div className="md:col-span-8 flex flex-col gap-6">
                <WelcomeCard />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AlertCard />
                    <DeviceStatsCard />
                </div>
            </div>

            {/* Row 1/2 Side: Drone & Extra Stats */}
            <div className="md:col-span-4 flex flex-col gap-6">
                <div className="h-64 md:h-80">
                    <DroneCard />
                </div>
                <SoilDensityCard />
            </div>

            {/* Row 2: Additional full width section if needed */}
        </div>
    );
};

export default Dashboard;
