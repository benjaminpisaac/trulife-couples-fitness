import { useState, useRef } from 'react';

interface ChallengePhotoProps {
    challengeId: string;
    partnerId: 'A' | 'B';
    photoType: 'before' | 'after';
    onComplete?: () => void;
}

export default function ChallengePhotoCapture({ challengeId, partnerId, photoType, onComplete }: ChallengePhotoProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [showGuidelines, setShowGuidelines] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhoto = () => {
        if (!selectedPhoto) return;

        const storageKey = `challenge_${challengeId}_partner${partnerId}_${photoType}`;
        const photoData = {
            photo: selectedPhoto,
            uploadedAt: new Date().toISOString(),
            partnerId,
            photoType
        };

        localStorage.setItem(storageKey, JSON.stringify(photoData));
        alert(`${photoType === 'before' ? 'Before' : 'After'} photo saved successfully!`);

        if (onComplete) {
            onComplete();
        }
    };

    const handleRetake = () => {
        setSelectedPhoto(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="card">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                📸 {photoType === 'before' ? 'Before' : 'After'} Photo - Partner {partnerId}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '2rem' }}>
                {photoType === 'before'
                    ? 'Capture your starting point for this transformation challenge'
                    : 'Show your amazing transformation results!'}
            </p>

            {!selectedPhoto ? (
                <>
                    {/* Guidelines */}
                    {showGuidelines && (
                        <div style={{ background: '#dbeafe', border: '2px solid #3b82f6', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e40af' }}>
                                    📋 Photo Guidelines
                                </h3>
                                <button
                                    onClick={() => setShowGuidelines(false)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                >
                                    ✕
                                </button>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Take photos in good lighting</li>
                                <li style={{ marginBottom: '0.5rem' }}>Wear form-fitting clothing</li>
                                <li style={{ marginBottom: '0.5rem' }}>Stand in the same location for consistency</li>
                                <li style={{ marginBottom: '0.5rem' }}>Recommended poses: Front, Side, Back</li>
                                <li>Relax and stand naturally</li>
                            </ul>
                        </div>
                    )}

                    {/* Upload Interface */}
                    <div style={{
                        border: '3px dashed #d1d5db',
                        borderRadius: '12px',
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        background: '#f9fafb'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Upload Your Photo
                        </h3>
                        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                            Choose a photo from your device
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="photo-upload"
                        />
                        <label htmlFor="photo-upload">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
                            >
                                📁 Choose Photo
                            </button>
                        </label>

                        {/* Camera option (if supported) */}
                        <div style={{ marginTop: '1rem' }}>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                id="camera-capture"
                            />
                            <label htmlFor="camera-capture">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => document.getElementById('camera-capture')?.click()}
                                >
                                    📸 Take Photo
                                </button>
                            </label>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Photo Preview */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            Preview
                        </h3>
                        <div style={{
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            maxWidth: '400px',
                            margin: '0 auto'
                        }}>
                            <img
                                src={selectedPhoto}
                                alt="Preview"
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            onClick={handleRetake}
                            style={{ flex: 1 }}
                        >
                            🔄 Retake Photo
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSavePhoto}
                            style={{ flex: 2 }}
                        >
                            ✅ Save Photo
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// Photo Gallery Component
interface PhotoGalleryProps {
    challengeId: string;
}

export function ChallengePhotoGallery({ challengeId }: PhotoGalleryProps) {
    const [comparisonMode, setComparisonMode] = useState(false);

    const getPhoto = (partnerId: 'A' | 'B', photoType: 'before' | 'after') => {
        const storageKey = `challenge_${challengeId}_partner${partnerId}_${photoType}`;
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    };

    const partnerABefore = getPhoto('A', 'before');
    const partnerAAfter = getPhoto('A', 'after');
    const partnerBBefore = getPhoto('B', 'before');
    const partnerBAfter = getPhoto('B', 'after');

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    📸 Challenge Photos
                </h2>
                <button
                    className="btn btn-outline"
                    onClick={() => setComparisonMode(!comparisonMode)}
                    style={{ fontSize: '0.9rem' }}
                >
                    {comparisonMode ? '👥 Show All' : '⚖️ Compare'}
                </button>
            </div>

            {comparisonMode ? (
                /* Side-by-Side Comparison */
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textAlign: 'center' }}>
                        Before & After Comparison
                    </h3>

                    {/* Partner A */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#6b7280' }}>
                            Partner A
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    Before
                                </div>
                                {partnerABefore ? (
                                    <img src={partnerABefore.photo} alt="Partner A Before" style={{ width: '100%', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No photo
                                    </div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    After
                                </div>
                                {partnerAAfter ? (
                                    <img src={partnerAAfter.photo} alt="Partner A After" style={{ width: '100%', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No photo
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Partner B */}
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#6b7280' }}>
                            Partner B
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    Before
                                </div>
                                {partnerBBefore ? (
                                    <img src={partnerBBefore.photo} alt="Partner B Before" style={{ width: '100%', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No photo
                                    </div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
                                    After
                                </div>
                                {partnerBAfter ? (
                                    <img src={partnerBAfter.photo} alt="Partner B After" style={{ width: '100%', borderRadius: '8px' }} />
                                ) : (
                                    <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                        No photo
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* All Photos Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {/* Partner A Before */}
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Partner A - Before
                        </div>
                        {partnerABefore ? (
                            <div>
                                <img src={partnerABefore.photo} alt="Partner A Before" style={{ width: '100%', borderRadius: '8px' }} />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    {new Date(partnerABefore.uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                No photo uploaded
                            </div>
                        )}
                    </div>

                    {/* Partner A After */}
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Partner A - After
                        </div>
                        {partnerAAfter ? (
                            <div>
                                <img src={partnerAAfter.photo} alt="Partner A After" style={{ width: '100%', borderRadius: '8px' }} />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    {new Date(partnerAAfter.uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                Upload after challenge ends
                            </div>
                        )}
                    </div>

                    {/* Partner B Before */}
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Partner B - Before
                        </div>
                        {partnerBBefore ? (
                            <div>
                                <img src={partnerBBefore.photo} alt="Partner B Before" style={{ width: '100%', borderRadius: '8px' }} />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    {new Date(partnerBBefore.uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                No photo uploaded
                            </div>
                        )}
                    </div>

                    {/* Partner B After */}
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Partner B - After
                        </div>
                        {partnerBAfter ? (
                            <div>
                                <img src={partnerBAfter.photo} alt="Partner B After" style={{ width: '100%', borderRadius: '8px' }} />
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    {new Date(partnerBAfter.uploadedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '3rem 1rem', textAlign: 'center', color: '#9ca3af' }}>
                                Upload after challenge ends
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
