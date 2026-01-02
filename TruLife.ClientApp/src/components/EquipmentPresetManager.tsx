import React, { useState, useEffect } from 'react';
import { Star, Trash2, Plus } from 'lucide-react';
import { getApiUrl } from '../services/api';

interface EquipmentPreset {
    id: number;
    name: string;
    photoUrl?: string;
    availableEquipment: string[];
    isFavorite: boolean;
    createdAt: string;
}

interface EquipmentPresetManagerProps {
    onSelectPreset: (preset: EquipmentPreset) => void;
}

export default function EquipmentPresetManager({ onSelectPreset }: EquipmentPresetManagerProps) {
    const [presets, setPresets] = useState<EquipmentPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetEquipment, setNewPresetEquipment] = useState<string[]>([]);
    const [equipmentInput, setEquipmentInput] = useState('');

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        try {
            const response = await fetch(getApiUrl('/api/equipment/presets'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPresets(data);
            }
        } catch (err) {
            console.error('Failed to load presets:', err);
        } finally {
            setLoading(false);
        }
    };

    const createPreset = async () => {
        if (!newPresetName.trim()) return;

        try {
            const response = await fetch(getApiUrl('/api/equipment/presets'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: newPresetName,
                    availableEquipment: newPresetEquipment
                })
            });

            if (response.ok) {
                const newPreset = await response.json();
                setPresets([newPreset, ...presets]);
                setShowCreateDialog(false);
                setNewPresetName('');
                setNewPresetEquipment([]);
            }
        } catch (err) {
            console.error('Failed to create preset:', err);
        }
    };

    const toggleFavorite = async (id: number) => {
        try {
            const response = await fetch(getApiUrl(`/api/equipment/presets/${id}/favorite`), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setPresets(presets.map(p =>
                    p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
                ));
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    const deletePreset = async (id: number) => {
        if (!confirm('Delete this preset?')) return;

        try {
            const response = await fetch(getApiUrl(`/api/equipment/presets/${id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setPresets(presets.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete preset:', err);
        }
    };

    const addEquipment = () => {
        if (equipmentInput.trim()) {
            setNewPresetEquipment([...newPresetEquipment, equipmentInput.trim()]);
            setEquipmentInput('');
        }
    };

    if (loading) {
        return <div className="text-center py-8"><div className="spinner"></div></div>;
    }

    return (
        <div className="equipment-preset-manager">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">🏋️ Saved Gym Locations</h3>
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowCreateDialog(true)}
                >
                    <Plus size={16} />
                    New Preset
                </button>
            </div>

            {presets.length === 0 ? (
                <div className="card text-center py-8">
                    <p className="text-gray-600">No saved gym locations yet</p>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={() => setShowCreateDialog(true)}
                    >
                        Create Your First Preset
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {presets.map(preset => (
                        <div
                            key={preset.id}
                            className="card cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => onSelectPreset(preset)}
                        >
                            <div className="card-content">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {preset.name}
                                            {preset.isFavorite && <Star size={16} className="text-yellow-500 fill-current" />}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {preset.availableEquipment.length} equipment items
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {preset.availableEquipment.slice(0, 3).map((eq, idx) => (
                                                <span key={idx} className="badge badge-sm">
                                                    {eq}
                                                </span>
                                            ))}
                                            {preset.availableEquipment.length > 3 && (
                                                <span className="badge badge-sm">
                                                    +{preset.availableEquipment.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(preset.id);
                                            }}
                                        >
                                            <Star
                                                size={16}
                                                className={preset.isFavorite ? 'text-yellow-500 fill-current' : ''}
                                            />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deletePreset(preset.id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            {showCreateDialog && (
                <div className="modal-overlay" onClick={() => setShowCreateDialog(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Create New Preset</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Preset Name</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Home Gym, LA Fitness"
                                    value={newPresetName}
                                    onChange={(e) => setNewPresetName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Equipment</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="input flex-1"
                                        placeholder="Add equipment"
                                        value={equipmentInput}
                                        onChange={(e) => setEquipmentInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
                                    />
                                    <button className="btn btn-primary" onClick={addEquipment}>
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newPresetEquipment.map((eq, idx) => (
                                        <span key={idx} className="badge">
                                            {eq}
                                            <button
                                                className="ml-1 text-red-600"
                                                onClick={() => setNewPresetEquipment(newPresetEquipment.filter((_, i) => i !== idx))}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                className="btn btn-ghost flex-1"
                                onClick={() => setShowCreateDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary flex-1"
                                onClick={createPreset}
                                disabled={!newPresetName.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
