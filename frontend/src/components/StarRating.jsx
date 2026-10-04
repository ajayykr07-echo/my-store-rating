export default function StarRating({
  value = 0,
  max = 5,
  onChange = null,
  readOnly = false,
  size = 20,
}) {
  const numericValue = Number(value) || 0;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {[...Array(max)].map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= Math.round(numericValue);

        return (
          <button
            key={starNumber}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (!readOnly && onChange) {
                onChange(starNumber);
              }
            }}
            style={{
              background: "none",
              border: "none",
              padding: "2px",
              cursor: readOnly ? "default" : "pointer",
              color: isFilled ? "var(--amber-500)" : "var(--gray-300)",
              fontSize: `${size}px`,
              lineHeight: 1,
              transition: "transform 0.1s, color 0.1s",
            }}
            title={readOnly ? `${value} stars` : `Rate ${starNumber} star${starNumber > 1 ? "s" : ""}`}
            aria-label={`${starNumber} star`}
          >
            ★
          </button>
        );
      })}
      {readOnly && (
        <span
          style={{
            marginLeft: "6px",
            fontSize: "14px",
            fontWeight: "600",
            color: "var(--text-h, var(--gray-800))",
          }}
        >
          {numericValue > 0 ? Number(numericValue).toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
}
