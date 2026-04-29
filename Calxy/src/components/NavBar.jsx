import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/create-session", label: "Create" },
  { to: "/sessions-history", label: "History" },
  { to: "/user", label: "Profile" },
];

function NavBar() {
  return (
    <nav className="navbar" aria-label="Primary navigation">
      <NavLink to="/" className="brand" aria-label="Calxy home">
        <span className="brand-mark">C</span>
        <span>Calxy</span>
      </NavLink>

      <div className="nav-links">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default NavBar;
