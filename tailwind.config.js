import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "src/**/*.{js,ts,jsx,tsx}"),
  ],
  darkMode: ['class', "class"],
  theme: {
  	screens: {
  		xs: '375px',
  		sm: '640px',
  		md: '768px',
  		lg: '1024px',
  		xl: '1280px',
  		'2xl': '1536px'
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			lime: {
  				DEFAULT: 'hsl(var(--lime))',
  				foreground: 'hsl(var(--lime-foreground))'
  			},
  			streak: {
  				DEFAULT: 'hsl(var(--streak))',
  				foreground: 'hsl(var(--streak-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: 'var(--font-family-sans)',
  			display: 'var(--font-family-display)'
  		},
  		fontSize: {
  			xs: [
  				'var(--font-size-xs)',
  				{
  					lineHeight: 'var(--line-height-tight)'
  				}
  			],
  			sm: [
  				'var(--font-size-sm)',
  				{
  					lineHeight: '1.375'
  				}
  			],
  			base: [
  				'var(--font-size-base)',
  				{
  					lineHeight: 'var(--line-height-normal)'
  				}
  			],
  			lg: [
  				'var(--font-size-lg)',
  				{
  					lineHeight: 'var(--line-height-relaxed)'
  				}
  			],
  			xl: [
  				'var(--font-size-xl)',
  				{
  					lineHeight: 'var(--line-height-relaxed)'
  				}
  			],
  			'2xl': [
  				'var(--font-size-2xl)',
  				{
  					lineHeight: 'var(--line-height-tight)'
  				}
  			],
  			'3xl': [
  				'var(--font-size-3xl)',
  				{
  					lineHeight: 'var(--line-height-tight)'
  				}
  			],
  			'4xl': [
  				'var(--font-size-4xl)',
  				{
  					lineHeight: 'var(--line-height-tight)'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem',
  			'safe-bottom': 'env(safe-area-inset-bottom)',
  			'safe-top': 'env(safe-area-inset-top)'
  		},
  		maxWidth: {
  			content: '1120px',
  			session: '640px'
  		},
  		minHeight: {
  			'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '1rem',
  			'2xl': '1.5rem',
  			pill: '9999px'
  		},
  		boxShadow: {
  			soft: 'var(--shadow-soft)',
  			button: 'var(--shadow-button)'
  		},
  		backgroundImage: {
  			'hero-soft': 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.02) 50%, hsl(var(--background)) 100%)',
  			celebration: 'linear-gradient(135deg, hsl(var(--primary) / 0.05) 0%, hsl(var(--primary) / 0.1) 50%, hsl(var(--primary) / 0.1) 100%)',
  			'gradient-button': 'linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(var(--primary)) 100%)',
  			'gradient-primary': 'linear-gradient(to bottom right, hsl(var(--primary) / 0.5), hsl(var(--primary)))',
  			'gradient-success': 'linear-gradient(to bottom right, hsl(var(--success) / 0.5), hsl(var(--success)))',
  			'gradient-celebration-badge': 'linear-gradient(to bottom right, hsl(var(--success) / 0.5), hsl(var(--success)))'
  		},
  		keyframes: {
  			'bounce-in': {
  				'0%': {
  					transform: 'scale(0)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.2)'
  				},
  				'100%': {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'achievement-pop': {
  				'0%': {
  					transform: 'scale(0.5) rotate(-10deg)',
  					opacity: '0'
  				},
  				'50%': {
  					transform: 'scale(1.1) rotate(5deg)'
  				},
  				'100%': {
  					transform: 'scale(1) rotate(0deg)',
  					opacity: '1'
  				}
  			},
  			'confetti-fall': {
  				'0%': {
  					transform: 'translateY(-100vh) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(100vh) rotate(720deg)',
  					opacity: '0'
  				}
  			},
  			'confetti-1': {
  				'0%': {
  					transform: 'translateY(0) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(300px) translateX(-50px) rotate(360deg)',
  					opacity: '0'
  				}
  			},
  			'confetti-2': {
  				'0%': {
  					transform: 'translateY(0) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(300px) translateX(30px) rotate(-360deg)',
  					opacity: '0'
  				}
  			},
  			'confetti-3': {
  				'0%': {
  					transform: 'translateY(0) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(300px) translateX(50px) rotate(360deg)',
  					opacity: '0'
  				}
  			},
  			'confetti-4': {
  				'0%': {
  					transform: 'translateY(0) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(300px) translateX(-30px) rotate(-360deg)',
  					opacity: '0'
  				}
  			},
  			'confetti-5': {
  				'0%': {
  					transform: 'translateY(0) rotate(0deg)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(300px) translateX(10px) rotate(360deg)',
  					opacity: '0'
  				}
  			},
  			'bounce-up-fade': {
  				'0%': {
  					transform: 'translateY(0) scale(1)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'translateY(-100px) scale(1.5)',
  					opacity: '0'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					transform: 'translateY(10px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'bounce-in': 'bounce-in 0.6s ease-out forwards',
  			'achievement-pop': 'achievement-pop 0.5s ease-out forwards',
  			'confetti-fall': 'confetti-fall 3s ease-in forwards',
  			'confetti-1': 'confetti-1 2s ease-out forwards',
  			'confetti-2': 'confetti-2 2.2s ease-out forwards',
  			'confetti-3': 'confetti-3 1.8s ease-out forwards',
  			'confetti-4': 'confetti-4 2.1s ease-out forwards',
  			'confetti-5': 'confetti-5 1.9s ease-out forwards',
  			'bounce-up-fade': 'bounce-up-fade 1s ease-out forwards',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			'slide-up': 'slide-up 0.3s ease-out forwards',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		transitionDuration: {
  			'250': '250ms',
  			'350': '350ms'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
