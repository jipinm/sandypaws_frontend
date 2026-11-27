export default function StepProgress({ titles, current }) {
  return (
    <div className="mt-4 flex gap-2">
      {titles.map((title, i) => (
        <div key={title} className="flex-1">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${current > i ? 'bg-brand' : 'bg-line'}`} />
          <p className={`mt-1 text-xs ${current === i + 1 ? 'font-semibold' : 'text-mute'}`}>{i + 1}. {title}</p>
        </div>
      ))}
    </div>
  );
}
