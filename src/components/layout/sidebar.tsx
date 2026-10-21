import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Truck, 
  Users, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  Activity, 
  Building2, 
  CreditCard, 
  FileSpreadsheet, 
  Radio,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '../../features/auth/auth-context';
import { ROUTES } from '../../constants/routes';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { currentRole, logout, currentUser } = useAuth();

  // Navigation items grouped by role context
  const getNavSections = () => {
    if (currentRole === 'admin') {
      return [
        {
          title: 'Platform Administration',
          items: [
            { label: 'Admin Overview', path: ROUTES.ADMIN.OVERVIEW, icon: LayoutDashboard },
            { label: 'Customers', path: ROUTES.ADMIN.CUSTOMERS, icon: Users },
            { label: 'Organizations', path: ROUTES.ADMIN.COMPANIES, icon: Building2 },
            { label: 'Sales & Plans', path: ROUTES.ADMIN.SALES, icon: CreditCard },
            { label: 'Invoices', path: ROUTES.ADMIN.INVOICES, icon: FileSpreadsheet },
          ],
        },
        {
          title: 'Fleet Portals',
          items: [
            { label: 'Fleet Owner View', path: ROUTES.OWNER.OVERVIEW, icon: Truck },
            { label: 'AI Hardware Lab', path: ROUTES.LAB.DEVICES, icon: Cpu },
            { label: 'Driver Live Monitor', path: ROUTES.DRIVER.MONITOR, icon: Radio },
          ],
        },
      ];
    }

    if (currentRole === 'tester') {
      return [
        {
          title: 'Hardware & AI Diagnostics',
          items: [
            { label: 'Device Inventory', path: ROUTES.LAB.DEVICES, icon: Cpu },
            { label: 'Detection Timeline', path: ROUTES.LAB.EVENTS, icon: Activity },
          ],
        },
        {
          title: 'Fleet Context',
          items: [
            { label: 'Fleet Incidents', path: ROUTES.OWNER.INCIDENTS, icon: AlertTriangle },
            { label: 'Driver HUD', path: ROUTES.DRIVER.MONITOR, icon: Radio },
          ],
        },
      ];
    }

    if (currentRole === 'driver') {
      return [
        {
          title: 'In-Cab Operations',
          items: [
            { label: 'Driver Safety HUD', path: ROUTES.DRIVER.MONITOR, icon: Radio },
            { label: 'Shift Summary', path: ROUTES.DRIVER.SESSION, icon: Activity },
          ],
        },
      ];
    }

    // Default Fleet Owner / Manager / Safety Reviewer
    return [
      {
        title: 'Fleet Safety & Ops',
        items: [
          { label: 'Fleet Overview', path: ROUTES.OWNER.OVERVIEW, icon: LayoutDashboard },
          { label: 'Vehicles', path: ROUTES.OWNER.VEHICLES, icon: Truck },
          { label: 'Drivers', path: ROUTES.OWNER.DRIVERS, icon: Users },
          { label: 'Safety Incidents', path: ROUTES.OWNER.INCIDENTS, icon: AlertTriangle },
          { label: 'Compliance Reports', path: ROUTES.OWNER.REPORTS, icon: FileText },
        ],
      },
      {
        title: 'Hardware & Testing',
        items: [
          { label: 'AI Testing Lab', path: ROUTES.LAB.DEVICES, icon: Cpu },
          { label: 'Driver HUD Monitor', path: ROUTES.DRIVER.MONITOR, icon: Radio },
        ],
      },
    ];
  };

  const sections = getNavSections();

  return (
    <aside
      className={clsx(
        'bg-navy-900 text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-200 select-none z-30 flex-shrink-0',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded bg-brand-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-white tracking-tight leading-none">
                SafeDrive AI
              </span>
              <span className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                Fleet Safety System
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 overflow-y-auto space-y-5 px-2">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                {section.title}
              </p>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-brand-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800'
                    )
                  }
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-navy-950/40">
        {!isCollapsed && (
          <div className="mb-2 px-1 text-[11px] text-slate-400 truncate">
            <span className="text-slate-500">Org:</span> {currentUser?.organizationName || 'Bharat Logistics'}
          </div>
        )}
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors',
            isCollapsed && 'justify-center px-1'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
