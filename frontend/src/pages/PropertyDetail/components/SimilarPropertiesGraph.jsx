import { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SimilarPropertiesGraph({ propertyId }) {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
    const containerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setLoading(true);
                // Call Django ML service directly
                const response = await axios.get(`http://127.0.0.1:8000/api/recommendations/${propertyId}/`);
                setGraphData(response.data);
            } catch (err) {
                console.error("Failed to fetch recommendation graph:", err);
                setError("Failed to load similar properties. Is the ML service running?");
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) {
            fetchGraphData();
        }
    }, [propertyId]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: 400
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const handleNodeClick = (node) => {
        if (node.id !== propertyId) {
            navigate(`/property/${node.id}`);
            window.scrollTo(0, 0);
        }
    };

    if (loading) return <div className="text-center py-4 text-gray-500">Loading similarity graph...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
    if (!graphData.nodes || graphData.nodes.length <= 1) return <div className="text-center py-4 text-gray-500">No similar properties found.</div>;

    return (
        <div ref={containerRef} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm mt-4">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Recommendation Graph</h3>
                <p className="text-xs text-gray-500">Nodes closer to the center are more similar to this property based on locality, price, and specs.</p>
            </div>
            <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={graphData}
                nodeLabel={(node) => `${node.title} - ₹${node.price ? (node.price / 100000).toFixed(2) + 'L' : 'N/A'}`}
                nodeColor={(node) => node.isSource ? '#3b82f6' : '#10b981'}
                nodeRelSize={6}
                linkColor={() => '#cbd5e1'}
                linkWidth={(link) => link.weight ? link.weight / 2 : 1}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={d => d.weight * 0.001}
                onNodeClick={handleNodeClick}
                d3VelocityDecay={0.3}
            />
        </div>
    );
}
