import { Playfair_Display, Lora, Source_Serif_4 } from 'next/font/google';

export const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});

export const lora = Lora({
    subsets: ['latin'],
    variable: '--font-body',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});

export const sourceSerif4 = Source_Serif_4({
    subsets: ['latin'],
    variable: '--font-serif',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
});
