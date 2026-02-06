import { useEffect, useState } from 'react';

const METEOBLUE_URL = 'https://www.meteoblue.com/en/customer/headland/index?id=1000452';
const OPEN_METEO_URL =
	'https://api.open-meteo.com/v1/forecast?latitude=51.44&longitude=-0.82&current=temperature_2m,weather_code&format=json';

interface WeatherData {
	temperature: number;
	weatherCode: number;
}

// WMO weather code to icon (emoji) and label
const WEATHER_MAP: Record<number, { icon: string; label: string }> = {
	0: { icon: '☀️', label: 'Clear' },
	1: { icon: '🌤️', label: 'Mainly clear' },
	2: { icon: '⛅', label: 'Partly cloudy' },
	3: { icon: '☁️', label: 'Overcast' },
	45: { icon: '🌫️', label: 'Fog' },
	48: { icon: '🌫️', label: 'Fog' },
	51: { icon: '🌧️', label: 'Drizzle' },
	53: { icon: '🌧️', label: 'Drizzle' },
	55: { icon: '🌧️', label: 'Drizzle' },
	61: { icon: '🌧️', label: 'Rain' },
	63: { icon: '🌧️', label: 'Rain' },
	65: { icon: '🌧️', label: 'Rain' },
	71: { icon: '❄️', label: 'Snow' },
	73: { icon: '❄️', label: 'Snow' },
	75: { icon: '❄️', label: 'Snow' },
	80: { icon: '🌦️', label: 'Showers' },
	81: { icon: '🌦️', label: 'Showers' },
	82: { icon: '🌦️', label: 'Showers' },
	95: { icon: '⛈️', label: 'Thunderstorm' },
	96: { icon: '⛈️', label: 'Thunderstorm' },
	99: { icon: '⛈️', label: 'Thunderstorm' },
};

function getWeatherInfo(code: number) {
	return (
		WEATHER_MAP[code] ??
		(code >= 51 && code <= 67
			? { icon: '🌧️', label: 'Rain' }
			: code >= 71 && code <= 77
				? { icon: '❄️', label: 'Snow' }
				: code >= 80 && code <= 99
					? { icon: '🌦️', label: 'Showers' }
					: { icon: '☁️', label: 'Cloudy' })
	);
}

export default function WeatherWidget() {
	const [data, setData] = useState<WeatherData | null>(null);
	const [error, setError] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function fetchWeather() {
			try {
				const res = await fetch(OPEN_METEO_URL);
				if (!res.ok) throw new Error('Weather fetch failed');
				const json = await res.json();
				if (cancelled) return;
				setData({
					temperature: Math.round(json.current.temperature_2m),
					weatherCode: json.current.weather_code,
				});
			} catch {
				if (!cancelled) setError(true);
			}
		}

		fetchWeather();
		return () => {
			cancelled = true;
		};
	}, []);

	const isLoading = !data && !error;

	return (
		<a
			href={METEOBLUE_URL}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="View full weather forecast for Billingbear Park Golf Course"
			className="flex items-center gap-2 border-l border-white/10 pl-2 md:pl-6 lg:pl-10 shrink-0 hover:text-brand-gold transition-colors duration-300"
		>
			{isLoading && (
				<span className="opacity-70" aria-hidden>
					—°C
				</span>
			)}
			{error && (
				<span className="opacity-70 normal-case tracking-normal">
					Weather forecast
				</span>
			)}
			{data && (
				<>
					<span aria-hidden>{getWeatherInfo(data.weatherCode).icon}</span>
					<span className="font-bold">
						{data.temperature}°C
						<span className="hidden md:inline font-normal text-white/80 normal-case tracking-normal ml-1">
							· {getWeatherInfo(data.weatherCode).label}
						</span>
					</span>
					<span className="hidden lg:inline text-white/60 normal-case tracking-normal text-[9px] ml-1">
						→
					</span>
				</>
			)}
		</a>
	);
}
