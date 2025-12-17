import { useState } from 'react';

interface Restaurant {
    restaurantType: string;
    cuisine: string;
    recommendedDishes: {
        dishName: string;
        estimatedCalories: number;
        estimatedProtein: number;
        estimatedCarbs: number;
        estimatedFats: number;
        orderingTips: string;
    }[];
}

interface RestaurantFinderProps {
    targetCalories?: number;
    targetProtein?: number;
    dietaryPreference?: string;
}

export default function RestaurantFinder({
    targetCalories = 600,
    targetProtein = 30,
    dietaryPreference = 'none'
}: RestaurantFinderProps) {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);

    const cuisineTypes = ['Any', 'American', 'Mexican', 'Italian', 'Asian', 'Mediterranean', 'Indian'];
    const [selectedCuisine, setSelectedCuisine] = useState('Any');

    const getCurrentLocation = () => {
        setUseCurrentLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
                    alert('Location detected! Click "Find Restaurants" to search.');
                },
                (error) => {
                    alert('Unable to get location. Please enter manually.');
                    setUseCurrentLocation(false);
                }
            );
        } else {
            alert('Geolocation not supported. Please enter location manually.');
            setUseCurrentLocation(false);
        }
    };

    const findRestaurants = async () => {
        if (!location && !useCurrentLocation) {
            alert('Please enter a location or use current location');
            return;
        }

        setLoading(true);
        try {
            // Parse location (could be "lat, lng" or address)
            let latitude = 0;
            let longitude = 0;

            if (location.includes(',')) {
                const [lat, lng] = location.split(',').map(s => parseFloat(s.trim()));
                latitude = lat;
                longitude = lng;
            } else {
                // For now, use a default location if address is entered
                // In production, you'd geocode the address first
                alert('Please use "Use Current Location" or enter coordinates (lat, lng)');
                setLoading(false);
                return;
            }

            // Call the backend API
            const response = await fetch('http://localhost:5000/api/restaurant/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    radiusMeters: 5000,
                    cuisine: selectedCuisine === 'Any' ? null : selectedCuisine
                })
            });

            if (!response.ok) {
                throw new Error('Failed to search restaurants');
            }

            const data = await response.json();
            setRestaurants(data.restaurants || []);
        } catch (error) {
            console.error('Error searching restaurants:', error);
            alert('Failed to find restaurants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: 'white', padding: '1.5rem', borderRadius: '12px 12px 0 0', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🍴 Restaurant Finder</h2>
                <p style={{ opacity: 0.9 }}>Find macro-friendly options nearby</p>
            </div>

            <div style={{ padding: '0 1.5rem 1.5rem' }}>
                {/* Location Input */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        📍 Location
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter city or address"
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '2px solid #e5e7eb' }}
                        />
                        <button
                            onClick={getCurrentLocation}
                            className="btn btn-outline"
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            📍 Use Current
                        </button>
                    </div>
                </div>

                {/* Cuisine Type */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        🍽️ Cuisine Type
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {cuisineTypes.map(cuisine => (
                            <button
                                key={cuisine}
                                onClick={() => setSelectedCuisine(cuisine)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    border: `2px solid ${selectedCuisine === cuisine ? '#f59e0b' : '#e5e7eb'}`,
                                    background: selectedCuisine === cuisine ? '#fef3c7' : 'white',
                                    fontWeight: selectedCuisine === cuisine ? 600 : 400,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target Info */}
                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#78350f' }}>
                        <strong>Your Targets:</strong> {targetCalories} cal, {targetProtein}g protein
                        {dietaryPreference !== 'none' && ` | Diet: ${dietaryPreference}`}
                    </div>
                </div>

                {/* Find Button */}
                <button
                    onClick={findRestaurants}
                    className="btn btn-primary w-full"
                    disabled={loading}
                    style={{ marginBottom: '1.5rem' }}
                >
                    {loading ? '🔍 Searching...' : '🔍 Find Restaurants'}
                </button>

                {/* Results */}
                {restaurants.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {restaurants.map((restaurant, idx) => (
                            <div key={idx} style={{ background: '#fffbeb', borderRadius: '12px', padding: '1.5rem', border: '2px solid #fbbf24' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#92400e' }}>
                                        {restaurant.restaurantType}
                                    </h4>
                                    <div style={{ fontSize: '0.9rem', color: '#78350f' }}>
                                        {restaurant.cuisine} Cuisine
                                    </div>
                                </div>

                                {/* Dishes */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {restaurant.recommendedDishes.map((dish, dishIdx) => (
                                        <div key={dishIdx} style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{dish.dishName}</div>

                                            {/* Macros */}
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                <span>{dish.estimatedCalories} cal</span>
                                                <span>{dish.estimatedProtein}g P</span>
                                                <span>{dish.estimatedCarbs}g C</span>
                                                <span>{dish.estimatedFats}g F</span>
                                            </div>

                                            {/* Ordering Tips */}
                                            <div style={{ background: '#fef3c7', borderRadius: '6px', padding: '0.75rem', fontSize: '0.85rem' }}>
                                                <strong>💡 Ordering Tips:</strong> {dish.orderingTips}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info */}
                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: '#78350f', margin: 0 }}>
                        <strong>💡 Tip:</strong> These recommendations are based on your macro targets and dietary preferences. Actual nutrition may vary - always verify with the restaurant.
                    </p>
                </div>
            </div>
        </div>
    );
}
