import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { socketService } from '../services/socket';
import type { ClassStats } from '../types';
import './Statistics.css';

export const Statistics = () => {
  const [stats, setStats] = useState<ClassStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Statistics: Setting up WebSocket listener');
    const unsubscribe = socketService.onStatsUpdate((newStats: ClassStats[]) => {
      console.log('Statistics: Received new stats', newStats);
      setStats(newStats);
      setIsLoading(false);
    });

    // Request initial stats
    console.log('Statistics: Requesting initial stats');
    socketService.requestStats();

    return () => {
      console.log('Statistics: Cleaning up WebSocket listener');
      unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="statistics">
        <h2>Class Statistics</h2>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="statistics">
        <h2>Class Statistics</h2>
        <p>No characters available.</p>
      </div>
    );
  }

  return (
    <div className="statistics">
      <h2>Class Statistics</h2>
      <div className="charts">
        <div className="chart-container">
          <h3>Average HP by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgHP" fill="#8884d8" name="Average HP" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Average Damage by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgDamage" fill="#82ca9d" name="Average Damage" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Average Armor by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgArmor" fill="#ffc658" name="Average Armor" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Character Count by Class</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ff7300" name="Character Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}; 