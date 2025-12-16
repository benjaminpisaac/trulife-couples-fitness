import { useState, useEffect } from 'react';
import { uploadLabResult, getLabResults } from '../services/api';

const Labs = () => {
    const [file, setFile] = useState<File | null>(null);
    const [testName, setTestName] = useState('');
    const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file || !testName) {
            setError('Please select a file and enter test name');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('testName', testName);
            formData.append('testDate', testDate);

            const response = await uploadLabResult(formData);
            setResults([response.data, ...results]);
            setSelectedResult(response.data);
            setFile(null);
            setTestName('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload lab result');
        } finally {
            setUploading(false);
        }
    };

    const loadResults = async () => {
        try {
            const response = await getLabResults();
            setResults(response.data);
            if (response.data.length > 0) {
                setSelectedResult(response.data[0]);
            }
        } catch (err) {
            // No results found
        }
    };

    useEffect(() => {
        loadResults();
    }, []);

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">🔬 Lab Analysis</h1>
                <p className="text-gray">AI-powered biomarker insights</p>
            </div>

            <div className="container">
                {results.length === 0 ? (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Upload Lab Results</h2>

                        <div className="form-group">
                            <label className="label">Test Name</label>
                            <input
                                type="text"
                                className="input"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                placeholder="e.g., Complete Blood Count, Metabolic Panel"
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Test Date</label>
                            <input
                                type="date"
                                className="input"
                                value={testDate}
                                onChange={(e) => setTestDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Lab Results File (PDF or Image)</label>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="input"
                            />
                            {file && (
                                <p className="text-sm text-gray mt-2">
                                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="alert alert-error mb-3">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file || !testName}
                            className="btn btn-secondary w-full"
                        >
                            {uploading ? 'Analyzing Lab Results...' : 'Upload & Analyze'}
                        </button>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Supported Formats:</h4>
                            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                                <li>PDF lab reports</li>
                                <li>Photos of lab results</li>
                                <li>Scanned documents</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Your Lab Results</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {results.map((result) => (
                                    <div
                                        key={result.id}
                                        onClick={() => setSelectedResult(result)}
                                        style={{
                                            padding: '1rem',
                                            background: selectedResult?.id === result.id ? '#e0e7ff' : '#f9fafb',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: selectedResult?.id === result.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb'
                                        }}
                                    >
                                        <div style={{ fontWeight: 600 }}>{result.labName || result.testName}</div>
                                        <div className="text-sm text-gray">
                                            {new Date(result.testDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setResults([])}
                                className="btn btn-outline w-full mt-3"
                            >
                                Upload New Lab Results
                            </button>
                        </div>

                        {selectedResult && (
                            <>
                                <div className="card" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', color: 'white' }}>
                                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                        {selectedResult.labName || selectedResult.testName}
                                    </h2>
                                    <p style={{ opacity: 0.9 }}>
                                        Test Date: {new Date(selectedResult.testDate).toLocaleDateString()}
                                    </p>
                                </div>

                                {selectedResult.aiRecommendations && (
                                    <div className="card">
                                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>AI Analysis</h2>
                                        <p className="text-gray">{selectedResult.aiRecommendations}</p>
                                    </div>
                                )}

                                {selectedResult.biomarkers && selectedResult.biomarkers.length > 0 && (
                                    <div className="card">
                                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Biomarkers</h2>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedResult.biomarkers.map((biomarker: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        padding: '1rem',
                                                        background: biomarker.status === 'Normal' ? '#f0fdf4' : '#fef2f2',
                                                        borderRadius: '8px',
                                                        borderLeft: `4px solid ${biomarker.status === 'Normal' ? '#10b981' : '#ef4444'}`
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                        {biomarker.name}
                                                    </div>
                                                    <div className="text-sm text-gray">
                                                        Value: {biomarker.value} {biomarker.unit}
                                                    </div>
                                                    <div className="text-sm text-gray">
                                                        Reference: {biomarker.referenceRange}
                                                    </div>
                                                    <div
                                                        className="text-sm"
                                                        style={{
                                                            color: biomarker.status === 'Normal' ? '#10b981' : '#ef4444',
                                                            fontWeight: 600,
                                                            marginTop: '0.25rem'
                                                        }}
                                                    >
                                                        {biomarker.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Labs;
