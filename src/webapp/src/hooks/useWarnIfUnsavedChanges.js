import { useEffect, useContext } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

const useWarnIfUnsavedChanges = (isUnsaved, message = 'Apakah Anda yakin ingin meninggalkan halaman ini? Perubahan Anda tidak akan tersimpan.') => {
    const { navigator } = useContext(NavigationContext);

    // 1. Intercept react-router navigation (Links, navigate())
    useEffect(() => {
        if (!isUnsaved) return;

        const originalPush = navigator.push;
        const originalReplace = navigator.replace;

        const handleNavigation = (fn, ...args) => {
            if (window.confirm(message)) {
                fn(...args);
            }
        };

        navigator.push = (...args) => handleNavigation(originalPush, ...args);
        navigator.replace = (...args) => handleNavigation(originalReplace, ...args);

        return () => {
            navigator.push = originalPush;
            navigator.replace = originalReplace;
        };
    }, [isUnsaved, message, navigator]);

    // 2. Intercept page refresh / tab close
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUnsaved) {
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isUnsaved, message]);
};

export default useWarnIfUnsavedChanges;
