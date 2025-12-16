import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleCardProps {
    title: string;
    children: ReactNode;
    defaultExpanded?: boolean;
    icon?: string;
    subtitle?: string;
}

export default function CollapsibleCard({
    title,
    children,
    defaultExpanded = true,
    icon,
    subtitle
}: CollapsibleCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="card">
            <div
                className="card-header"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {icon && <span>{icon}</span>}
                            {title}
                        </h3>
                        {subtitle && <p className="text-sm text-gray">{subtitle}</p>}
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>

            {isExpanded && (
                <div className="card-content">
                    {children}
                </div>
            )}
        </div>
    );
}
