import { AppShell, Group, Text, UnstyledButton, useMantineTheme, ThemeIcon, Stack, useComputedColorScheme, Avatar } from '@mantine/core';
import { IconHome, IconChartBar, IconPlus, IconSettings, IconUser } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();
    const colorScheme = useComputedColorScheme('light');
    const { user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const NavItem = ({ path, icon: Icon, label, color }: { path: string; icon: any; label: string, color: string }) => {
        const active = isActive(path);
        const variant = active ? 'light' : 'transparent';
        const isDark = colorScheme === 'dark';

        return (
            <UnstyledButton
                onClick={() => navigate(path)}
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 0',
                }}
            >
                <Stack gap={2} align="center">
                    <ThemeIcon
                        size={48}
                        radius="xl"
                        variant={variant}
                        color={color}
                        style={!active ? { backgroundColor: 'transparent' } : {}}
                    >
                        <Icon size={26} stroke={1.5} color={!active ? (isDark ? theme.colors.gray[5] : theme.colors.gray[5]) : undefined} />
                    </ThemeIcon>
                    <Text size="xs" fw={500} c={active ? color : (isDark ? 'gray.4' : 'dimmed')} style={{ fontSize: '11px' }}>
                        {label}
                    </Text>
                </Stack>
            </UnstyledButton>
        );
    };

    const ProfileNavItem = ({ path, label, color }: { path: string; label: string, color: string }) => {
        const active = isActive(path);
        const isDark = colorScheme === 'dark';

        return (
            <UnstyledButton
                onClick={() => navigate(path)}
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 0',
                }}
            >
                <Stack gap={2} align="center">
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        padding: active ? '4px' : '4px',
                        backgroundColor: active ? `var(--mantine-color-${color}-light)` : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName || 'User'}
                            size={40}
                            radius="xl"
                        >
                            <IconUser size={22} stroke={1.5} />
                        </Avatar>
                    </div>
                    <Text size="xs" fw={500} c={active ? color : (isDark ? 'gray.4' : 'dimmed')} style={{ fontSize: '11px' }}>
                        {label}
                    </Text>
                </Stack>
            </UnstyledButton>
        );
    };

    return (
        <AppShell.Footer p={0} pb="xs" style={{ zIndex: 101, borderTop: 'none', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}>
            <Group h="100%" gap={0} bg={colorScheme === 'dark' ? 'dark.7' : 'white'} align="center">
                <NavItem path="/" icon={IconHome} label="Home" color="blue" />
                <NavItem path="/analysis" icon={IconChartBar} label="Analysis" color="violet" />
                <NavItem path="/exercises" icon={IconPlus} label="Add" color="cyan" />
                <NavItem path="/settings" icon={IconSettings} label="Settings" color="orange" />
                <ProfileNavItem path="/profile" label="Profile" color="pink" />
            </Group>
        </AppShell.Footer>
    );
}
