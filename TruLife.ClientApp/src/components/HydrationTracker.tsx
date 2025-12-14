import React, { useState, useEffect } from 'react';
import { Droplet, Plus } from 'lucide-react';

const QUICK_ADD_AMOUNTS = [250, 500, 750, 1000]; // ml
const DAILY_GOAL = 2500; // ml (adjust based on user settings)

export default function HydrationTracker() {
    const [todayTotal, setTodayTotal] = useState(0);
    const [customAmount, setCustomAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTodayTotal();
    }, []);

    const loadTodayTotal = async () => {
        try {
            const response = await fetch('/api/hydration/today', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const total = await response.json();
                setTodayTotal(total);
            }
        } catch (err) {
            console.error('Failed to load hydration:', err);
        } finally {
            setLoading(false);
        }
    };

    const logHydration = async (amount: number) => {
        try {
            const response = await fetch('/api/hydration/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ amountMl: amount })
            });

            if (response.ok) {
                setTodayTotal(prev => prev + amount);
                setCustomAmount('');
            }
        } catch (err) {
            console.error('Failed to log hydration:', err);
        }
    };

    const handleCustomAdd = () => {
        const amount = parseInt(customAmount);
        if (amount > 0) {
            logHydration(amount);
        }
    };

    const percentage = Math.min((todayTotal / DAILY_GOAL) * 100, 100);

    if (loading) {
        return <div className="text-center py-4"><div className="spinner"></div></div>;
    }

    return (
        <div className="hydration-tracker">
            <div className="card">
                <div className="card-header">
                    <h3 className="flex items-center gap-2">
                        <Droplet className="text-blue-500" size={24} />
                        Hydration Tracker
                    </h3>
                </div>

                <div className="card-content space-y-4">
                    {/* Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Today's Progress</span>
                            <span className="text-sm text-gray-600">
                                {todayTotal}ml / {DAILY_GOAL}ml
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-blue-500 h-full transition-all duration-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {percentage >= 100 ? '🎉 Goal reached!' : `${Math.round(DAILY_GOAL - todayTotal)}ml remaining`}
                        </p>
                    </div>

                    {/* Quick Add Buttons */}
                    <div>
                        <p className="text-sm font-medium mb-2">Quick Add</p>
                        <div className="grid grid-cols-4 gap-2">
                            {QUICK_ADD_AMOUNTS.map(amount => (
                                <button
                                    key={amount}
                                    className="btn btn-outline"
                                    onClick={() => logHydration(amount)}
                                >
                                    {amount}ml
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div>
                        <p className="text-sm font-medium mb-2">Custom Amount</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className="input flex-1"
                                placeholder="Amount in ml"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCustomAdd()}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleCustomAdd}
                                disabled={!customAmount || parseInt(customAmount) <= 0}
                            >
                                <Plus size={20} />
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                            <strong>💡 Tip:</strong> Aim for 8-10 glasses (2-2.5L) of water daily.
                            Increase intake during workouts and hot weather.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
