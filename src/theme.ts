import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'violet',
    fontFamily: 'Poppins, Inter, sans-serif',
    defaultRadius: 'lg',
    headings: {
        fontFamily: 'Poppins, Inter, sans-serif',
        fontWeight: '700',
    },
    colors: {
        violet: [
            "#f3f0ff",
            "#eae6ff",
            "#d9d0ff",
            "#c8b4ff",
            "#b99dff",
            "#b087ff",
            "#ad76f7",
            "#9962e7",
            "#8757d6",
            "#764ba2",
        ] as any,
    },
    shadows: {
        md: '0 4px 20px rgba(0, 0, 0, 0.05)',
        lg: '0 10px 30px rgba(0, 0, 0, 0.08)',
    },
    components: {
        Card: {
            defaultProps: {
                radius: 'lg',
                shadow: 'md',
                withBorder: false,
            },
        },
        Button: {
            defaultProps: {
                radius: 'lg',
            },
        },
        ThemeIcon: {
            defaultProps: {
                radius: 'lg',
            }
        }
    },
});
