import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors mr-2"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <h1 className="text-xl font-display font-bold text-primary">FarmLog Pro</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></div>
              <span>Online</span>
            </div>
            <div className="text-xs text-gray-500">
              Last sync: Just now
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-surface border-r border-gray-200 z-40">
          <nav className="flex-1 p-6 overflow-y-auto">
            <ul className="space-y-2">
              {routeArray.map((route) => (
                <li key={route.id}>
                  <NavLink
                    to={route.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-white shadow-md'
                          : 'text-gray-700 hover:bg-white hover:shadow-sm'
                      }`
                    }
                  >
                    <ApperIcon name={route.icon} size={20} className="mr-3" />
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={toggleMobileMenu}
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-70 bg-surface border-r border-gray-200 z-50"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-display font-bold text-primary">Menu</h2>
                    <button
                      onClick={toggleMobileMenu}
                      className="p-2 rounded-md hover:bg-white transition-colors"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                  
                  <nav>
                    <ul className="space-y-2">
                      {routeArray.map((route) => (
                        <li key={route.id}>
                          <NavLink
                            to={route.path}
                            onClick={toggleMobileMenu}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-primary text-white shadow-md'
                                  : 'text-gray-700 hover:bg-white hover:shadow-sm'
                              }`
                            }
                          >
                            <ApperIcon name={route.icon} size={20} className="mr-3" />
                            {route.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;