import React from 'react';
import { useLocation } from 'react-router-dom';
import { useViewTransitionNavigate } from '../../hooks/useViewTransitionNavigate';

/**
 * TransitionLink
 *
 * A replacement for React Router's <Link> component that leverages
 * the native View Transitions API for seamless page-to-page morphing.
 *
 * It prevents the default anchor behavior and uses the custom
 * useViewTransitionNavigate hook.
 *
 * If the user clicks the link for the page they are already on,
 * the navigation and animation are skipped entirely.
 */
const TransitionLink = ({ to, children, onClick, ...rest }) => {
    const transitionNavigate = useViewTransitionNavigate();
    const location = useLocation();

    const handleClick = (e) => {
        e.preventDefault();

        // Skip navigation if already on the target page
        if (location.pathname === to) {
            return;
        }

        // Execute any custom onClick logic passed in (e.g., sessionStorage sync for sliding indicator)
        if (onClick) {
            onClick(e);
        }

        transitionNavigate(to);
    };

    return (
        <a href={to} onClick={handleClick} {...rest}>
            {children}
        </a>
    );
};

export default TransitionLink;
