export default function Spinner({ size = 16, className = "" }) {
    const dim = typeof size === 'number' ? `${size}px` : size;
    return (
        <span
            className={`inline-block animate-spin rounded-full border-2 border-white/30 border-t-white/90 ${className}`}
            style={{ width: dim, height: dim }}
            aria-label="loading"
        />
    );
}

