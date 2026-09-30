import { NavLink, Outlet } from "react-router";

const NAV = [
  { to: "/districts", label: "Districts" },
  { to: "/schools", label: "Schools" },
  { to: "/students", label: "Students" },
  { to: "/teachers", label: "Teachers" },
];

export function Layout() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            Edu Directory
          </NavLink>
          <nav aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
