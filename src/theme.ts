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
    components: {
        Card: {
            defaultProps: {
                radius: 'lg',
            },
        },
        Button: {
            defaultProps: {
                radius: 'lg',
            },
        },
        TextInput: {
            defaultProps: {
                radius: 'lg',
            },
        },
        Textarea: {
            defaultProps: {
                radius: 'lg',
            },
        },
    },
});
