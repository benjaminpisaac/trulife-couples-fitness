import { useState, useEffect } from 'react';
import { uploadDNA, getGeneticProfile } from '../services/api';

const DNA = () => {
    const [file, setFile] = useState<File | null>(null);
    const [dataSource, setDataSource] = useState('23andme');
    const [uploading, setUploading] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('dataSource', dataSource);

            const response = await uploadDNA(formData);
            setProfile(response.data);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload DNA file');
        } finally {
            setUploading(false);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await getGeneticProfile();
            setProfile(response.data);
        } catch (err) {
            // No profile found
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    return (
        <div className="page">
            <div className="page-header">
                <h1 className="page-title">🧬 DNA Analysis</h1>
                <p className="text-gray">Genetic precision fitness optimization</p>
            </div>

            <div className="container">
                {!profile ? (
                    <div className="card">
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Upload DNA Data</h2>

                        <div className="form-group">
                            <label className="label">Data Source</label>
                            <select
                                className="input"
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value)}
                            >
                                <option value="23andme">23andMe</option>
                                <option value="ancestrydna">AncestryDNA</option>
                                <option value="myheritage">MyHeritage</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Raw Data File</label>
                            <input
                                type="file"
                                accept=".txt,.zip"
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
                            disabled={uploading || !file}
                            className="btn btn-secondary w-full"
                        >
                            {uploading ? 'Analyzing DNA...' : 'Upload & Analyze'}
                        </button>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px' }}>
                            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>How to get your raw DNA data:</h4>
                            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                                <li><strong>23andMe:</strong> Account → Settings → Raw Data → Download</li>
                                <li><strong>AncestryDNA:</strong> DNA → Settings → Download Raw DNA Data</li>
                                <li><strong>MyHeritage:</strong> DNA → Manage DNA Kit → Download Raw DNA Data</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)', color: 'white' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>DNA Analysis Complete</h2>
                            <p style={{ opacity: 0.9 }}>
                                Uploaded {new Date(profile.uploadDate).toLocaleDateString()} from {profile.dataSource}
                            </p>
                        </div>

                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Analysis Summary</h2>
                            <p className="text-gray">{profile.analysisSummary}</p>
                        </div>

                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Training Recommendation</h2>
                            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#8b5cf6' }}>
                                {profile.trainingRecommendation}
                            </p>
                        </div>

                        <div className="card">
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Nutrition Recommendation</h2>
                            <p className="text-gray">{profile.nutritionRecommendation}</p>
                        </div>

                        {profile.supplementRecommendations && profile.supplementRecommendations.length > 0 && (
                            <div className="card">
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Supplement Recommendations</h2>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                                    {profile.supplementRecommendations.map((supp: string, idx: number) => (
                                        <li key={idx} className="text-gray mb-2">{supp}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {profile.injuryRiskFactors && profile.injuryRiskFactors.length > 0 && (
                            <div className="card">
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Injury Risk Factors</h2>
                                <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem' }}>
                                    {profile.injuryRiskFactors.map((risk: string, idx: number) => (
                                        <li key={idx} className="text-gray mb-2">{risk}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="card">
                            <button
                                onClick={() => setProfile(null)}
                                className="btn btn-outline w-full"
                            >
                                Upload New DNA File
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DNA;
