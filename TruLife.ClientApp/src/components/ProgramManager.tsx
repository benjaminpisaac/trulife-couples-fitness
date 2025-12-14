import React, { useState, useEffect } from 'react';
import { Calendar, Play, Trash2 } from 'lucide-react';

interface WorkoutProgram {
    id: number;
    name: string;
    description?: string;
    durationWeeks: number;
    startDate: string;
    isActive: boolean;
    weeks: ProgramWeek[];
}

interface ProgramWeek {
    id: number;
    weekNumber: number;
    workoutPlan?: string;
}

export default function ProgramManager() {
    const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);

    const [newProgramName, setNewProgramName] = useState('');
    const [newProgramDescription, setNewProgramDescription] = useState('');
    const [newProgramWeeks, setNewProgramWeeks] = useState(8);
    const [newProgramGoal, setNewProgramGoal] = useState('muscle_gain');

    useEffect(() => {
        loadPrograms();
    }, []);

    const loadPrograms = async () => {
        try {
            const response = await fetch('/api/workoutprogram', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPrograms(data);
            }
        } catch (err) {
            console.error('Failed to load programs:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateProgram = async () => {
        if (!newProgramName.trim()) return;

        setGenerating(true);
        try {
            const response = await fetch('/api/workoutprogram/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: newProgramName,
                    description: newProgramDescription,
                    durationWeeks: newProgramWeeks,
                    fitnessGoal: newProgramGoal
                })
            });

            if (response.ok) {
                const newProgram = await response.json();
                setPrograms([newProgram, ...programs]);
                setShowCreateDialog(false);
                setNewProgramName('');
                setNewProgramDescription('');
                setNewProgramWeeks(8);
                setNewProgramGoal('muscle_gain');
            }
        } catch (err) {
            console.error('Failed to generate program:', err);
            alert('Failed to generate program. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const deleteProgram = async (id: number) => {
        if (!confirm('Delete this program?')) return;

        try {
            const response = await fetch(`/api/workoutprogram/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setPrograms(programs.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete program:', err);
        }
    };

    const viewProgram = async (id: number) => {
        try {
            const response = await fetch(`/api/workoutprogram/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const program = await response.json();
                setSelectedProgram(program);
            }
        } catch (err) {
            console.error('Failed to load program details:', err);
        }
    };

    if (loading) {
        return <div className="text-center py-8"><div className="spinner"></div></div>;
    }

    return (
        <div className="program-manager">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">📅 Training Programs</h3>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateDialog(true)}
                >
                    Generate New Program
                </button>
            </div>

            {programs.length === 0 ? (
                <div className="card text-center py-8">
                    <p className="text-gray-600">No training programs yet</p>
                    <button
                        className="btn btn-primary mt-4"
                        onClick={() => setShowCreateDialog(true)}
                    >
                        Generate Your First Program
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {programs.map(program => (
                        <div key={program.id} className="card">
                            <div className="card-content">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {program.name}
                                            {program.isActive && (
                                                <span className="badge badge-success">Active</span>
                                            )}
                                        </h4>
                                        {program.description && (
                                            <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {program.durationWeeks} weeks
                                            </span>
                                            <span>
                                                Started {new Date(program.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => viewProgram(program.id)}
                                        >
                                            <Play size={16} />
                                            View
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost text-red-600"
                                            onClick={() => deleteProgram(program.id)}
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
                <div className="modal-overlay" onClick={() => !generating && setShowCreateDialog(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Generate Training Program</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Program Name</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., Summer Shred, Strength Builder"
                                    value={newProgramName}
                                    onChange={(e) => setNewProgramName(e.target.value)}
                                    disabled={generating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                <textarea
                                    className="input w-full"
                                    rows={2}
                                    placeholder="Program description..."
                                    value={newProgramDescription}
                                    onChange={(e) => setNewProgramDescription(e.target.value)}
                                    disabled={generating}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Duration</label>
                                <select
                                    className="input w-full"
                                    value={newProgramWeeks}
                                    onChange={(e) => setNewProgramWeeks(Number(e.target.value))}
                                    disabled={generating}
                                >
                                    <option value={4}>4 weeks</option>
                                    <option value={6}>6 weeks</option>
                                    <option value={8}>8 weeks</option>
                                    <option value={10}>10 weeks</option>
                                    <option value={12}>12 weeks</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Fitness Goal</label>
                                <select
                                    className="input w-full"
                                    value={newProgramGoal}
                                    onChange={(e) => setNewProgramGoal(e.target.value)}
                                    disabled={generating}
                                >
                                    <option value="fat_loss">Fat Loss</option>
                                    <option value="muscle_gain">Muscle Gain</option>
                                    <option value="strength">Build Strength</option>
                                    <option value="endurance">Improve Endurance</option>
                                    <option value="general_fitness">General Fitness</option>
                                </select>
                            </div>
                        </div>

                        {generating && (
                            <div className="mt-4 text-center">
                                <div className="spinner"></div>
                                <p className="text-sm text-gray-600 mt-2">
                                    AI is generating your {newProgramWeeks}-week program...
                                    <br />
                                    This may take a minute.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2 mt-6">
                            <button
                                className="btn btn-ghost flex-1"
                                onClick={() => setShowCreateDialog(false)}
                                disabled={generating}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary flex-1"
                                onClick={generateProgram}
                                disabled={!newProgramName.trim() || generating}
                            >
                                {generating ? 'Generating...' : 'Generate Program'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Program Details Dialog */}
            {selectedProgram && (
                <div className="modal-overlay" onClick={() => setSelectedProgram(null)}>
                    <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">{selectedProgram.name}</h3>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {selectedProgram.weeks.map(week => (
                                <div key={week.id} className="card">
                                    <div className="card-header">
                                        <h4 className="font-semibold">Week {week.weekNumber}</h4>
                                    </div>
                                    <div className="card-content">
                                        {week.workoutPlan ? (
                                            <pre className="text-sm whitespace-pre-wrap">
                                                {week.workoutPlan}
                                            </pre>
                                        ) : (
                                            <p className="text-gray-600">No workout plan available</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="btn btn-primary w-full mt-4"
                            onClick={() => setSelectedProgram(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
