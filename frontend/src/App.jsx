import { useState } from "react";

import {
  LayoutDashboard,
  FolderKanban,
  ShieldCheck,
  Map,
  Satellite,
  BrainCircuit,
  FileClock,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Leaf,
  Activity,
  X,
  Upload,
  CalendarDays,
  MapPinned,
} from "lucide-react";

import "./App.css";

function App() {
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [projects, setProjects] = useState([
    {
      id: "BC-MANGROVE-001",
      name: "Coastal Mangrove Restoration",
      location: "Gujarat, India",
      status: "Verified",
    },
    {
      id: "BC-MANGROVE-002",
      name: "Sundarbans Restoration Zone",
      location: "West Bengal, India",
      status: "Under Review",
    },
    {
      id: "BC-MANGROVE-003",
      name: "Coastal Blue Carbon Initiative",
      location: "Odisha, India",
      status: "Attention",
    },
  ]);

  const [formData, setFormData] = useState({
    projectName: "",
    owner: "",
    claimedArea: "",
    carbonBenefit: "",
    restorationDate: "",
    latitude: "",
    longitude: "",
    geojson: null,
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleGeoJSON = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormData((previous) => ({
      ...previous,
      geojson: file,
    }));
  };

  const handleCreateProject = (event) => {
    event.preventDefault();

    if (
      !formData.projectName ||
      !formData.owner ||
      !formData.claimedArea ||
      !formData.restorationDate
    ) {
      alert(
        "Please fill Project Name, Project Owner, Claimed Area and Restoration Date."
      );
      return;
    }

    const newProject = {
      id: `BC-MANGROVE-${String(projects.length + 1).padStart(3, "0")}`,
      name: formData.projectName,
      location:
        formData.latitude && formData.longitude
          ? `${formData.latitude}, ${formData.longitude}`
          : "Location pending",
      status: "Under Review",
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
      geojson: null,
    });

    setShowProjectForm(false);

    alert(
      "Project created successfully. It has been added to the verification queue."
    );
  };

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Leaf size={22} />
          </div>

          <div>
            <h2>CarbonX</h2>
            <span>AI Integrity Platform</span>
          </div>

        </div>

        <div className="menu-section">

          <p className="menu-title">
            WORKSPACE
          </p>

          <NavItem
            icon={<LayoutDashboard />}
            text="Dashboard"
            active
          />

          <NavItem
            icon={<FolderKanban />}
            text="Projects"
          />

          <NavItem
            icon={<ShieldCheck />}
            text="Verification"
          />

          <NavItem
            icon={<Map />}
            text="Geo Evidence"
          />

          <NavItem
            icon={<Satellite />}
            text="Satellite Data"
          />

          <NavItem
            icon={<BrainCircuit />}
            text="AI Analysis"
          />

        </div>

        <div className="menu-section">

          <p className="menu-title">
            SYSTEM
          </p>

          <NavItem
            icon={<FileClock />}
            text="Audit Trail"
          />

          <NavItem
            icon={<Settings />}
            text="Settings"
          />

        </div>

        <div className="sidebar-bottom">

          <div className="secure-box">

            <div className="secure-icon">
              <ShieldCheck size={18} />
            </div>

            <div>
              <strong>
                Integrity Layer
              </strong>

              <span>
                System protected
              </span>
            </div>

            <div className="online-dot"></div>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search projects, claims, verification..."
            />

          </div>

          <div className="top-actions">

            <button className="icon-button">
              <Bell size={19} />
              <span className="notification-dot"></span>
            </button>

            <div className="profile">

              <div className="avatar">
                SP
              </div>

              <div>
                <strong>
                  Shreya Prajapati
                </strong>

                <span>
                  Project Lead
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <section className="content">

          <div className="page-heading">

            <div>

              <div className="eyebrow">

                <Activity size={15} />

                LIVE INTEGRITY MONITOR

              </div>

              <h1>
                CarbonX Command Center
              </h1>

              <p>
                AI-assisted verification of blue carbon restoration
                claims using geospatial and satellite evidence.
              </p>

            </div>

            {/* NEW PROJECT */}

            <button
              className="primary-button"
              onClick={() => setShowProjectForm(true)}
            >

              <Plus size={18} />

              New Project

            </button>

          </div>

          {/* ================= STAT CARDS ================= */}

          <div className="stats-grid">

            <StatCard
              icon={<FolderKanban />}
              label="Total Projects"
              value={projects.length}
              change="+12.5%"
              type="green"
            />

            <StatCard
              icon={<ShieldCheck />}
              label="Verified Claims"
              value="18"
              change="+8.2%"
              type="blue"
            />

            <StatCard
              icon={<AlertTriangle />}
              label="Needs Review"
              value="06"
              change="3 urgent"
              type="orange"
            />

            <StatCard
              icon={<Activity />}
              label="Integrity Score"
              value="87.4"
              change="+4.8%"
              type="purple"
            />

          </div>

          {/* ================= MAIN GRID ================= */}

          <div className="dashboard-grid">

            {/* MAP */}

            <div className="card map-card">

              <div className="card-header">

                <div>

                  <div className="card-label">
                    GEOSPATIAL EVIDENCE
                  </div>

                  <h3>
                    Project Monitoring Map
                  </h3>

                </div>

                <button className="ghost-button">

                  View Map

                  <ArrowUpRight size={15} />

                </button>

              </div>

              <div className="map-area">

                <div className="map-grid"></div>

                <div className="map-shape shape-one"></div>

                <div className="map-shape shape-two"></div>

                <div className="map-pin pin-one">
                  <MapPin size={17} />
                </div>

                <div className="map-pin pin-two">
                  <MapPin size={17} />
                </div>

                <div className="map-overlay">

                  <span className="live-indicator"></span>

                  Sentinel-2 Evidence Layer

                </div>

              </div>

            </div>

            {/* AI RISK */}

            <div className="card risk-card">

              <div className="card-header">

                <div>

                  <div className="card-label">
                    AI ANALYSIS
                  </div>

                  <h3>
                    Integrity Assessment
                  </h3>

                </div>

                <BrainCircuit
                  size={22}
                  className="header-icon"
                />

              </div>

              <div className="risk-score">

                <div className="score-ring">

                  <div>

                    <strong>
                      87
                    </strong>

                    <span>
                      /100
                    </span>

                  </div>

                </div>

                <div className="score-info">

                  <span className="low-risk">
                    LOW RISK
                  </span>

                  <h4>
                    Assessment Stable
                  </h4>

                  <p>
                    Evidence consistency is within the expected range.
                  </p>

                </div>

              </div>

              <div className="risk-factors">

                <Factor
                  name="Evidence Completeness"
                  value="82%"
                  progress="82%"
                />

                <Factor
                  name="Historical Consistency"
                  value="91%"
                  progress="91%"
                />

                <Factor
                  name="Spatial Consistency"
                  value="88%"
                  progress="88%"
                />

              </div>

            </div>

          </div>

          {/* ================= PROJECTS ================= */}

          <div className="bottom-grid">

            <div className="card projects-card">

              <div className="card-header">

                <div>

                  <div className="card-label">
                    PROJECT PORTFOLIO
                  </div>

                  <h3>
                    Recent Verification Activity
                  </h3>

                </div>

                <button className="text-button">
                  View all
                </button>

              </div>

              {projects.map((project) => (

                <ProjectRow
                  key={project.id}
                  id={project.id}
                  name={project.name}
                  location={project.location}
                  status={project.status}
                  icon={
                    project.status === "Verified"
                      ? <CheckCircle2 />
                      : project.status === "Attention"
                        ? <AlertTriangle />
                        : <Clock3 />
                  }
                />

              ))}

            </div>

            {/* SUMMARY */}

            <div className="card summary-card">

              <div className="card-label">
                VERIFICATION SUMMARY
              </div>

              <h3>
                Current Evidence Health
              </h3>

              <div className="health-bar">

                <div className="health-fill"></div>

              </div>

              <div className="health-values">

                <strong>
                  78.4
                </strong>

                <span>
                  Overall assessment
                </span>

              </div>

              <div className="summary-items">

                <div>

                  <span>
                    Satellite evidence
                  </span>

                  <strong>
                    92%
                  </strong>

                </div>

                <div>

                  <span>
                    Spatial consistency
                  </span>

                  <strong>
                    88%
                  </strong>

                </div>

                <div>

                  <span>
                    Claim consistency
                  </span>

                  <strong>
                    76%
                  </strong>

                </div>

              </div>

            </div>

          </div>

          <footer>

            <span>
              CarbonX AI v1.0
            </span>

            <span>
              AI-assisted verification • Human-in-the-loop
            </span>

            <span>
              ● Systems operational
            </span>

          </footer>

        </section>

      </main>

      {/* ================================================= */}
      {/* NEW PROJECT MODAL */}
      {/* ================================================= */}

      {showProjectForm && (

        <div
          className="modal-backdrop"
          onClick={() => setShowProjectForm(false)}
        >

          <div
            className="project-modal"
            onClick={(event) => event.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <div className="modal-eyebrow">
                  PROJECT REGISTRATION
                </div>

                <h2>
                  Create Blue Carbon Project
                </h2>

                <p>
                  Submit project information for CarbonX integrity analysis.
                </p>

              </div>

              <button
                className="modal-close"
                onClick={() => setShowProjectForm(false)}
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              className="project-form"
              onSubmit={handleCreateProject}
            >

              <div className="form-grid">

                {/* PROJECT NAME */}

                <div className="form-field full">

                  <label>
                    Project Name
                  </label>

                  <div className="input-wrapper">

                    <FolderKanban size={16} />

                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      placeholder="e.g. Coastal Mangrove Restoration"
                    />

                  </div>

                </div>

                {/* OWNER */}

                <div className="form-field">

                  <label>
                    Project Owner
                  </label>

                  <input
                    type="text"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    placeholder="Organization / Owner"
                  />

                </div>

                {/* AREA */}

                <div className="form-field">

                  <label>
                    Claimed Restoration Area
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="claimedArea"
                      value={formData.claimedArea}
                      onChange={handleInputChange}
                      placeholder="25.0"
                    />

                    <span>
                      ha
                    </span>

                  </div>

                </div>

                {/* CARBON BENEFIT */}

                <div className="form-field">

                  <label>
                    Claimed Carbon Benefit
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="carbonBenefit"
                      value={formData.carbonBenefit}
                      onChange={handleInputChange}
                      placeholder="2850"
                    />

                    <span>
                      tCO₂e
                    </span>

                  </div>

                </div>

                {/* DATE */}

                <div className="form-field">

                  <label>
                    Restoration Date
                  </label>

                  <div className="input-wrapper">

                    <CalendarDays size={16} />

                    <input
                      type="date"
                      name="restorationDate"
                      value={formData.restorationDate}
                      onChange={handleInputChange}
                    />

                  </div>

                </div>

                {/* LATITUDE */}

                <div className="form-field">

                  <label>
                    Latitude
                  </label>

                  <div className="input-wrapper">

                    <MapPinned size={16} />

                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="21.1702"
                    />

                  </div>

                </div>

                {/* LONGITUDE */}

                <div className="form-field">

                  <label>
                    Longitude
                  </label>

                  <div className="input-wrapper">

                    <MapPinned size={16} />

                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="72.8311"
                    />

                  </div>

                </div>

                {/* GEOJSON */}

                <div className="form-field full">

                  <label>
                    Project Boundary
                  </label>

                  <label className="upload-box">

                    <input
                      type="file"
                      accept=".geojson,.json,application/geo+json,application/json"
                      onChange={handleGeoJSON}
                    />

                    <Upload size={22} />

                    <strong>
                      {formData.geojson
                        ? formData.geojson.name
                        : "Upload GeoJSON Boundary"}
                    </strong>

                    <span>
                      GeoJSON / JSON file • Project polygon
                    </span>

                  </label>

                </div>

              </div>

              {/* FORM FOOTER */}

              <div className="modal-footer">

                <div className="form-note">

                  <ShieldCheck size={16} />

                  <span>
                    Submitted projects enter human verification review.
                  </span>

                </div>

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowProjectForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="create-button"
                  >
                    <Plus size={17} />
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


/* ================================================= */
/* COMPONENTS */
/* ================================================= */

function NavItem({
  icon,
  text,
  active,
}) {

  return (

    <div
      className={`nav-item ${
        active ? "active" : ""
      }`}
    >

      {icon}

      <span>
        {text}
      </span>

    </div>

  );

}


function StatCard({
  icon,
  label,
  value,
  change,
  type,
}) {

  return (

    <div className="stat-card">

      <div
        className={`stat-icon ${type}`}
      >
        {icon}
      </div>

      <div className="stat-content">

        <span>
          {label}
        </span>

        <div className="stat-value">

          <strong>
            {value}
          </strong>

          <small>
            {change}
          </small>

        </div>

      </div>

    </div>

  );

}


function Factor({
  name,
  value,
  progress,
}) {

  return (

    <div className="factor">

      <div className="factor-heading">

        <span>
          {name}
        </span>

        <strong>
          {value}
        </strong>

      </div>

      <div className="factor-bar">

        <div
          style={{
            width: progress,
          }}
        ></div>

      </div>

    </div>

  );

}


function ProjectRow({
  id,
  name,
  location,
  status,
  icon,
}) {

  return (

    <div className="project-row">

      <div className="project-icon">
        {icon}
      </div>

      <div className="project-info">

        <strong>
          {name}
        </strong>

        <span>
          {id} • {location}
        </span>

      </div>

      <span
        className={`status ${
          status === "Verified"
            ? "verified"
            : status === "Attention"
              ? "attention"
              : "review"
        }`}
      >

        {status}

      </span>

    </div>

  );

}

export default App;