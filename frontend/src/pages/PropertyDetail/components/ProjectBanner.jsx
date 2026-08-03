import { Link } from 'react-router-dom';

export default function ProjectBanner({ project, builder }) {
    if (!project || !builder) return null;

    return (
        <div className="project-banner">
            <div className="pb-info">
                <p>Part of Builder Project</p>
                <h3>{project.projectName}</h3>
                <p style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <span>By: {builder.companyName}</span>
                    <span>Status: {project.status}</span>
                </p>
            </div>
            <Link to="#" className="pb-action">
                View Project
            </Link>
        </div>
    );
}
