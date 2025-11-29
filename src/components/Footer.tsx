import { AppShell, Group, Text, UnstyledButton, useMantineTheme, ThemeIcon, Stack, useComputedColorScheme, Avatar } from '@mantine/core';
import { IconHome, IconChartBar, IconPlus, IconSettings, IconUser } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Footer component with bottom navigation
 * Features:
 * - 5 navigation items (Home, Analysis, Exercises, Settings, Profile)
 * - Dark mode support with automatic color scheme detection
 * - Profile picture integration from Google account
 * - Active state highlighting for current page
 */
export function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme('light');
    const { user } = useAuth();

    // Check if the current route matches the given path
    const isActive = (path: string) => location.pathname === path;

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
    const NavItem = ({ path, icon: Icon, label, color }: { path: string; icon: any; label: string, color: string }) => {
        const active = isActive(path);
        const isDark = colorScheme === 'dark';

        return (
            <UnstyledButton onClick={() => navigate(path)} style={buttonContainerStyle}>
                <Stack gap={2} align="center">
                    {/* Icon container with highlight when active */}
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant={active ? 'light' : 'transparent'}
                        color={color}
                        style={!active ? { backgroundColor: 'transparent' } : {}}
                    >
                        <Icon
                            size={26}
                            stroke={1.5}
                            color={!active ? theme.colors.gray[5] : undefined}
                        />
                    </ThemeIcon>

                    {/* Label text with color based on active state and theme */}
                    <Text
                        size="xs"
                        fw={500}
                        c={active ? color : (isDark ? 'gray.4' : 'dimmed')}
                        style={{ fontSize: '11px' }}
                    >
                        {label}
                    </Text>
                </Stack>
            </UnstyledButton>
        );
    };

    /**
     * Special navigation item for Profile
     * Shows user's Google profile picture instead of a static icon
     * Falls back to IconUser if no profile picture is available
     */
    const ProfileNavItem = ({ path, label, color }: { path: string; label: string, color: string }) => {
        const active = isActive(path);
        const isDark = colorScheme === 'dark';

        return (
            <UnstyledButton onClick={() => navigate(path)} style={buttonContainerStyle}>
                <Stack gap={2} align="center">
                    {/* Container for avatar with highlight when active */}
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        padding: '4px',
                        backgroundColor: active ? `var(--mantine-color-${color}-light)` : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {/* Avatar component displays user's Google profile picture */}
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName || 'User'}
                            size={40}
                            radius="xl"
                        >
                            {/* Fallback icon if no profile picture exists */}
                            <IconUser size={22} stroke={1.5} />
                        </Avatar>
                    </div>

                    <Text
                        size="xs"
                        fw={500}
                        c={active ? color : (isDark ? 'gray.4' : 'dimmed')}
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
            style={{ zIndex: 101, borderTop: 'none', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
        >
            {/* Background color changes based on dark mode */}
            <Group h="100%" gap={0} bg={colorScheme === 'dark' ? 'dark.7' : 'white'} align="center">
                <NavItem path="/" icon={IconHome} label="Dashboard" color="blue" />
                <NavItem path="/analysis" icon={IconChartBar} label="Analysis" color="violet" />
                <NavItem path="/exercises" icon={IconPlus} label="Add" color="cyan" />
                <NavItem path="/settings" icon={IconSettings} label="Settings" color="orange" />
                <ProfileNavItem path="/profile" label="Profile" color="pink" />
            </Group>
        </AppShell.Footer>
    );
}
