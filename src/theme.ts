import { createTheme } from '@mantine/core';

export const theme = createTheme({
    primaryColor: 'darkBlue',
    fontFamily: 'Poppins, Inter, sans-serif',
    defaultRadius: 'sm', // Reduced from 'lg' to 'sm' for a sharper look
    headings: {
        fontFamily: 'Poppins, Inter, sans-serif',
        fontWeight: '700',
    },
    colors: {
        // Custom dark blue palette matching the header gradient #1e3c72
        darkBlue: [
            "#eef2ff",
            "#dce4f5",
            "#b9c7e2",
            "#94a8d0",
            "#748dc0",
            "#5f7cb6",
            "#5474b2",
            "#44619f",
            "#3b568d",
            "#2f4b7c"
        ] as any,
    },
    shadows: {
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    components: {
        Card: {
            defaultProps: {
                radius: 'sm',
                shadow: 'sm',
                withBorder: true,
            },
        },
        Paper: {
            defaultProps: {
                radius: 'sm',
            }
        },
        Button: {
            defaultProps: {
                radius: 'xs', // Sharper buttons
                fw: 600,
            },
        },
        TextInput: {
            defaultProps: {
                radius: 'xs',
            }
        },
        NumberInput: {
            defaultProps: {
                radius: 'xs',
            }
        },
        ThemeIcon: {
            defaultProps: {
                radius: 'md', // Keep icons slightly rounded but not full circle unless specified
            }
        }
    },
});
