function BuilderDashboard() {
    const builder = JSON.parse(localStorage.getItem("user"));

    return (
        <div style={{ padding: "40px" }}>
            <h1>Builder Dashboard</h1>

            <hr />

            <h3>Welcome</h3>

            <p><strong>Company:</strong> {builder.companyName}</p>
            <p><strong>Owner:</strong> {builder.ownerName}</p>
            <p><strong>Email:</strong> {builder.email}</p>
            <p><strong>Registration No:</strong> {builder.registrationNumber}</p>
        </div>
    );
}

export default BuilderDashboard;