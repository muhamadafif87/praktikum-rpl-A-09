/**
 * useViewTransitionNavigate
 *
 * Wraps React Router's useNavigate with the native View Transitions API.
 * Sets a --nav-direction CSS custom property on :root (1 for forward,
 * -1 for backward) so that view-transition pseudo-element keyframes
 * can resolve the correct slide direction via var().
 *
 * The pseudo-element tree (::view-transition-*) inherits custom properties
 * from :root, so this approach avoids the broken descendant-selector pattern
 * (html.class ::view-transition-new) that fails because the pseudo-elements
 * exist on a top-layer overlay, not as DOM children of <html>.
 */
import { useNavigate, useLocation } from 'react-router-dom';

// Spatial order of navbar tabs — used to determine slide direction
const routeOrder = {
    '/': 0,
    '/gas-galon': 1,
    '/laundry': 2,
    '/daily-cleaning': 3,
};

export const useViewTransitionNavigate = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (to, options) => {
        if (!document.startViewTransition) {
            navigate(to, options);
            return;
        }

        // Determine spatial direction
        const currentIdx = routeOrder[location.pathname] ?? -1;
        const targetPath = typeof to === 'string' ? to : to.pathname;
        const targetIdx = routeOrder[targetPath] ?? -1;

        // 1 = forward (slide right-to-left), -1 = backward (slide left-to-right)
        const direction = targetIdx > currentIdx ? 1 : -1;

        // Inject direction as a CSS custom property on :root
        // This propagates into the ::view-transition pseudo-element tree via inheritance
        document.documentElement.style.setProperty('--nav-direction', String(direction));

        const transition = document.startViewTransition(() => {
            navigate(to, options);
        });

        // Clean up the custom property once the animation is completely done
        transition.finished.finally(() => {
            document.documentElement.style.removeProperty('--nav-direction');
        });
    };
};
