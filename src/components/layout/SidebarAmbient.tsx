import './SidebarAmbient.css';

export function SidebarAmbient() {
  return (
    <div className="sidebar-ambient" aria-hidden="true">
      <span className="sidebar-ambient__base" />
      <span className="sidebar-ambient__orb sidebar-ambient__orb--1" />
      <span className="sidebar-ambient__orb sidebar-ambient__orb--2" />
      <span className="sidebar-ambient__orb sidebar-ambient__orb--3" />
      <span className="sidebar-ambient__grid" />
      <span className="sidebar-ambient__shine" />
    </div>
  );
}
