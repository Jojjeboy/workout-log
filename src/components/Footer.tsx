import { AppShell, Group, Text, UnstyledButton, useMantineTheme, ThemeIcon, Stack } from '@mantine/core';
import { IconHome, IconPlus, IconSettings } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Footer component with bottom navigation
 * Features:
 * - 3 navigation items (Home, Exercises, Settings)
 * - Active state highlighting for current page
 */
export function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();

    // Check if the current route matches the given path
    const isActive = (path: string) => {
        if (path === '/settings') {
            return location.pathname === '/settings' ||
                location.pathname === '/changelog' ||
                location.pathname === '/notes';
        }
        if (path === '/exercises') {
            return location.pathname === '/exercises' || location.pathname.startsWith('/exercise/');
        }
        return location.pathname === path;
    };

    // Shared button container style to avoid repetition
    const buttonContainerStyle: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 0',
    };

    /**
     * Standard navigation item with icon and label
     * Used for Home, Analysis, Exercises, and Settings
     */
    const NavItem = ({ path, icon: Icon, label, color, large }: { path: string; icon: any; label: string, color: string, large?: boolean }) => {
        const active = isActive(path);


        // Base sizes
        const baseIconSize = 26;
        const baseThemeIconSize = 48;

        // Scale factor for large icons (approx 25% bigger)
        const scale = large ? 1.25 : 1;

        const iconSize = baseIconSize * scale;
        const themeIconSize = baseThemeIconSize * scale;

        return (
            <UnstyledButton onClick={() => navigate(path)} style={buttonContainerStyle}>
                <Stack gap={2} align="center">
                    {/* Icon container with highlight when active */}
                    <ThemeIcon
                        size={themeIconSize}
                        radius="xl"
                        variant={active ? 'light' : 'transparent'}
                        color={color}
                        style={!active ? { backgroundColor: 'transparent' } : {}}
                    >
                        <Icon
                            size={iconSize}
                            stroke={1.5}
                            color={!active ? theme.colors.gray[5] : undefined}
                        />
                    </ThemeIcon>

                    {/* Label text with color based on active state and theme */}
                    <Text
                        size="xs"
                        fw={500}
                        c={active ? color : 'dimmed'}
                        style={{ fontSize: '11px' }}
                    >
                        {label}
                    </Text>
                </Stack>
            </UnstyledButton>
        );
    };

    return (
        <AppShell.Footer
            p={0}
            pb="xs"
            style={{ zIndex: 101, borderTop: 'none', boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' }}
        >
            {/* Background color changes based on dark mode */}
            <Group h="100%" gap={0} bg="white" align="center">
                <NavItem path="/" icon={IconHome} label="Dashboard" color="blue" />
                <NavItem path="/exercises" icon={IconPlus} label="Add" color="cyan" large />
                <NavItem path="/settings" icon={IconSettings} label="Settings" color="orange" />
            </Group>
        </AppShell.Footer>
    );
}
