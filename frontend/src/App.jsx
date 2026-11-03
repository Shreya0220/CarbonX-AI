import { useState } from "react";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Database,
  FileCheck2,
  FileText,
  Leaf,
  MapPin,
  Plus,
  Satellite,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

function App() {
  // -----------------------------
  // Navigation
  // -----------------------------
  const [activePage, setActivePage] = useState("Dashboard");

  // -----------------------------
  // Project Modal
  // -----------------------------
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [formData, setFormData] = useState({
    projectName: "",
    owner: "",
    claimedArea: "",
    carbonBenefit: "",
    restorationDate: "",
    latitude: "",
    longitude: "",
    geojson: "",
  });

  // -----------------------------
  // Demo Projects
  // -----------------------------
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Sundarbans Mangrove Restoration",
      owner: "Green Earth Foundation",
      area: 25,
      carbon: 2850,
      status: "Under Verification",
      risk: "MEDIUM",
    },
    {
      id: 2,
      name: "Coastal Blue Carbon Initiative",
      owner: "Ocean Conservation Group",
      area: 18.5,
      carbon: 2140,
      status: "Verified",
      risk: "LOW",
    },
    {
      id: 3,
      name: "Mangrove Recovery Project",
      owner: "Blue Planet Initiative",
      area: 32,
      carbon: 3675,
      status: "Needs Review",
      risk: "HIGH",
    },
  ]);

  // -----------------------------
  // Form Input
  // -----------------------------
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // -----------------------------
  // GeoJSON Upload
  // -----------------------------
  const handleGeoJSON = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".geojson")) {
      alert("Please upload a .geojson file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setFormData((previous) => ({
        ...previous,
        geojson: e.target?.result || "",
      }));
    };

    reader.readAsText(file);
  };

  // -----------------------------
  // Create Project
  // -----------------------------
  const handleCreateProject = (event) => {
    event.preventDefault();

    if (
      !formData.projectName ||
      !formData.owner ||
      !formData.claimedArea ||
      !formData.carbonBenefit
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const newProject = {
      id: Date.now(),
      name: formData.projectName,
      owner: formData.owner,
      area: Number(formData.claimedArea),
      carbon: Number(formData.carbonBenefit),
      status: "Under Verification",
      risk: "PENDING",
    };

    setProjects((previous) => [newProject, ...previous]);

    setFormData({
      projectName: "",
      owner: "",
      claimedArea: "",
      carbonBenefit: "",
      restorationDate: "",
      latitude: "",
      longitude: "",
      geojson: "",
    });

    setShowProjectForm(false);
    setActivePage("Projects");

    alert("Project created successfully.");
  };

  // -----------------------------
  // Button Actions
  // -----------------------------
  const handleRequestEvidence = () => {
    alert(
      "Additional evidence has been requested from the project owner."
    );
  };

  const handleApproveReview = () => {
    alert("Verification review approved successfully.");
  };

  const handleAnalyzeEvidence = () => {
    alert("Satellite / GIS evidence analysis started.");
  };

  const handleDetailedReport = () => {
    alert("Detailed risk report opened.");
  };

  const handleSendVerification = () => {
    alert("Project has been sent for human verification.");
  };

  // -----------------------------
  // Navigation Items
  // -----------------------------
  const navigationItems = [
    {
      name: "Dashboard",
      icon: Activity,
    },
    {
      name: "Projects",
      icon: Database,
    },
    {
      name: "Geo Evidence",
      icon: MapPin,
    },
    {
      name: "Verification",
      icon: ShieldCheck,
    },
    {
      name: "Risk Analysis",
      icon: AlertTriangle,
    },
  ];

  // -----------------------------
  // Dashboard
  // -----------------------------
  const renderDashboard = () => {
    const totalArea = projects.reduce(
      (sum, project) => sum + Number(project.area || 0),
      0
    );

    const totalCarbon = projects.reduce(
      (sum, project) => sum + Number(project.carbon || 0),
      0
    );

    return (
      <>
        <section className="page-header">
          <div>
            <div className="eyebrow">BLUE CARBON VERIFICATION</div>

            <h1>Verification Dashboard</h1>

            <p>
              AI-assisted integrity analysis for blue carbon restoration
              claims.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowProjectForm(true)}
          >
            <Plus size={18} />
            New Project
          </button>
        </section>

        {/* Statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Database size={24} />
            </div>

            <div className="stat-label">Total Projects</div>

            <div className="stat-value">{projects.length}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>

            <div className="stat-label">Area Under Review</div>

            <div className="stat-value">
              {totalArea.toFixed(1)}
              <span> ha</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Leaf size={24} />
            </div>

            <div className="stat-label">Reported Carbon Benefit</div>

            <div className="stat-value">
              {totalCarbon.toLocaleString()}
              <span> tCO₂e</span>
            </div>
          </div>
        </section>

        {/* Recent Projects */}
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>Recent Projects</h2>
              <p>Submitted blue carbon restoration claims</p>
            </div>

            <button
              className="secondary-button"
              onClick={() => setActivePage("Projects")}
            >
              View All
            </button>
          </div>

          <div className="projects-list">
            {projects.map((project) => (
              <div
                className="project-card"
                key={project.id}
                onClick={() => setActivePage("Projects")}
                style={{ cursor: "pointer" }}
              >
                <div className="project-icon">
                  <Leaf size={22} />
                </div>

                <div className="project-main">
                  <h3>{project.name}</h3>

                  <p>{project.owner}</p>

                  <div className="project-meta">
                    <span>
                      <MapPin size={15} />
                      {project.area} ha
                    </span>

                    <span>
                      <Leaf size={15} />
                      {project.carbon} tCO₂e
                    </span>
                  </div>
                </div>

                <div className="project-status">
                  <span>{project.status}</span>

                  <strong>{project.risk}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verification Pipeline */}
        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>AI Verification Engine</h2>
              <p>Current verification pipeline</p>
            </div>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-card">
              <span>01</span>
              <FileText size={25} />
              <h3>Claim Submitted</h3>
              <p>Project data received</p>
            </div>

            <div className="pipeline-card">
              <span>02</span>
              <Satellite size={25} />
              <h3>Evidence Analysis</h3>
              <p>Geospatial evidence processed</p>
            </div>

            <div className="pipeline-card">
              <span>03</span>
              <Brain size={25} />
              <h3>AI Risk Analysis</h3>
              <p>Checking claim consistency</p>
            </div>

            <div className="pipeline-card">
              <span>04</span>
              <UserCheck size={25} />
              <h3>Human Verification</h3>
              <p>Final verifier decision</p>
            </div>
          </div>
        </section>
      </>
    );
  };

  // -----------------------------
  // Projects
  // -----------------------------
  const renderProjects = () => {
    return (
      <>
        <section className="page-header">
          <div>
            <div className="eyebrow">PROJECT MANAGEMENT</div>

            <h1>Blue Carbon Projects</h1>

            <p>
              Review and manage submitted restoration claims.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setShowProjectForm(true)}
          >
            <Plus size={18} />
            New Project
          </button>
        </section>

        <section className="content-section">
          <div className="projects-list">
            {projects.map((project) => (
              <div className="project-card" key={project.id}>
                <div className="project-icon">
                  <Leaf size={22} />
                </div>

                <div className="project-main">
                  <h3>{project.name}</h3>

                  <p>{project.owner}</p>

                  <div className="project-meta">
                    <span>
                      <MapPin size={15} />
                      {project.area} ha
                    </span>

                    <span>
                      <Leaf size={15} />
                      {project.carbon} tCO₂e
                    </span>
                  </div>
                </div>

                <div className="project-status">
                  <span>{project.status}</span>

                  <strong>{project.risk}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  };

  // -----------------------------
  // Geo Evidence
  // -----------------------------
  const renderGeoEvidence = () => {
    return (
      <>
        <section className="page-header">
          <div>
            <div className="eyebrow">GEOSPATIAL ANALYSIS</div>

            <h1>Geo Evidence</h1>

            <p>
              Project boundary and satellite evidence analysis.
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="evidence-card">
            <div className="section-heading">
              <div>
                <h2>Satellite / GIS Evidence</h2>

                <p>
                  Evidence area associated with the selected project.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={handleAnalyzeEvidence}
              >
                <Satellite size={18} />
                Analyze Evidence
              </button>
            </div>

            <div className="map-placeholder">
              <MapPin size={30} />

              <span>Satellite / GIS evidence area</span>

              <small>
                Sentinel-2 / Landsat integration will be connected here.
              </small>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="analysis-grid">
            <div className="analysis-card">
              <MapPin size={24} />

              <span>Spatial Consistency</span>

              <strong>87%</strong>

              <p>
                Comparison between submitted boundary and available
                geospatial evidence.
              </p>
            </div>

            <div className="analysis-card">
              <FileCheck2 size={24} />

              <span>Evidence Coverage</span>

              <strong>92%</strong>

              <p>
                Evidence available for the current project assessment.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  };

  // -----------------------------
  // Verification
  // -----------------------------
  const renderVerification = () => {
    return (
      <>
        <section className="page-header">
          <div>
            <div className="eyebrow">HUMAN-IN-THE-LOOP</div>

            <h1>Verification Dashboard</h1>

            <p>
              AI findings support the verifier. Final decision remains
              with the authorized human verifier.
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="verification-grid">
            <div className="verification-card">
              <div className="verification-icon">
                <ShieldCheck size={25} />
              </div>

              <span>AI Verification Confidence</span>

              <strong>91%</strong>

              <p>
                Explainable assessment confidence based on available
                evidence.
              </p>
            </div>

            <div className="verification-card">
              <div className="verification-icon">
                <MapPin size={25} />
              </div>

              <span>Spatial Consistency</span>

              <strong>87%</strong>

              <p>
                Claimed project boundary compared with geospatial
                evidence.
              </p>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="decision-card">
            <div>
              <div className="eyebrow">HUMAN-IN-THE-LOOP</div>

              <h2>Final Verification Decision</h2>

              <p>
                AI findings support the verifier. The final project
                decision remains with the authorized human verifier.
              </p>
            </div>

            <div className="decision-actions">
              <button
                className="secondary-button"
                onClick={handleRequestEvidence}
              >
                <FileText size={18} />
                Request Evidence
              </button>

              <button
                className="primary-button"
                onClick={handleApproveReview}
              >
                <CheckCircle2 size={18} />
                Approve Review
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  // -----------------------------
  // Risk Analysis
  // -----------------------------
  const renderRiskAnalysis = () => {
    return (
      <>
        <section className="page-header">
          <div>
            <div className="eyebrow">AI-ASSISTED ANALYSIS</div>

            <h1>Risk Analysis</h1>

            <p>
              Identify inconsistencies and claims requiring additional
              review.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>

            <div className="stat-label">Geospatial Evidence</div>

            <div className="stat-value">87%</div>

            <p>Spatial consistency score</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <AlertTriangle size={24} />
            </div>

            <div className="stat-label">Anomaly Detection</div>

            <div className="stat-value">3</div>

            <p>Claims requiring attention</p>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ShieldCheck size={24} />
            </div>

            <div className="stat-label">AI Confidence</div>

            <div className="stat-value">91%</div>

            <p>Explainable assessment confidence</p>
          </div>
        </section>

        <section className="content-section">
          <div className="risk-card">
            <div className="section-heading">
              <div>
                <h2>Risk Assessment</h2>

                <p>Current project integrity indicator</p>
              </div>

              <span className="risk-badge">24 / 100</span>
            </div>

            <div className="risk-progress">
              <div
                className="risk-progress-fill"
                style={{ width: "24%" }}
              ></div>
            </div>

            <div className="risk-factors">
              <div>
                <AlertTriangle size={18} />

                <span>Claim consistency</span>

                <strong>Medium</strong>
              </div>

              <div>
                <MapPin size={18} />

                <span>Spatial overlap</span>

                <strong>87%</strong>
              </div>

              <div>
                <Brain size={18} />

                <span>Anomaly signals</span>

                <strong>3</strong>
              </div>
            </div>

            <div
              className="decision-actions"
              style={{ marginTop: "24px" }}
            >
              <button
                className="secondary-button"
                onClick={handleDetailedReport}
              >
                <FileText size={18} />
                View Detailed Report
              </button>

              <button
                className="primary-button"
                onClick={handleSendVerification}
              >
                <UserCheck size={18} />
                Send for Verification
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  // -----------------------------
  // Current Page
  // -----------------------------
  const renderPage = () => {
    switch (activePage) {
      case "Projects":
        return renderProjects();

      case "Geo Evidence":
        return renderGeoEvidence();

      case "Verification":
        return renderVerification();

      case "Risk Analysis":
        return renderRiskAnalysis();

      case "Dashboard":
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="app-shell">
      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Leaf size={30} />
          </div>

          <div>
            <h2>CarbonX</h2>

            <p>AI Integrity Platform</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                type="button"
                className={`nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={22} />

                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="system-status">
          <span className="status-dot"></span>

          <span>System Operational</span>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="main-content">{renderPage()}</main>

      {/* =========================
          NEW PROJECT MODAL
      ========================= */}
      {showProjectForm && (
        <div
          className="modal-backdrop"
          onClick={() => setShowProjectForm(false)}
        >
          <div
            className="project-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-eyebrow">
                  PROJECT REGISTRATION
                </div>

                <h2>Create New Project</h2>

                <p>
                  Submit blue carbon restoration claim details.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setShowProjectForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="project-form"
              onSubmit={handleCreateProject}
            >
              <div className="form-grid">
                <div className="form-field">
                  <label>Project Name *</label>

                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sundarbans Restoration"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Project Owner *</label>

                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    placeholder="Organization / Project Owner"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Claimed Restoration Area *</label>

                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="claimedArea"
                      value={formData.claimedArea}
                      onChange={handleInputChange}
                      placeholder="25"
                      min="0"
                      step="0.01"
                      required
                    />

                    <span>ha</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Claimed Carbon Benefit *</label>

                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="carbonBenefit"
                      value={formData.carbonBenefit}
                      onChange={handleInputChange}
                      placeholder="2850"
                      min="0"
                      step="0.01"
                      required
                    />

                    <span>tCO₂e</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Restoration Date</label>

                  <input
                    type="date"
                    name="restorationDate"
                    value={formData.restorationDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-field">
                  <label>Latitude</label>

                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 21.9497"
                    step="any"
                  />
                </div>

                <div className="form-field">
                  <label>Longitude</label>

                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g. 89.1833"
                    step="any"
                  />
                </div>

                <div className="form-field full">
                  <label>Project Boundary</label>

                  <label className="upload-box">
                    <FileText size={24} />

                    <span>
                      {formData.geojson
                        ? "GeoJSON uploaded successfully"
                        : "Upload project boundary GeoJSON"}
                    </span>

                    <small>
                      Supported format: .geojson
                    </small>

                    <input
                      type="file"
                      accept=".geojson,application/geo+json"
                      onChange={handleGeoJSON}
                      hidden
                    />
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <div className="form-note">
                  AI analysis will be performed after project submission.
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                  >
                    <Plus size={18} />
                    Create Project
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;