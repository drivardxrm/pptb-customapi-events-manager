import React from 'react';
import { Switch, Tooltip } from '@fluentui/react-components';
import { WeatherSunny24Regular, WeatherMoon24Regular } from '@fluentui/react-icons';
import { useAppStore } from '../store/useAppStore';
import { useStyles } from '../styles/Styles';
import { mergeClasses } from '@fluentui/react-components';

interface ThemeSwitcherProps {
    isCollapsed?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ isCollapsed = false }) => {
    const styles = useStyles();
    const { theme, toggleTheme } = useAppStore();
    const isDark = theme === 'dark';

    const switchElement = (
        <Switch
            checked={isDark}
            onChange={toggleTheme}
            label={!isCollapsed ? (isDark ? 'Dark Mode' : 'Light Mode') : undefined}
            labelPosition="after"
        />
    );

    return (
        <div className={mergeClasses(styles.themeSwitcher, isCollapsed && styles.themeSwitcherCollapsed)}>
            {isDark ? (
                <WeatherMoon24Regular />
            ) : (
                <WeatherSunny24Regular />
            )}
            {isCollapsed ? (
                <Tooltip content={isDark ? 'Dark Mode' : 'Light Mode'} relationship="label">
                    {switchElement}
                </Tooltip>
            ) : (
                switchElement
            )}
        </div>
    );
};
